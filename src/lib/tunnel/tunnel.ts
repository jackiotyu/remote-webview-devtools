import WebSocket, { WebSocketServer } from 'ws';
import type { AddressInfo } from 'ws';

const server = new WebSocketServer({
    host: '0.0.0.0',
    port: 0
});

server.setMaxListeners(1000);

export class CDPTunnel {
    private _server: WebSocketServer = server;
    private _client: WebSocket;
    private _socket?: WebSocket.WebSocket;
    constructor(debuggerLink: string) {
        this._client = new WebSocket(debuggerLink);
        this._server.once('connection', this.onConnect);
        this._server.once('close', this.onClose);
    }

    private onConnect = (ws: WebSocket.WebSocket) => {
        ws.on('error', (err) => {
            console.error(err);
            this._client.close();
        });
        ws.on('message', (data, isBinary) => {
            try {
                // console.log('server message', JSON.parse(data.toString()));
            } catch {}
            this._client.send(data, { binary: isBinary });
        });
        // let index = 100;
        this._client.onmessage = (event) => {
            try {
                // const data = JSON.parse(event.data.toString());
                // if(data.method === 'Debugger.scriptParsed') {
                //     const scriptId = data.params.scriptId;
                //     this._client.send(JSON.stringify({ id: index++, method: 'Debugger.getScriptSource', params: { scriptId } }));
                // }
                // console.log('client message', JSON.parse(event.data.toString()));
            } catch {}
            ws.send(event.data);
        };
        this._client.onclose = this.onClose;
        this._socket = ws;
    };

    onClose = () => {
        console.log('close connect');
        this._server.off('close', this.onClose);
        this._server.off('connection', this.onConnect);
        this._client?.terminate();
        this._socket?.terminate();
    };

    get port(): number {
        return (this._server.address() as AddressInfo)?.port;
    }

    get link() {
        return `127.0.0.1:${this.port}`;
    }
}

export function closeWsServer() {
    server.removeAllListeners();
    server.close();
}