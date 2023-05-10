import { WebSocket } from 'ws';

interface TunnelItem {
    backend: WebSocket;
    frontend: WebSocket;
}

export class TunnelStore {
    static socketStore = new Map<string, TunnelItem>();
    static setTunnel(webSocketDebuggerUrl: string, tunnel: TunnelItem) {
        TunnelStore.socketStore.set(webSocketDebuggerUrl, tunnel);
    }
    static getTunnelByWs(webSocketDebuggerUrl: string) {
        return TunnelStore.socketStore.get(webSocketDebuggerUrl);
    }
    static clear() {
        TunnelStore.socketStore.clear();
    }
}
