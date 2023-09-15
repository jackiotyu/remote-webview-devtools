import * as vscode from 'vscode';


class QRCodeViewProvider implements vscode.WebviewViewProvider {
    static id = 'RWD.QRCodeView'
    constructor(public context: vscode.ExtensionContext) {}
    resolveWebviewView(webviewView: vscode.WebviewView, context: vscode.WebviewViewResolveContext<unknown>, token: vscode.CancellationToken): void | Thenable<void> {
        const resourceUri = vscode.Uri.joinPath(this.context.extensionUri, 'web-qrcode');
        webviewView.webview.html = this.getWebviewContent(webviewView.webview, resourceUri);
        webviewView.description = '生成二维码';
        webviewView.webview.options = {
            enableCommandUris: true,
            enableScripts: true,
            localResourceRoots: [
                resourceUri,
            ]
        }
        webviewView.show();
        webviewView.onDidDispose(() => {})
    }

    getWebviewContent(webview: vscode.Webview, resourceUri: vscode.Uri) {
        const scriptSrc = webview.asWebviewUri(vscode.Uri.joinPath(resourceUri, 'index.js'))
        const cssSrc = webview.asWebviewUri(vscode.Uri.joinPath(resourceUri, 'index.css'))
        const vscodeSrc = webview.asWebviewUri(vscode.Uri.joinPath(resourceUri, 'vscode.css'))
        const resetSrc = webview.asWebviewUri(vscode.Uri.joinPath(resourceUri, 'reset.css'))
        const qrcodeSrc = webview.asWebviewUri(vscode.Uri.joinPath(resourceUri, 'qrcode.js'))
        return `
            <!DOCTYPE html>
            <html lang="en">
            <head>
            <meta charset="UTF-8">
                <meta http-equiv="content-type" content="text/html; charset=utf-8">
                <meta name="referrer" content="no-referrer">
                <meta http-equiv="Content-Security-Policy" content="default-src * self blob: data: gap:; style-src * self 'unsafe-inline' blob: data: gap:; script-src * 'self' 'unsafe-eval' 'unsafe-inline' blob: data: gap:; object-src * 'self' blob: data: gap:; img-src * self 'unsafe-inline' blob: data: gap:; connect-src self * 'unsafe-inline' blob: data: gap:; frame-src * self blob: data: gap:; connect-src * self data: gap:;">
                <link rel="stylesheet" href="${resetSrc}" />
                <link rel="stylesheet" href="${vscodeSrc}" />
                <link rel="stylesheet" href="${cssSrc}" />
            </head>
            <body>
                <div id="border" class="fadeInLeft">
                    <div id="content">
                        <div class="textbox">
                            <textarea
                                id="QRInput"
                                name="QRInput"
                                type="text"
                                value="1"
                                rows="1"
                                cols="33"
                                placeholder="输入内容"
                            ></textarea>
                        </div>
                        <div class="buttons">
                            <button id="submitButton">生成</button>
                        </div>
                        <div class="outputBorder flex-center">
                            <span>
                                <div id="output"></div>
                            </span>
                        </div>
                    </div>
                </div>
                <script src="${qrcodeSrc}"></script>
                <script src="${scriptSrc}"></script>
            </body>
            </html>
        `
    }
}

export default class QRCodeViewRegister {
    constructor(context: vscode.ExtensionContext) {
        vscode.window.registerWebviewViewProvider(QRCodeViewProvider.id, new QRCodeViewProvider(context))
    }
}
