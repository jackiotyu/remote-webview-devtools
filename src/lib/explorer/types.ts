import * as vscode from 'vscode';

export enum Explorer {
    adbView = 'RWD.adbView'
}

import { Device, WebView, WebViewPage } from '../adb/bridge';

interface AdbWebView extends WebView {
    pages: WebViewPage[]
}

export interface AdbDevice extends Device {
    webViews: AdbWebView[],
}


export enum AdbTreeItemEnum {
    device = 'device',
    webView ='webView',
    page =  'page'
}


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
    constructor(
        type: AdbTreeItemEnum.device,
        children: AdbWebView[],
        label: string,
        collapsibleState?: vscode.TreeItemCollapsibleState
    ) {
        super(label, collapsibleState);
        this.type = type;
        this.children = children;
    }
}

export class WebViewItem extends TreeItem {
    type: AdbTreeItemEnum.webView;
    children: WebViewPage[];
    constructor(
        type: AdbTreeItemEnum.webView,
        children: WebViewPage[],
        label: string,
        collapsibleState?: vscode.TreeItemCollapsibleState
    ) {
        super(label, collapsibleState);
        this.type = type;
        this.children = children;
    }
}

export class PageItem extends vscode.TreeItem {
    type: AdbTreeItemEnum.page;
    constructor(
        type: AdbTreeItemEnum.page,
        label: string,
        collapsibleState?: vscode.TreeItemCollapsibleState
    ) {
        super(label, collapsibleState);
        this.type = type;
    }
}

export type AdbItem = PageItem | DeviceItem | WebViewItem;