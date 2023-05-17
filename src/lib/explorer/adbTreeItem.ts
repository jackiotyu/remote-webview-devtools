import * as vscode from 'vscode';
import { Device, WebView, WebViewPage } from '../adb/bridge';
import { CommandName } from '../../constants';
import { AdbTreeItemEnum, AdbWebView } from './types';

class TreeItem extends vscode.TreeItem {
    type?: AdbTreeItemEnum;
    children?: any[];
    constructor(
        label: string,
        collapsibleState?: vscode.TreeItemCollapsibleState
    ) {
        super(label, collapsibleState);
    }
}

export class DeviceItem extends TreeItem {
    readonly type = AdbTreeItemEnum.device;
    children: AdbWebView[];
    device: Device;
    constructor(
        children: AdbWebView[],
        device: Device,
        collapsibleState?: vscode.TreeItemCollapsibleState
    ) {
        super(`${device.model } ${ device.serial} ${device.state}`, collapsibleState);
        this.children = children;
        this.device = device;
        this.iconPath = new vscode.ThemeIcon('broadcast', new vscode.ThemeColor('charts.green'));
        this.contextValue = 'RWD.adbDevices';
    }
}

export class WebViewItem extends TreeItem {
    readonly type = AdbTreeItemEnum.webView;
    webView: WebView;
    port: number;
    constructor(
        webView: WebView,
        port: number,
        collapsibleState?: vscode.TreeItemCollapsibleState
    ) {
        const label = `${webView.packageName} ${webView.socket}`;
        super(label, collapsibleState);
        this.webView = webView;
        this.port = port;
        this.iconPath = new vscode.ThemeIcon('default-view-icon', new vscode.ThemeColor('charts.foreground'));
        this.contextValue = 'RWD.webViews';
    }
}

export class PageItem extends vscode.TreeItem {
    readonly type = AdbTreeItemEnum.page;
    page: WebViewPage;
    constructor(
        page: WebViewPage,
        collapsibleState?: vscode.TreeItemCollapsibleState
    ) {
        const label = `${page.title} ${page.url}`;
        super(label, collapsibleState);
        this.page = page;
        this.command = {
            command: CommandName.openWebview,
            arguments: [page.webSocketDebuggerUrl, page.title],
            title: '打开webView调试',
        };
        this.iconPath = new vscode.ThemeIcon('notebook-execute', new vscode.ThemeColor('charts.green'));
        this.contextValue = 'RWD.PageItem';
    }
}

export class PageDetailItem extends vscode.TreeItem {
    readonly type = AdbTreeItemEnum.detail;
    constructor(key: string, value: string) {
        super(key, vscode.TreeItemCollapsibleState.None);
        this.description = value;
        this.contextValue = 'RWD.PageDetailItem';
    }
}

export type AdbItem = PageDetailItem | PageItem | DeviceItem | WebViewItem;
