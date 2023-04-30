import * as vscode from 'vscode';
import { getPort } from './resourceServer';

interface ViewOptions {
    title: string;
    ws: string;
}

const webviewMap = new Map();

function getViewTitle(options: ViewOptions) {
    return options.title + ' ' + options.ws;
}

export class FrontEndWebviewProvider {
    private panel: vscode.WebviewPanel;
    private context: vscode.ExtensionContext;
    private viewType = 'RemoteWebviewDevtools';
    private options: ViewOptions;
    private title: string;
    constructor(context: vscode.ExtensionContext, options: ViewOptions) {
        this.title =  getViewTitle(options);
        this.options = options;
        this.context = context;
        this.panel = vscode.window.createWebviewPanel(
            this.viewType,
            this.title,
            vscode.ViewColumn.One,
            {
                enableScripts: true,
            }
        );
        this.panel.webview.html = this.getWebviewContent();
        webviewMap.set(this.title, this.panel);
        this.panel.onDidDispose(() => {
            webviewMap.delete(this.title);
        });
    }

    getWebviewContent() {
        const { panel, context } = this;
        const port = getPort(context);
        const htmlPath = `http://127.0.0.1:${port}/devtools_app.html`;

        return `
            <!DOCTYPE html>
            <html lang="en">
            <head>
            <meta charset="UTF-8">
                <meta http-equiv="content-type" content="text/html; charset=utf-8">
                <meta name="referrer" content="no-referrer">
                <meta http-equiv="Content-Security-Policy"
                    content="default-src;
                    img-src 'self' data: ${panel.webview.cspSource};
                    style-src 'self' 'unsafe-inline' ${panel.webview.cspSource};
                    script-src 'self' 'unsafe-eval' ${panel.webview.cspSource};
                    frame-src 'self' ${panel.webview.cspSource} ${htmlPath};
                    connect-src 'self' data: ${panel.webview.cspSource};
                ">
                <title>Cat Coding</title>
                <style>
                body {
                    width: 100vw;
                    height: 100vh;
                    padding: 0;
                    margin: 0;
                    display: flex;
                }
                .devtools-frame {
                    flex: 1;
                }
                </style>
            </head>
            <body>
                <iframe class="devtools-frame" frameBorder="0" src="${htmlPath}?ws=${this.options.ws}"></iframe>
            </body>
            </html>
        `;
    }
}

export class FrontEndWebview {
    constructor(context: vscode.ExtensionContext, options: ViewOptions) {
        const title =getViewTitle(options);
        if(webviewMap.has(title)) {
            return webviewMap.get(title);
        }
        return new FrontEndWebviewProvider(context, options);
    }
}