import * as vscode from 'vscode';
import { CommandName } from '../../constants';

export enum FlowNodeEnum {
    flowItem = 'RWD.flowItem',
    flowConnectItem = 'RWD.flowConnectItem',
}

export class FlowItem extends vscode.TreeItem {
    type: FlowNodeEnum.flowItem;
    children: string[];
    constructor(
        type: FlowNodeEnum.flowItem,
        name: string,
        children: string[],
        collapsibleState?: vscode.TreeItemCollapsibleState,
    ) {
        super(name, collapsibleState);
        this.type = type;
        this.children = children;
        this.contextValue = FlowNodeEnum.flowItem;
        this.iconPath = new vscode.ThemeIcon('github-action', new vscode.ThemeColor('charts.blue'));
        this.command = {
            command: CommandName.openFlow,
            arguments: [name],
            title: '打开flow',
        };
    }
}

export class FlowConnectItem extends vscode.TreeItem {
    type: FlowNodeEnum.flowConnectItem;
    constructor(
        type: FlowNodeEnum.flowConnectItem,
        webSocketDebuggerUrl: string,
        collapsibleState?: vscode.TreeItemCollapsibleState,
    ) {
        super(webSocketDebuggerUrl, collapsibleState);
        this.type = type;
        this.contextValue = FlowNodeEnum.flowConnectItem;
        this.iconPath = new vscode.ThemeIcon('layers', new vscode.ThemeColor('charts.green'));
        this.command = {
            command: CommandName.openWebview,
            arguments: [webSocketDebuggerUrl],
            title: '打开devtools',
        };
    }
}
