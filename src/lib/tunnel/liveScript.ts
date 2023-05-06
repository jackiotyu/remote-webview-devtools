/* eslint-disable @typescript-eslint/naming-convention */
import * as vscode from 'vscode';
import vm from 'node:vm';
import URL from 'url';
import { WebSocket } from 'ws';
// import Protocol from 'devtools-protocol/types/protocol';
import { editorEvent } from '../event/editorEvent';


/** 导出连接函数给tunnel使用 */
export interface OutModule {
    connect?: (frontend: WebSocket, backend: WebSocket) => any;
    backendReceive?: (frontend: WebSocket, backend: WebSocket, message: any) => any;
    frontendReceive?: (frontend: WebSocket, backend: WebSocket, message: any) => any;
    /** 断开连接时调用 */
    dispose?: () => void;
}

class OutModuleFactory implements OutModule {
    private _outModule: OutModule = {};
    ws: string;
    event: vscode.Disposable;
    constructor(ws: string) {
        this.ws = ws;
        this.event = editorEvent.event((info) => {
            // 根据websocket链接判断
            if (info.ws !== this.ws || !info.active) return;
            // 从连接的文档中获取
            this._outModule = this.genModule(info.code);
        });
    }
    private genModule(code: string) {
        let out: OutModule = {};
        const context = vm.createContext({
            require,
            out,
            console,
            URL,
        });
        vm.runInContext(code, context);
        return out;
    }
    get connect() {
        return this._outModule.connect;
    }
    get backendReceive() {
        return this._outModule.backendReceive;
    }
    get frontendReceive() {
        return this._outModule.frontendReceive;
    }
    dispose() {
        this._outModule.dispose?.();
        this._outModule = {};
        this.event.dispose();
    }
}

export default class LiveScript {
    static genModule(ws: string) {
        return new OutModuleFactory(ws);
    }
}
