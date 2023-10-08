import * as vscode from 'vscode';
import { getAddress } from './resourceServer';
import { CDPTunnel } from './tunnel/tunnel';
import { isUndefined } from '../utils/index';

interface ViewOptions {
    title: string;
    ws: string;
}

const webviewMap = new Map<string, vscode.WebviewPanel>();

function getViewTitle(options: ViewOptions) {
    return options.title;
}

export class FrontEndWebviewProvider {
    private panel: vscode.WebviewPanel;
    private viewType = 'RemoteWebviewDevtools';
    private options: ViewOptions;
    private title: string;
    private tunnel: CDPTunnel;
    private frontEndPath: string;
    private scriptSrc: string;
    constructor(context: vscode.ExtensionContext, options: ViewOptions) {
        this.title = getViewTitle(options);
        this.options = options;
        const resourceUri = vscode.Uri.joinPath(context.extensionUri, 'web');
        this.panel = vscode.window.createWebviewPanel(
            this.viewType,
            this.title,
            vscode.ViewColumn.One,
            {
                enableScripts: true,
                enableFindWidget: true,
                retainContextWhenHidden: true,
                localResourceRoots: [
                    resourceUri,
                ]
            }
        );
        this.panel.iconPath = vscode.Uri.joinPath(context.extensionUri, 'images/icon.png');

        this.scriptSrc = this.panel.webview.asWebviewUri(vscode.Uri.joinPath(resourceUri, 'index.js')).toString();

        const address = getAddress(context);
        this.frontEndPath = `${address}/inspector.html`;
        this.tunnel = new CDPTunnel(this.options.ws);
        this.panel.webview.html = this.getWebviewContent();
        this.panel.webview.onDidReceiveMessage(this.onDidReceiveMessage, this)

        webviewMap.set(options.ws, this.panel);
        let dispose = this.panel.onDidDispose(() => {
            this.tunnel.onClose();
            webviewMap.delete(options.ws);
            dispose.dispose();
        });
    }

    get panelInstance() {
        return this.panel;
    }

    onDidReceiveMessage(e: any) {
        if(!e?.command) return;
        switch(e.command) {
            case 'openInNewTab':
                vscode.env.openExternal(vscode.Uri.parse(e.data));
                break;
        }
    }

    getWebviewContent() {
        const { tunnel, panel, frontEndPath, scriptSrc } = this;

        return `
            <!DOCTYPE html>
            <html lang="en">
            <head>
            <meta charset="UTF-8">
                <meta http-equiv="content-type" content="text/html; charset=utf-8">
                <meta name="referrer" content="no-referrer">
                <meta http-equiv="Content-Security-Policy" content="default-src * self blob: data: gap:; style-src * self 'unsafe-inline' blob: data: gap:; script-src * 'self' 'unsafe-eval' 'unsafe-inline' blob: data: gap:; object-src * 'self' blob: data: gap:; img-src * self 'unsafe-inline' blob: data: gap:; connect-src self * 'unsafe-inline' blob: data: gap:; frame-src * self blob: data: gap:; connect-src * self data: gap:;">
                <style>
                .devtools-frame {
                    flex: 1;
                }
                </style>
                <script src="${scriptSrc}"></script>
            </head>
            <body style="width: 100vw;height: 100vh;padding: 4px 0 0;margin: 0;display: flex;box-sizing: border-box;">
                <iframe class="devtools-frame" frameBorder="0" src="${frontEndPath}?ws=${tunnel.link}" allow="clipboard-read; clipboard-write self ${frontEndPath}"></iframe>
            </body>
            </html>
        `;
    }
}

export class FrontEndWebview {
    panel: vscode.WebviewPanel;
    constructor(context: vscode.ExtensionContext, options: ViewOptions) {
        const panel = webviewMap.get(options.ws);
        if(!isUndefined(panel)) {
            // 选中窗口
            panel.reveal(undefined, true);
            this.panel = panel;
            return;
        }
        this.panel = new FrontEndWebviewProvider(context, options).panelInstance;
    }
}

export function deleteFrontEndWebview(ws: string) {
    let webView = webviewMap.get(ws);
    if(!webView) return;
    webView.dispose();
    webviewMap.delete(ws);
}