import * as vscode from 'vscode';
import { AdbDevice } from '../explorer/types';
import { AdbItem } from '../explorer/adbTreeItem';
import { ConfigAdaptor } from '../adaptor/configuration';

export type TriggerType = AdbItem | undefined | null | void;
export const adbEvent = new vscode.EventEmitter<AdbDevice[]>();
export const debugPageEvent = new vscode.EventEmitter<void>()
export const toggleRefreshEvent = new vscode.EventEmitter<void>();

const handleConfigChange = vscode.workspace.onDidChangeConfiguration((event) => {
    if (event.affectsConfiguration(ConfigAdaptor.extName)) {
        toggleRefreshEvent.fire();
    }
});

export default class AdbEvent {
    static getDisposables(): vscode.Disposable[] {
        return [
            adbEvent,
            toggleRefreshEvent,
            handleConfigChange,
        ];
    }
}
