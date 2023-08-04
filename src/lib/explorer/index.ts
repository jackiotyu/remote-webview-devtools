import * as vscode from 'vscode';
import { AdbViewProvider } from './adbView';
import { FlowViewProvider } from './flowView';
import { ConnectViewProvider } from './connectView';
import { Explorer } from './types';

export class TreeDataManager {
    constructor(context: vscode.ExtensionContext) {
        const flowData = new FlowViewProvider(context);
        const adbViewData = new AdbViewProvider(context);
        const connectData = new ConnectViewProvider(context);

        const flowView = vscode.window.createTreeView(Explorer.flowView, {
            treeDataProvider: flowData,
            showCollapseAll: true,
        });
        const adbView = vscode.window.createTreeView(Explorer.adbView, {
            treeDataProvider: adbViewData,
            showCollapseAll: true,
        });
        const connectView = vscode.window.createTreeView(Explorer.connectView, {
            treeDataProvider: connectData,
            showCollapseAll: true,
        });

        adbView.onDidChangeVisibility((e) => {
            e.visible ? adbViewData.checkTracker() : adbViewData.clearTracker();
        });
        connectView.onDidChangeVisibility(e => {
            e.visible ? connectData.checkTracker() : connectData.clearTracker();
        })

        context.subscriptions.push(flowView, adbView, connectView);
    }
}
