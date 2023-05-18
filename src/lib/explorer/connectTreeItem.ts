import * as vscode from 'vscode';
import { CommandName } from '../../constants';
import { WebViewPage } from '../adb/bridge';
import { PageDetailItem } from './adbTreeItem';

export type DebugPage = WebViewPage;

export enum Enum {
    connectPageItem = 'connectPageItem',
}

export class ConnectPageItem extends vscode.TreeItem {
    readonly type = Enum.connectPageItem;
    page: WebViewPage;
    constructor(page: WebViewPage, collapsibleState?: vscode.TreeItemCollapsibleState) {
        const label = `${page.title} ${page.url}`;
        super(label, collapsibleState);
        this.page = page;
        this.command = {
            command: CommandName.openWebview,
            arguments: [page.webSocketDebuggerUrl, page.title],
            title: '打开webView调试',
        };
        this.iconPath = new vscode.ThemeIcon('notebook-execute', new vscode.ThemeColor('charts.green'));
        this.contextValue = 'RWD.connectPageItem';
    }
}

export class ConnectDetailItem extends PageDetailItem {}

export type ConnectItem = ConnectDetailItem | ConnectPageItem;
