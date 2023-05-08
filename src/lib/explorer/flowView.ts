import * as vscode from 'vscode';
import { FlowItem, FlowNodeEnum } from './flowTreeItem';
import GlobalStorage from '../adaptor/globalStorage';
import { flowEvent } from '../event/flowEvent';

type TriggerType = FlowItem | undefined | null | void;

export class FlowViewProvider implements vscode.TreeDataProvider<FlowItem> {
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

    getTreeItem(element: FlowItem): vscode.TreeItem | Thenable<vscode.TreeItem> {
        return element;
    }

    getChildren(element?: FlowItem | undefined): vscode.ProviderResult<FlowItem[]> {
        if (!element) {
            return this.data.map((name) => {
                return new FlowItem(FlowNodeEnum.flowItem, name, vscode.TreeItemCollapsibleState.None);
            });
        }
        return [];
    }
}
