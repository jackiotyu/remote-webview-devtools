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
    type: AdbTreeItemEnum.device;
    children: AdbWebView[];
    device: Device;
    constructor(
        type: AdbTreeItemEnum.device,
        children: AdbWebView[],
        device: Device,
        label: string,
        collapsibleState?: vscode.TreeItemCollapsibleState
    ) {
        super(label, collapsibleState);
        this.type = type;
        this.children = children;
        this.device = device;
        this.iconPath = new vscode.ThemeIcon('broadcast', new vscode.ThemeColor('badge.foreground'));
        this.contextValue = 'RWD.adbDevices';
    }
}

export class WebViewItem extends TreeItem {
    type: AdbTreeItemEnum.webView;
    webView: WebView;
    port: number;
    constructor(
        type: AdbTreeItemEnum.webView,
        webView: WebView,
        port: number,
        label: string,
        collapsibleState?: vscode.TreeItemCollapsibleState
    ) {
        super(label, collapsibleState);
        this.type = type;
        this.webView = webView;
        this.port = port;
        this.iconPath = new vscode.ThemeIcon('default-view-icon', new vscode.ThemeColor('badge.foreground'));
        this.contextValue = 'RWD.webViews';
    }
}

export class PageItem extends vscode.TreeItem {
    type: AdbTreeItemEnum.page;
    page: WebViewPage;
    constructor(
        type: AdbTreeItemEnum.page,
        page: WebViewPage,
        label: string,
        collapsibleState?: vscode.TreeItemCollapsibleState
    ) {
        super(label, collapsibleState);
        this.type = type;
        this.page = page;
        this.command = {
            command: CommandName.openWebview,
            arguments: [page.webSocketDebuggerUrl],
            title: '打开webView调试',
        };
        this.iconPath = new vscode.ThemeIcon('notebook-execute', new vscode.ThemeColor('button.foreground'));
    }
}

export type AdbItem = PageItem | DeviceItem | WebViewItem;
