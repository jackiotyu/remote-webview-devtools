import * as vscode from 'vscode';
import GlobalStorage from '../adaptor/globalStorage';
import { CDPMessage, ModuleType } from '../../../protocol/flow';
import { compilerFlow, compilerScript } from '../compiler/compiler';
import { SourceNodeSet, TargetNodeSet, NormalNodeType, StaticNodeType } from '../../constants';

type CDPPayload = CDPMessage;

type EventInstance = InstanceType<typeof vscode.EventEmitter<CDPPayload>>;

export const deployEvent = new vscode.EventEmitter<string>();

export const unlinkEvent = new vscode.EventEmitter<string>();

export const tunnelMap = new Map<string, Tunnel>();

/**
 * webSocketDebuggerUrl -> flow
 */
type WebSocketDebuggerUrl = string;
type Flow = string;
export const linkMap = new Map<WebSocketDebuggerUrl, Flow>();

// 监听部署事件
deployEvent.event((id) => {
    vscode.window.withProgress({ location: vscode.ProgressLocation.Notification }, async (progress) => {
        let tunnel = tunnelMap.get(id);
        if (tunnel) {
            progress.report({ message: '部署中' });
            await tunnel.initEvent();
            progress.report({ message: '部署成功' });
        } else {
            vscode.window.showErrorMessage('当前没有绑定devtools');
        }
    });
});

class SocketEvent {
    public id: string;
    private eventMap: Map<string, EventInstance> = new Map();
    constructor(id: string) {
        this.id = id;
    }
    /** 注册事件 */
    register(eventName: string) {
        this.eventMap.set(eventName, new vscode.EventEmitter<CDPPayload>());
    }
    /** 绑定事件回调 */
    bindEvent(eventName: string, callback: (message: CDPPayload) => CDPPayload | void) {
        let event = this.eventMap.get(eventName);
        if (!event) {
            this.register(eventName);
            event = this.eventMap.get(eventName) as EventInstance;
        }
        event.event(callback);
    }
    /** 触发消息执行 */
    trigger(eventName: string, message: CDPPayload | void) {
        if (!message) return;
        this.eventMap.get(eventName)?.fire(message);
    }
    getEvent(eventName: string) {
        return this.eventMap.get(eventName);
    }
    dispose = () => {
        this.eventMap.forEach((item) => item.dispose());
        this.eventMap.clear();
    };
}

type UidType = NormalNodeType | StaticNodeType;

type NodeList = { id: string; uid: UidType; source?: string; target?: string; sid?: string }[];

type ScriptNode = { id: string; uid: UidType; sid: string; use: ModuleType };

const eventMap = new Map<string, SocketEvent>();

function getScriptId(node: { sid: string; use: string }) {
    return node.sid + '.' + node.use;
}

/**
 * 处理flow
 * @param list
 * @param socketEvent
 */
export function reduceChain(list: NodeList, socketEvent: SocketEvent) {
    try {
        let processList = list.filter((i) => i.uid);
        let allNodeMap = new Map(processList.map((item) => [item.id, item]));
        // 找到数据源节点
        let sourceNodes: NodeList = [];
        processList = processList.filter((item) => {
            if (SourceNodeSet.has(item.uid)) {
                sourceNodes.push(item);
                return false;
            }
            return true;
        });
        let linkNodes: NodeList = [];
        list.filter((item) => {
            if (item.source && item.target) {
                linkNodes.push(item);
                return false;
            }
            return true;
        });
        sourceNodes.forEach((item) => {
            socketEvent.register(item.uid);
        });

        let targetNodes = processList.filter((item) => {
            return TargetNodeSet.has(item.uid);
        });

        targetNodes.forEach((item) => {
            socketEvent.register(item.uid);
        });

        linkNodes.forEach((linkNode) => {
            // XXX uid和id不同, linkNode使用的都是id
            let source = linkNode.source as string;
            let target = linkNode.target as string;
            let sourceNode = allNodeMap.get(source) as ScriptNode;
            let targetNode = allNodeMap.get(target) as ScriptNode;
            if (!sourceNode) return;
            if (!targetNode) return;

            let fire = (message: CDPPayload | void) => {
                socketEvent.trigger(targetNode!.uid, message);
            };
            let module = compilerScript(getScriptId(sourceNode));
            socketEvent.bindEvent(sourceNode.uid, (message) => {
                if (sourceNode.sid) {
                    if (!module.default) {
                        module = compilerScript(getScriptId(sourceNode));
                    }
                    // 注册回调
                    module.default.trigger?.(message, fire);
                } else {
                    fire(message);
                }
            });
        });

        sourceNodes.forEach((item) => {
            if (item.uid === NormalNodeType.cdp) {
                let module = compilerScript(getScriptId(item as ScriptNode));
                let fire = (message: CDPMessage) => {
                    socketEvent.trigger(item.uid, message);
                };
                module.default.trigger?.(fire);
            }
        });
    } catch (err) {
        console.error('reduceChain', err);
    }
}

function createSocketEvent(webSocketDebuggerUrl: string) {
    let tunnelEvent = eventMap.get(webSocketDebuggerUrl);
    if (tunnelEvent) return tunnelEvent;
    tunnelEvent = new SocketEvent(webSocketDebuggerUrl);
    eventMap.set(webSocketDebuggerUrl, tunnelEvent);
    return tunnelEvent;
}

export class Tunnel {
    private flow: string;
    private disposables: vscode.Disposable[] = [];
    constructor(flow: string) {
        this.flow = flow;
    }
    trigger(webSocketDebuggerUrl: string, eventName: string, message: CDPPayload | void) {
        let socketEvent = eventMap.get(webSocketDebuggerUrl);
        socketEvent?.trigger(eventName, message);
    }
    bindEvent(webSocketDebuggerUrl: string, eventName: string, handler: (message: CDPMessage) => void) {
        let socketEvent = eventMap.get(webSocketDebuggerUrl);
        socketEvent?.bindEvent(eventName, handler);
    }
    async initEvent() {
        try {
            this.dispose();
            let nodeStr = GlobalStorage.getFlow(this.flow);
            let nodes: NodeList | undefined | Record<string, any> = JSON.parse(nodeStr);
            if (!nodes) return;
            if (!Array.isArray(nodes)) return;
            let success = await compilerFlow(this.flow);
            if (!success) return;

            this.disposables.push(
                unlinkEvent.event((flow) => {
                    if (flow === this.flow) {
                        vscode.window.withProgress(
                            {
                                location: vscode.ProgressLocation.Notification,
                            },
                            async (progress) => {
                                progress.report({ message: '断开连接中' });
                                try {
                                    this.deleteAllEvent();
                                } catch (err) {
                                    vscode.window.showErrorMessage('发生错误,' + err);
                                }
                            },
                        );
                    }
                }),
            );

            this.forEachEvent((webSocketDebuggerUrl) => {
                console.log('添加节点事件', webSocketDebuggerUrl);
                let socketEvent = createSocketEvent(webSocketDebuggerUrl);
                reduceChain([...(nodes as NodeList)], socketEvent);
            });
            vscode.window.showInformationMessage(`flow: [ ${this.flow} ] 部署成功`);
        } catch {}
    }
    forEachEvent(callback: (webSocketDebuggerUrl: string) => void) {
        linkMap.forEach((flow, webSocketDebuggerUrl) => {
            if (flow === this.flow) {
                callback(webSocketDebuggerUrl);
            }
        });
    }
    dispose() {
        this.disposables.forEach((item) => item.dispose());
        this.disposables = [];
        this.deleteAllEvent();
    }
    deleteAllEvent() {
        this.forEachEvent((webSocketDebuggerUrl) => {
            eventMap.get(webSocketDebuggerUrl)?.dispose();
            eventMap.delete(webSocketDebuggerUrl);
        });
    }
    checkDispose(webSocketDebuggerUrl: string) {
        linkMap.delete(webSocketDebuggerUrl);
        if (!new Set([...linkMap.values()]).has(this.flow)) {
            this.dispose();
            tunnelMap.delete(this.flow);
            console.log('清除所有事件');
        }
    }
}

export function createTunnel(webSocketDebuggerUrl: string, flow: string) {
    let tunnel = tunnelMap.get(flow) || new Tunnel(flow);
    linkMap.set(webSocketDebuggerUrl, flow);
    tunnelMap.set(flow, tunnel);
    tunnel.initEvent();
    return tunnel;
}

export function getTunnelByFlow(flow: string) {
    return tunnelMap.get(flow);
}

export function getTunnelByWs(webSocketDebuggerUrl: string) {
    let flow = linkMap.get(webSocketDebuggerUrl);
    if (flow) return tunnelMap.get(flow);
}

export default eventMap;
