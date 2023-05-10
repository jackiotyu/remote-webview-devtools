import * as vscode from 'vscode';
import { nanoid } from 'nanoid';
import { FLOW_EDITOR, FlowWebviewMethod } from '../../constants';
import type { FlowWebviewPayload } from '../../constants';
import outputChannel from '../output/outputChannel';
import GlobalStorage from '../adaptor/globalStorage';
import { deployEvent, unlinkEvent, getTunnelByFlow } from '../event/tunnelEvent'
import fs from 'fs-extra';
import path from 'path';

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
                vscode.Uri.joinPath(this.context.extensionUri, 'dist-web-flow'),
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
            switch (e.type) {
                case FlowWebviewMethod.log:
                    outputChannel.showDebugChannel();
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
                case FlowWebviewMethod.deploy:
                    this.deploy(document);
                    return;
                case FlowWebviewMethod.unlinkAll:
                    this.unlinkAll(document);
            }
        });
        setTimeout(() => {
            updateWebview();
        }, 500)
    }

    getFlowName(document: vscode.TextDocument) {
        let filePath = document.uri.fsPath
        let flowName = filePath.split(path.sep).pop()!.split('.').shift();
        return flowName;
    }

    unlinkAll(document: vscode.TextDocument) {
        let flowName = this.getFlowName(document);
        if(!flowName) return;
        if(!getTunnelByFlow(flowName)){
            vscode.window.showErrorMessage('当前未连接任何devtools');
            return;
        }
        unlinkEvent.fire(flowName);
    }

    async deploy(document: vscode.TextDocument) {
        let flowName = this.getFlowName(document);
        if(!flowName) return;
        deployEvent.fire(flowName);
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
        let nonce = panel.webview.cspSource;
        let styleCsp: string = panel.webview.cspSource;
        let imgCsp: string = panel.webview.cspSource;
        let connectScp = ';';

        let scriptUri: vscode.Uri | string = panel.webview.asWebviewUri(vscode.Uri.joinPath(this.context.extensionUri, 'dist-web-flow/static/js', 'index.js'));
        let styleUri: vscode.Uri | string = panel.webview.asWebviewUri(vscode.Uri.joinPath(this.context.extensionUri, 'dist-web-flow/static/css', 'index.css'));

        if(process.env.NODE_ENV !== 'production') {
            const scriptHost = `http://localhost:5173`;
            scriptUri = `${scriptHost}/src/main.ts`;
            hotScript = `<script type="module" src="${scriptHost}/@vite/client"></script>`;
            nonce = 'http://localhost:5173';
            styleCsp = nonce;
            imgCsp = nonce;
            connectScp = 'connect-src ws://localhost:5173;'
            styleUri = ''
        }

        return `
            <!DOCTYPE html>
            <html lang="en">
            <head>
                <meta charset="UTF-8">
                <meta http-equiv="content-type" content="text/html; charset=utf-8">
                <meta name="referrer" content="no-referrer">
                <meta http-equiv="Content-Security-Policy" content="default-src 'none'; img-src ${imgCsp}; style-src 'self' 'unsafe-inline' ${styleCsp}; script-src ${nonce}; ${connectScp}">
                ${hotScript}
                <link rel="stylesheet" href="${styleUri}">
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
