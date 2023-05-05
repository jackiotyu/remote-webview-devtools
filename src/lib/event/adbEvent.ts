import * as vscode from 'vscode';
import { AdbDevice } from '../explorer/types';
import { AdbItem } from '../explorer/adbTreeItem';
import { ConfigAdaptor, Config } from '../adaptor/configuration';
export type TriggerType = AdbItem | undefined | null | void;
export const adbEvent = new vscode.EventEmitter<AdbDevice[]>();
export const toggleRefreshEvent = new vscode.EventEmitter<void>();

export class AdbEvent {
    static getDisposables(): vscode.Disposable[] {
        return [
            adbEvent,
            toggleRefreshEvent,
            vscode.workspace.onDidChangeConfiguration((event) => {
                if (event.affectsConfiguration(ConfigAdaptor.extName)) {
                    toggleRefreshEvent.fire();
                }
            }),
        ];
    }
}
