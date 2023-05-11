import * as vscode from 'vscode';
import { FlowItem, FlowConnectItem, FlowNodeEnum } from './flowTreeItem';
import GlobalStorage from '../adaptor/globalStorage';
import { flowEvent } from '../event/flowEvent';
import { getWsListByFlow } from '../event/tunnelEvent';

type TreeItem = FlowConnectItem | FlowItem;

type TriggerType = FlowItem | FlowConnectItem | undefined | null | void;

export class FlowViewProvider implements vscode.TreeDataProvider<TreeItem> {
    private _onDidChangeTreeData: vscode.EventEmitter<TriggerType> = new vscode.EventEmitter<TriggerType>();
    readonly onDidChangeTreeData: vscode.Event<TriggerType> = this._onDidChangeTreeData.event;
    private data: string[] = [];
    constructor(context: vscode.ExtensionContext) {
        this.data = GlobalStorage.getFlowList();
        context.subscriptions.push(this._onDidChangeTreeData);
        flowEvent.event(this.refresh);
    }

    refresh = () => {
        this.data = GlobalStorage.getFlowList();
        this._onDidChangeTreeData.fire();
    };

    getTreeItem(element: TreeItem): vscode.TreeItem | Thenable<vscode.TreeItem> {
        return element;
    }

    getChildren(element?: TreeItem | undefined): vscode.ProviderResult<TreeItem[]> {
        if (!element) {
            return this.data.map((name) => {
                return new FlowItem(FlowNodeEnum.flowItem, name, vscode.TreeItemCollapsibleState.Collapsed);
            });
        }
        if (element.type === FlowNodeEnum.flowItem) {
            let wsList = getWsListByFlow(element.label as string);
            return wsList.map((webSocketDebuggerUrl) => {
                return new FlowConnectItem(
                    FlowNodeEnum.flowConnectItem,
                    webSocketDebuggerUrl,
                    vscode.TreeItemCollapsibleState.None,
                );
            });
        }
        return [];
    }
}
