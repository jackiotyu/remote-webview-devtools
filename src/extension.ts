import * as vscode from 'vscode';
import { CommandName } from './constants';

export function activate(context: vscode.ExtensionContext) {
	context.subscriptions.push(
		vscode.commands.registerCommand(CommandName.openWebview, (wsLink: string) => {
			const panel = vscode.window.createWebviewPanel(
				'RemoteWebviewDevtools', // 只供内部使用，这个webview的标识
				'remote-webview-devtools', // 给用户显示的面板标题
				vscode.ViewColumn.One, // 给新的webview面板一个编辑器视图
				{
					enableScripts: true,
				} // Webview选项。我们稍后会用上
			  );
			// 设置HTML内容
			panel.webview.html = getWebviewContent(panel);
		})
	);
}

export function deactivate() {}


function getWebviewContent(panel: vscode.WebviewPanel){
	const htmlPath = `http://127.0.0.1:9908/front_end/devtools_app.html`;

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
            <iframe class="devtools-frame" frameBorder="0" src="${htmlPath}?ws=127.0.0.1:9229/5b3c1ded-97cd-47ee-a626-52a547b83c6c"></iframe>
        </body>
        </html>
	`;
}
