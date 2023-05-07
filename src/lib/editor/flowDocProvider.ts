import * as vscode from 'vscode';
import { nanoid } from 'nanoid';
import { FLOW_EDITOR } from '../../constants';

export class FlowDocProvider implements vscode.CustomTextEditorProvider {
    private static readonly viewType = FLOW_EDITOR;
    private context: vscode.ExtensionContext;
    constructor(context: vscode.ExtensionContext) {
        this.context = context;
    }

    resolveCustomTextEditor(
        document: vscode.TextDocument,
        webviewPanel: vscode.WebviewPanel,
        token: vscode.CancellationToken,
    ): void | Thenable<void> {
        webviewPanel.webview.options = {
            enableScripts: true,
            localResourceRoots: [
                vscode.Uri.joinPath(this.context.extensionUri, 'web-flow')
            ]
        };
        webviewPanel.webview.html = this.getHtmlForWebview(webviewPanel);

        function updateWebview() {
            webviewPanel.webview.postMessage({
                type: 'update',
                text: document.getText(),
            });
        }

        const changeDocumentSubscription = vscode.workspace.onDidChangeTextDocument((e) => {
            if (e.document.uri.toString() === document.uri.toString()) {
                updateWebview();
            }
        });

        // 关闭webview时释放资源
        webviewPanel.onDidDispose(() => {
            changeDocumentSubscription.dispose();
        });

        // 从webview接收消息
        webviewPanel.webview.onDidReceiveMessage((e) => {
            switch (e.type) {
                case 'edit':
                    this.updateTextDocument(document, e.data);
                    return;
            }
        });

        updateWebview();
    }

    getHtmlForWebview(panel: vscode.WebviewPanel) {
        let hotScript: string = '';
        let nonce = `nonce-${nanoid()}`;
        let styleCsp: string = panel.webview.cspSource;
        let imgCsp: string = panel.webview.cspSource;
        let connectScp = '';

        const resourceRoot = vscode.Uri.joinPath(this.context.extensionUri, 'dist-web-flow/assets');

        let scriptUri: vscode.Uri | string = panel.webview.asWebviewUri(vscode.Uri.joinPath(this.context.extensionUri, 'dist-web-flow/assets/js', 'main.js'));



        if(process.env.NODE_ENV !== 'production') {
            const scriptHost = `http://localhost:5173`;
            scriptUri = `${scriptHost}/src/main.ts`;
            hotScript = `<script type="module" src="${scriptHost}/@vite/client"></script>`;
            nonce = 'http://localhost:5173';
            styleCsp = nonce;
            imgCsp = nonce;
            connectScp = 'connect-src ws://localhost:5173'
        }
        return `
            <!DOCTYPE html>
            <html lang="en">
            <head>
                <meta charset="UTF-8">
                <meta http-equiv="content-type" content="text/html; charset=utf-8">
                <meta name="referrer" content="no-referrer">
                <meta http-equiv="Content-Security-Policy" content="default-src 'none'; img-src ${imgCsp}; style-src 'self' 'unsafe-inline' ${styleCsp}; script-src ${nonce}; ${connectScp};">
                ${hotScript}
            </head>
            <body>
                <div id="app"></div>
                <script type="module" src="${scriptUri}"></script>
            </body>
            </html>
            `;
    }

    private updateTextDocument(document: vscode.TextDocument, json: any) {
        const edit = new vscode.WorkspaceEdit();
        // 替换所有数据
        edit.replace(document.uri, new vscode.Range(0, 0, document.lineCount, 0), JSON.stringify(json, null, 2));

        return vscode.workspace.applyEdit(edit);
    }
}

export default class FlowDocRegister {
    constructor(context: vscode.ExtensionContext) {
        context.subscriptions.push(
            vscode.window.registerCustomEditorProvider(FLOW_EDITOR, new FlowDocProvider(context)),
        );
    }
}
