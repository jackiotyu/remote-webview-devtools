import WebSocket, { WebSocketServer } from 'ws';
import { nanoid } from 'nanoid';
import { parse } from 'url';
import type { AddressInfo } from 'ws';
import type { IncomingMessage } from 'http';

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
    constructor(debuggerLink: string) {
        this._backend = new WebSocket(debuggerLink);
        this._server.once('connection', this.onConnect);
        this._server.once('close', this.onClose);
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
            this._backend.send(data, { binary: isBinary });
        });
        this._backend.onmessage = (event) => {
            frontend.send(event.data);
        };
        this._backend.onclose = this.onClose;
        this._frontend = frontend;
        // TODO 引入
    };

    onClose = () => {
        console.log('close connect');
        this._server.off('close', this.onClose);
        this._server.off('connection', this.onConnect);
        this._backend?.terminate();
        this._frontend?.terminate();
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
