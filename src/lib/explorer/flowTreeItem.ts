import * as vscode from 'vscode';
import { CommandName } from '../../constants';

export enum FlowNodeEnum {
    flow = 'flow',
}

export class FlowItem extends vscode.TreeItem {
    type: FlowNodeEnum.flow;
    constructor(
        type: FlowNodeEnum.flow,
        name: string,
        collapsibleState?: vscode.TreeItemCollapsibleState,
    ) {
        super(name, collapsibleState);
        this.type = type;
        this.command = {
            command: CommandName.openFlow,
            arguments: [name],
            title: '打开flow'
        }
    }
}