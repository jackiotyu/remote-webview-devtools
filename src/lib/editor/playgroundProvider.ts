import * as vscode from 'vscode';

import { SCHEME } from '../../constants';

export const PLAYGROUND_URI = vscode.Uri.parse(`${SCHEME}:/playground`);

export default class PlaygroundProvider implements vscode.TextDocumentContentProvider {
    private _onDidChangeTreeData: vscode.EventEmitter<vscode.Uri> = new vscode.EventEmitter<vscode.Uri>();
    onDidChange = this._onDidChangeTreeData.event;
    constructor() {

    }

    provideTextDocumentContent(uri: vscode.Uri, token: vscode.CancellationToken): vscode.ProviderResult<string> {
        return '';
    }
}