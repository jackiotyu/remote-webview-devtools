import * as vscode from 'vscode';
export const flowEvent = new vscode.EventEmitter<void>();

export default class AdbEvent {
    static getDisposables(): vscode.Disposable[] {
        return [
            flowEvent
        ];
    }
}