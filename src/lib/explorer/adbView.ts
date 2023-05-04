import * as vscode from 'vscode';
import { DeviceItem, WebViewItem, PageItem, AdbItem, AdbTreeItemEnum, AdbDevice } from './types';
import { adbEvent } from '../event/adbEvent';

/**
 * adb连接的数据
 */
export class AdbViewProvider implements vscode.TreeDataProvider<AdbItem> {
    private _onDidChangeTreeData = adbEvent;
    private devices: AdbDevice[];
    constructor() {
        this.devices = [
            {
                serial: 'string',
                state: 'device',
                webViews: []
            },
        ];
    }
    refresh(): void {
        this._onDidChangeTreeData.fire([]);
    }
    getTreeItem(element: AdbItem): vscode.TreeItem | Thenable<vscode.TreeItem> {
        return element;
    }
    getChildren(element?: AdbItem | undefined): vscode.ProviderResult<AdbItem[]> {
        if (!element) {
            // 设备
            return this.devices.map((item) => {
                const device = new DeviceItem(AdbTreeItemEnum.device, item.webViews, '设备');
                device.iconPath = '$(window)';
                return device;
            });
        }

        if (element.type === AdbTreeItemEnum.device) {
            // webView
            return element.children.map((item) => {
                return new WebViewItem(AdbTreeItemEnum.webView, item.pages, 'webView');
            });
        }

        if (element.type === AdbTreeItemEnum.webView) {
            // page
            return element.children.map((item) => {
                return new PageItem(AdbTreeItemEnum.page, 'page');
            });
        }
        return [];
    }
}
