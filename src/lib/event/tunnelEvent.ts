import * as vscode from 'vscode';
import {  } from 'node:vm';
import { ScriptModule, CDPMessage } from '../../../protocol/flow';

type CDPPayload = CDPMessage;

type EventInstance = InstanceType<typeof vscode.EventEmitter<CDPPayload>>;

export default class TunnelEvent {
    private static context: vscode.ExtensionContext;
    private static eventMap: Map<string, EventInstance> = new Map();
    static init(context: vscode.ExtensionContext) {
        this.context = context;
        this.context.subscriptions.push({ dispose: this.dispose });
    }
    /** 注册事件 */
    static register(eventName: string) {
        this.eventMap.set(eventName, new vscode.EventEmitter<CDPPayload>());
    }
    /** 绑定事件回调 */
    static bindEvent(eventName: string, callback: (message: CDPPayload) => CDPPayload | void) {
        let event = this.eventMap.get(eventName);
        if (!event) {
            this.register(eventName);
            event = this.eventMap.get(eventName) as EventInstance;
        }
        event.event(callback);
    }
    /** 触发消息执行 */
    static trigger(eventName: string, message: CDPPayload | void) {
        if (!message) return;
        this.eventMap.get(eventName)?.fire(message);
    }
    static dispose = () => {
        this.eventMap.forEach((item) => item.dispose());
        this.eventMap.clear();
    };
}

type NodeList = { uid: string; source?: string; target?: string }[];

export function reduceChain(list: NodeList) {
    let allNodeMap = new Map(list.map((item) => [item.uid, item]));
    // 找到数据源节点
    let sourceNodes: NodeList = [];
    list = list.filter((item) => {
        if (['data'].includes(item.uid)) {
            sourceNodes.push(item);
            return false;
        }
        return true;
    });
    let linkNodes: NodeList = [];
    list = list.filter((item) => {
        if (['link'].includes(item.uid)) {
            linkNodes.push(item);
            return false;
        }
        return true;
    });
    sourceNodes.forEach((item) => {
        TunnelEvent.register(item.uid);
    });
    linkNodes.forEach((linkNode) => {
        let source = linkNode.source as string;
        let target = linkNode.target as string;
        let sourceNode = allNodeMap.get(source);
        let targetNode = allNodeMap.get(target);
        if (!sourceNode) return;
        if (!targetNode) return;
        TunnelEvent.bindEvent(sourceNode.uid, (message) => {
            type TriggerType =  (message: CDPPayload, fire: (message: CDPPayload | void) => any) => any

            // TODO 注册回调
            let module: { trigger: TriggerType } = { trigger: (message, fire) => message };

            let fire = (message: CDPPayload | void) => {
                TunnelEvent.trigger(targetNode!.uid, message);
            };
            module.trigger(message, fire);
        });
    });

    sourceNodes.forEach(item => {
        if(item.uid === 'autostart') {
            let module: ScriptModule.Source = { from: (fire) => {} }
            let fire = (message: CDPMessage) => {
                TunnelEvent.trigger(item.uid, message);
            }
            module.from(fire)
        }
    })

    // 暴露trigger给数据源使用
    // let next = (message) => TunnelEvent.trigger(source.uid, message);
    // sourceModule.next(message, next)
}
