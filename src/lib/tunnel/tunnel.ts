import WebSocket, { WebSocketServer } from 'ws';
import type { AddressInfo } from 'ws';

const server = new WebSocketServer({
    port: 9066,
    host: '0.0.0.0',
});

export class CDPTunnel {
    private _server: WebSocketServer;
    private _client: WebSocket;
    private _socket?: WebSocket.WebSocket;
    constructor(debuggerLink: string) {
        this._client = new WebSocket(debuggerLink);
        this._server = server;
        this._server.on('connection', this.onConnect);
        this._server.on('close', this.onClose);
    }

    private onConnect = (ws: WebSocket.WebSocket) => {
        ws.on('error', (err) => {
            console.error(err);
            this._client.close();
        });
        ws.on('message', (data, isBinary) => {
            // try {
            //     console.log('server message', JSON.parse(data.toString()));
            // } catch {}
            this._client.send(data, { binary: isBinary });
        });
        this._client.onmessage = (event) => {
            ws.send(event.data);
        };
        this._client.onclose = this.onClose;
        this._socket = ws;
    };

    onClose = () => {
        console.log('close connect');
        this._server.off('close', this.onClose);
        this._server.off('connection', this.onConnect);
        this._client?.close();
        this._socket?.close();
    };

    get port(): number {
        return (this._server.address() as AddressInfo)?.port;
    }

    get link() {
        return `127.0.0.1:${this.port}`;
    }
}
