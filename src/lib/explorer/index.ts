import * as vscode from 'vscode';
import { AdbViewProvider } from './adbView';
import { FlowViewProvider } from './flowView';
import { ConnectViewProvider } from './connectView';
import { Explorer } from './types';

export class TreeDataManager {
    constructor(context: vscode.ExtensionContext) {
        context.subscriptions.push(
            vscode.window.createTreeView(Explorer.flowView, {
                treeDataProvider: new FlowViewProvider(context),
                showCollapseAll: true,
            }),
            vscode.window.createTreeView(Explorer.adbView, {
                treeDataProvider: new AdbViewProvider(context),
                showCollapseAll: true,
            }),
            vscode.window.createTreeView(Explorer.connectView, {
                treeDataProvider: new ConnectViewProvider(context),
                showCollapseAll: true,
            }),
        );
    }
}
