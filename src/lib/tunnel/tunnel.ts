import WebSocket, { WebSocketServer } from 'ws';
import { customAlphabet } from 'nanoid';
import { parse } from 'url';
import LiveScript, { OutModule } from './liveScript';
import type { AddressInfo } from 'ws';
import type { IncomingMessage } from 'http';

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
    private _connectModule: OutModule;

    constructor(debuggerLink: string) {
        this._backend = new WebSocket(debuggerLink);
        this._server.once('connection', this.onConnect);
        this._server.once('close', this.onClose);
        this._connectModule = LiveScript.genModule(debuggerLink);
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
            if (this._connectModule.frontendReceive) {
                let intercept = this._connectModule.frontendReceive(frontend, this._backend, data);
                if (intercept) {
                    return;
                }
            }
            this._backend.send(data, { binary: isBinary });
        });
        this._backend.onmessage = (event) => {
            if (this._connectModule.backendReceive) {
                let intercept = this._connectModule.backendReceive(frontend, this._backend, event.data);
                if (intercept) {
                    return;
                }
            }
            frontend.send(event.data);
        };
        this._backend.onclose = this.onClose;
        this._frontend = frontend;
        if (this._connectModule.connect) {
            this._connectModule.connect(this._backend, this._frontend);
        }
    };

    onClose = () => {
        this._server.off('close', this.onClose);
        this._server.off('connection', this.onConnect);
        this._backend?.terminate();
        this._frontend?.terminate();
        this._connectModule.dispose?.();
    };

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
