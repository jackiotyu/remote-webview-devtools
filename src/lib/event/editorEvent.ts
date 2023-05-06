import * as vscode from 'vscode';

export interface EditorInfo {
    code: string;
    ws: string;
    active: boolean;
    doc?: vscode.TextDocument,
}

export const editorEvent = new vscode.EventEmitter<EditorInfo>();

export default class EditorEvent {
    static getDisposables(): vscode.Disposable[] {
        return [ editorEvent ];
    }
}
