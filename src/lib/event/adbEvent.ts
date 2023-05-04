import * as vscode from 'vscode';
import { AdbDevice } from '../explorer/types';

export const adbEvent = new vscode.EventEmitter<AdbDevice[]>();