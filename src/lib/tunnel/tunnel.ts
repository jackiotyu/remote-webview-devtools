import WebSocket, { WebSocketServer } from 'ws';
import { customAlphabet } from 'nanoid';
import { parse } from 'url';
import LiveScript, { OutModule } from './liveScript';
import { getTunnel } from '../event/tunnelEvent';
import type { AddressInfo } from 'ws';
import type { IncomingMessage } from 'http';
import type { CDPMessage } from '../../../protocol/flow';
import { StaticNodeType } from '@/constants';

const nanoid = customAlphabet('abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ', 10);

const server = new WebSocketServer({
    host: '0.0.0.0',
    port: 0,
});

server.setMaxListeners(1000);

export class CDPTunnel {
    private _server: WebSocketServer = server;
    private _backend: WebSocket;
    private _frontend?: WebSocket.WebSocket;
    private _id = nanoid();
    private _ws: string;
    private completeTarget: boolean = false;

    constructor(debuggerLink: string) {
        this._backend = new WebSocket(debuggerLink);
        this._server.once('connection', this.onConnect);
        this._server.once('close', this.onClose);
        this._ws = debuggerLink;
        this.registerTargetEvent();
    }

    private onConnect = (frontend: WebSocket.WebSocket, req: IncomingMessage) => {
        let location = parse(req.url || '');
        if (location.path !== this.path) {
            return;
        }
        frontend.on('error', (err) => {
            console.error(err);
            this._backend.close();
        });
        frontend.on('message', (data, isBinary) => {
            let intercept = this.triggerEvent(StaticNodeType.devtoolsEvent, JSON.parse(data.toString()));
            if (intercept) return;
            this._backend.send(data, { binary: isBinary });
        });
        this._backend.onmessage = (event) => {
            if (event.data && this.judgeIsCdpMessage(event.data)) {
                let intercept = this.triggerEvent(StaticNodeType.webviewEvent, event.data);
                if (intercept) return;
            }
            frontend.send(event.data);
        };
        this._backend.onclose = this.onClose;
        this._frontend = frontend;

    };

    judgeIsCdpMessage(message: any): message is CDPMessage {
        // TODO 暂时不校验太多属性
        return message && typeof message === 'object';
    }

    onClose = () => {
        this._server.off('close', this.onClose);
        this._server.off('connection', this.onConnect);
        this._backend?.terminate();
        this._frontend?.terminate();
        // TODO tunnel回收
    };

    triggerEvent(eventName: StaticNodeType, message: CDPMessage) {
        if(!this.completeTarget) this.registerTargetEvent();
        try {
            let tunnel = getTunnel(this._ws);
            if (!tunnel) return false;
            tunnel.trigger(eventName, message);
            return true;
        } catch(err) {
            console.log(err, 'CDPTunnel triggerEvent fail')
        }
        return false;
    }

    registerTargetEvent() {
        let tunnel = getTunnel(this._ws);
        if(!tunnel) return;
        tunnel.bindEvent(StaticNodeType.devtoolsInput, (message) => {
            console.log('devtools input', message);
            this._frontend?.send(JSON.stringify(message));
        });
        tunnel.bindEvent(StaticNodeType.webviewInput, (message) => {
            console.log('webview input', message);
            this._backend.send(JSON.stringify(message));
        });
        this.completeTarget = true;
    }

    get port(): number {
        return (this._server.address() as AddressInfo)?.port;
    }
    get path() {
        return `/${this._id}`;
    }
    get link() {
        return `127.0.0.1:${this.port}${this.path}`;
    }
}

export function closeWsServer() {
    server.removeAllListeners();
    server.close();
}
