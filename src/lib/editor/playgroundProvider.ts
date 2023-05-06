import * as vscode from 'vscode';

export default class PlaygroundProvider implements vscode.TextDocumentContentProvider {
    private _onDidChangeTreeData: vscode.EventEmitter<vscode.Uri> = new vscode.EventEmitter<vscode.Uri>();
    onDidChange = this._onDidChangeTreeData.event;

    provideTextDocumentContent(uri: vscode.Uri, token: vscode.CancellationToken): vscode.ProviderResult<string> {
        return '';
        // const uriParams = new URLSearchParams(uri.query);
        // const ws = uriParams.get('ws') as string;

        // console.log('provideTextDocumentContent', ws, uriParams);

        // if(!ws) {
        //     token.isCancellationRequested = true;
        //     return;
        // }


        // const baseStr = `
        // out.backendReceive = function backendReceive(frontend, backend, message) {};
        // out.frontendReceive = function frontendReceive(frontend, backend, message) {};
        // out.connect = function connect(frontend, backend) {};
        // out.dispose = function dispose() {};
        // `
        // editorStore.set(ws, baseStr);

        // return baseStr;
    }
}