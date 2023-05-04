import * as vscode from 'vscode';
import { AdbTreeItemEnum, AdbDevice } from './types';
import { DeviceItem, WebViewItem, PageItem, AdbItem } from './adbTreeItem';
import { adbEvent } from '../event/adbEvent';
import { CommandName } from '../../constants';
import { findWebViews, forwardDebugger, getWebViewPages, unforwardDebuggers } from '../adb/bridge';
import { AdbMap } from './adbMap';
import { Promise } from 'bluebird';

type TriggerType = AdbItem | undefined | null | void;

/** adb连接的数据 */
export class AdbViewProvider implements vscode.TreeDataProvider<AdbItem> {
    private _onDidChangeTreeData: vscode.EventEmitter<TriggerType> = new vscode.EventEmitter<TriggerType>();
    readonly onDidChangeTreeData: vscode.Event<TriggerType> = this._onDidChangeTreeData.event;
    private devices: AdbDevice[] = [];
    private adbMap: AdbMap = new AdbMap();
    constructor() {
        adbEvent.event((devices) => {
            this.devices = devices;
            this.refresh();
        });
        vscode.commands.executeCommand(CommandName.refreshAdbDevices);
    }
    refresh(): void {
        unforwardDebuggers();
        this.adbMap.clear();
        this._onDidChangeTreeData.fire();
    }
    getTreeItem(element: AdbItem): vscode.TreeItem | Thenable<vscode.TreeItem> {
        return element;
    }
    getChildren(element?: AdbItem | undefined): vscode.ProviderResult<AdbItem[]> {
        if (!element) {
            // 设备
            return this.devices.map((item) => {
                return new DeviceItem(AdbTreeItemEnum.device, item.webViews, item, item.serial, vscode.TreeItemCollapsibleState.Collapsed);
            });
        }

        if (element.type === AdbTreeItemEnum.device) {
            const webViews = this.adbMap.getWebViews(element.device.serial);
            let getWebViews = Promise.resolve(
                webViews?.length ? webViews : findWebViews(element.device)
            );

            return getWebViews.then(webViews => {
                this.adbMap.setWebViews(element.device.serial, webViews);
                return Promise.all(webViews.map(async (item) => {
                    const port = await forwardDebugger(item);
                    return new WebViewItem(
                        AdbTreeItemEnum.webView,
                        item,
                        port,
                        item.socket,
                        vscode.TreeItemCollapsibleState.Collapsed
                    );
                }));
            }).catch(() => []);
        }

        if (element.type === AdbTreeItemEnum.webView) {
            const pages = this.adbMap.getPages(element.port);
            let getPages = Promise.resolve(
                pages?.length ? pages : getWebViewPages(element.port)
            );
           return getPages.then(pages => {
                this.adbMap.setPages(element.port, pages);
                return pages.map((item) => {
                    return new PageItem(AdbTreeItemEnum.page, item, item.title + ' ' + item.url);
                });
            }).catch(() => []);
        }
        return [];
    }
}
