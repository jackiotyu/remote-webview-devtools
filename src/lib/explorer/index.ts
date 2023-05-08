import * as vscode from 'vscode';
import { AdbViewProvider } from './adbView';
import { FlowViewProvider } from './flowView';
import { Explorer } from './types';

export class TreeDataManager {
    constructor(context: vscode.ExtensionContext) {
        context.subscriptions.push(
            vscode.window.registerTreeDataProvider(
                Explorer.adbView, new AdbViewProvider(context)
            ),
            vscode.window.registerTreeDataProvider(
                Explorer.flowView, new FlowViewProvider(context)
            )
        );
    }
}