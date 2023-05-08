import * as vscode from 'vscode';
import { CommandName } from '../../constants';

export enum FlowNodeEnum {
    flowItem = 'RWD.flowItem',
}

export class FlowItem extends vscode.TreeItem {
    type: FlowNodeEnum.flowItem;
    constructor(
        type: FlowNodeEnum.flowItem,
        name: string,
        collapsibleState?: vscode.TreeItemCollapsibleState,
    ) {
        super(name, collapsibleState);
        this.type = type;
        this.contextValue = 'RWD.flowItem';
        this.command = {
            command: CommandName.openFlow,
            arguments: [name],
            title: '打开flow'
        }
    }
}