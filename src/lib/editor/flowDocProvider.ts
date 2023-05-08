import * as vscode from 'vscode';
import { nanoid } from 'nanoid';
import { FLOW_EDITOR, FlowWebviewMethod } from '../../constants';
import type { FlowWebviewPayload } from '../../constants';
import outputChannel from '../output/outputChannel';
import GlobalStorage from '../adaptor/globalStorage';
import fs from 'fs-extra'

export class FlowDocProvider implements vscode.CustomTextEditorProvider {
    public static readonly viewType = FLOW_EDITOR;
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
                vscode.Uri.joinPath(this.context.extensionUri, 'web-flow'),
                vscode.Uri.joinPath(this.context.globalStorageUri),
            ]
        };
        webviewPanel.webview.html = this.getHtmlForWebview(webviewPanel);

        function updateWebview() {
            webviewPanel.webview.postMessage({
                type: 'update',
                data: document.getText(),
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
            console.log(e, 'message');
            switch (e.type) {
                case FlowWebviewMethod.log:
                    outputChannel.printDebug(e.data);
                    return;
                case FlowWebviewMethod.edit:
                    this.updateTextDocument(document, e.data);
                    return;
                case FlowWebviewMethod.openEdit:
                    this.openEdit(e.data);
                    return;
                case FlowWebviewMethod.showInfo:
                    this.showInfo(e.data);
                    return;
            }
        });
        setTimeout(() => {
            updateWebview();
        }, 500)
    }

    async showInfo(data: FlowWebviewPayload.showInfo) {
        vscode.window.showInformationMessage(data);
    }

    async openEdit(data: FlowWebviewPayload.openEdit) {
        let { name, use } = data;
        let content = GlobalStorage.existsScript(name)
            ? GlobalStorage.getScript(name)
            : GlobalStorage.getScriptTpl(use);
        GlobalStorage.setScript(name, content);
        let scriptPath = GlobalStorage.getScriptPath(name);
        let doc = await vscode.workspace.openTextDocument(scriptPath);
        vscode.window.showTextDocument(doc, {preserveFocus: false, viewColumn: vscode.ViewColumn.Two});
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
        fs.writeFile(document.uri.fsPath, JSON.stringify(json));
        // const edit = new vscode.WorkspaceEdit();
        // // 替换所有数据
        // edit.replace(document.uri, new vscode.Range(0, 0, document.lineCount, 0), JSON.stringify(json, null, 2));
        // Promise.resolve().then(() => vscode.workspace.applyEdit(edit))
        // ;
    }
}

export default class FlowDocRegister {
    constructor(context: vscode.ExtensionContext) {
        context.subscriptions.push(
            vscode.window.registerCustomEditorProvider(
                FlowDocProvider.viewType,
                new FlowDocProvider(context),
                {
                    webviewOptions: {
                        retainContextWhenHidden: true,
                    }
                }
            ),
        );
    }
}
