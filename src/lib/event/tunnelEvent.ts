import * as vscode from 'vscode';

type FromType = 'frontend' | 'backend' | 'middleware' | 'cdp';

interface TunnelPayload {
    from: FromType,
    id: string;
    data: Record<string, any>;
}

class TunnelEvent {
    private frontend = new vscode.EventEmitter<TunnelPayload>();
    private backend = new vscode.EventEmitter<TunnelPayload>();
    private middleware = new vscode.EventEmitter<TunnelPayload>();
    private cdp = new vscode.EventEmitter<TunnelPayload>();
    register(type: FromType, listener: (event: TunnelPayload) => void) {
        switch(type) {
            case 'backend':
                this.backend.event(listener);
                break;
            case 'frontend':
                this.frontend.event(listener);
                break;
            case 'middleware':
                this.middleware.event(listener);
                break;
            case 'cdp':
                this.cdp.event(listener);
        }
    }
    getDisposables() {
        return [
            this.backend,
            this.middleware,
            this.frontend,
            this.cdp,
        ]
    }
}

export default new TunnelEvent();