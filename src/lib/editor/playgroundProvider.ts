import * as vscode from 'vscode';

import { SCHEME } from '../../constants';

export const PLAYGROUND_URI = vscode.Uri.parse(`${SCHEME}:/playground`);

export default class PlaygroundProvider implements vscode.TextDocumentContentProvider {
    constructor() {

    }

    provideTextDocumentContent(uri: vscode.Uri, token: vscode.CancellationToken): vscode.ProviderResult<string> {
        return '';
    }
}