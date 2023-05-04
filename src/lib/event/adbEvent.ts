import * as vscode from 'vscode';
import { AdbDevice } from '../explorer/types';
import { AdbItem } from '../explorer/adbTreeItem';

export type TriggerType = AdbItem | undefined | null | void;
export const adbEvent = new vscode.EventEmitter<AdbDevice[]>();
