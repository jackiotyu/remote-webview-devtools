import * as vscode from 'vscode';
import GlobalStorage from '../adaptor/globalStorage';
import { ScriptModule, CDPMessage, ModuleType } from '../../../protocol/flow';
import { compilerFlow, compilerScript } from '../compiler/compiler';
import { SourceNodeSet, TargetNodeSet, NormalNodeType, StaticNodeType } from '../../constants'

type CDPPayload = CDPMessage;

type EventInstance = InstanceType<typeof vscode.EventEmitter<CDPPayload>>;

export const deployEvent = new vscode.EventEmitter<string>();

export class TunnelEvent {
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

type NodeList = { id: string, uid: UidType; source?: string; target?: string, sid?: string }[];

type ScriptNode = { id: string, uid: UidType, sid: string, use: ModuleType };

const tunnelEventMap = new Map<string, TunnelEvent>();

function getScriptId (node: { sid: string; use: string }) {
    return node.sid + '.' + node.use;
}

// TODO 处理flow
export function reduceChain(list: NodeList, tunnelEvent: TunnelEvent) {
    try {
        let processList = list.filter(i => i.uid);
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
            tunnelEvent.register(item.uid);
        });

        let targetNodes = processList.filter(item => {
            return TargetNodeSet.has(item.uid);
        });

        targetNodes.forEach(item => {
            tunnelEvent.register(item.uid);
        })

        linkNodes.forEach((linkNode) => {
            // XXX uid和id不同, linkNode使用的都是id
            let source = linkNode.source as string;
            let target = linkNode.target as string;
            let sourceNode = allNodeMap.get(source) as ScriptNode;
            let targetNode = allNodeMap.get(target) as ScriptNode;
            if (!sourceNode) return;
            if (!targetNode) return;

            let fire = (message: CDPPayload | void) => {
                tunnelEvent.trigger(targetNode!.uid, message);
            };
            tunnelEvent.bindEvent(sourceNode.uid, (message) => {
                if(sourceNode.sid) {
                    let module = compilerScript(getScriptId(sourceNode));
                    // TODO 注册回调
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
                    tunnelEvent.trigger(item.uid, message);
                };
                module.default.trigger?.(fire);
            }
        });

        // TODO webview接收事件
    } catch (err) {
        console.log('reduceChain', err);
    }
}

export function createTunnelEvent(webSocketDebuggerUrl: string) {
    let tunnelEvent = tunnelEventMap.get(webSocketDebuggerUrl);
    if (tunnelEvent) return tunnelEvent;
    tunnelEvent = new TunnelEvent(webSocketDebuggerUrl);
    tunnelEventMap.set(webSocketDebuggerUrl, tunnelEvent);
    return tunnelEvent;
}

export class Tunnel {
    private id: string;
    private flow: string;
    private tunnelEvent: TunnelEvent;
    private disposables: vscode.Disposable[] = [];
    constructor(id: string, flow: string) {
        this.id = id;
        this.flow = flow;
        this.tunnelEvent = createTunnelEvent(id);
        this.initEvent();
    }
    trigger(eventName: string, message: CDPPayload | void) {
        this.tunnelEvent.trigger(eventName, message);
    }
    bindEvent(eventName: string, handler: (message: CDPMessage) => void ) {
        this.tunnelEvent.bindEvent(eventName, handler);
    }
    async initEvent() {
        try {
            this.tunnelEvent.dispose();
            let nodeStr = GlobalStorage.getFlow(this.flow);
            let nodes: NodeList | undefined = JSON.parse(nodeStr);
            if (!nodes) return;
            if (!Array.isArray(nodes)) return;
            let success = await compilerFlow(this.flow);
            if(!success) return;
            reduceChain(nodes, this.tunnelEvent);
            this.dispose();
            this.disposables.push(
                // TODO 监听部署事件
                deployEvent.event((id) => {
                    if (id === this.flow) {
                        this.initEvent();
                    }
                }),
            );
            vscode.window.showInformationMessage(`flow: [ ${this.flow} ] 部署成功`);
        } catch {}
    }
    dispose() {
        this.disposables.forEach(item => item.dispose());
        this.disposables = [];
    }
}

export const tunnelMap = new Map<string, Tunnel>();

export function createTunnel(webSocketDebuggerUrl: string, flow: string) {
    let tunnel = tunnelMap.get(webSocketDebuggerUrl);
    if (tunnel) return tunnel;
    tunnel = new Tunnel(webSocketDebuggerUrl, flow);
    tunnelMap.set(webSocketDebuggerUrl, tunnel);
    return tunnel;
}

export function getTunnel(webSocketDebuggerUrl: string) {
    return tunnelMap.get(webSocketDebuggerUrl);
}

export default tunnelEventMap;
