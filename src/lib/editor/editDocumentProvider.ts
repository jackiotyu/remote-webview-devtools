import * as vscode from 'vscode';
import { CommandName } from '../../constants';

interface DocumentInfo {
    line: number;
    documentId: any;
    namespace: string;
    connectionId: string | null;
}

export default class EditDocumentProvider implements vscode.CodeLensProvider {
    _codeLens: vscode.CodeLens[] = [];
    _codeLensInfo: {[name: string]: DocumentInfo[]} = {};
    provideCodeLenses(document: vscode.TextDocument, token: vscode.CancellationToken): vscode.ProviderResult<vscode.CodeLens[]> {
        this._codeLens = [];

        const activeEditorUri = vscode.window.activeTextEditor?.document.uri.toString();

        if(activeEditorUri && this._codeLensInfo[activeEditorUri]) {
            this._codeLensInfo[activeEditorUri].forEach(item => {
                const position = new vscode.Position(item.line, 0);
                const range = new vscode.Range(position, position);
                const command: {
                    title: string,
                    command: CommandName,
                    arguments: DocumentInfo[]
                } = {
                    title: '编辑文档',
                    command: CommandName.openDocumentFromCodeLens,
                    arguments: [item]
                };
                this._codeLens.push(new vscode.CodeLens(range, command));
            });
        }

        return this._codeLens;
    }
}