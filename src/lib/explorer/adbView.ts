import * as vscode from 'vscode';
import { AdbTreeItemEnum, AdbDevice } from './types';
import { DeviceItem, WebViewItem, PageItem, PageDetailItem, AdbItem } from './adbTreeItem';
import { adbEvent, toggleRefreshEvent } from '../event/adbEvent';
import { CommandName } from '../../constants';
import { findWebViews, forwardDebugger, getWebViewPages, unforwardDebuggers, getForwardPorts, WebViewPage } from '../adb/bridge';
import { AdbMap } from './adbMap';
import { ConfigAdaptor, Config } from '../adaptor/configuration';

type TriggerType = AdbItem | undefined | null | void;

/** adb连接的数据 */
export class AdbViewProvider implements vscode.TreeDataProvider<AdbItem> {
    private _onDidChangeTreeData: vscode.EventEmitter<TriggerType> = new vscode.EventEmitter<TriggerType>();
    readonly onDidChangeTreeData: vscode.Event<TriggerType> = this._onDidChangeTreeData.event;
    private devices: AdbDevice[] = [];
    private adbMap: AdbMap = new AdbMap();
    private deviceTracker?: { timer: NodeJS.Timeout, resolve: () => void };
    constructor() {
        adbEvent.event((devices) => {
            this.devices = devices;
            this.refresh();
        });
        this.execRefreshAdbDevices();
        if(this.refreshDelay) {
            this.startTracker();
        }
        toggleRefreshEvent.event(() => {
            if(this.refreshDelay) {
                if(this.deviceTracker?.timer){
                    this.clearTracker();
                }
                this.startTracker();
            } else{
               this.clearTracker();
            }
        });
    }
    get refreshDelay() {
        return ConfigAdaptor.get(Config.refresh);
    }
    clearTracker() {
        clearTimeout(this.deviceTracker?.timer);
        this.deviceTracker?.resolve();
    }
    execRefreshAdbDevices() {
        vscode.commands.executeCommand(CommandName.refreshAdbDevices);
    }
    refresh(): void {
        unforwardDebuggers();
        this.adbMap.clear();
        this._onDidChangeTreeData.fire();
    }
    startTracker() {
        clearTimeout(this.deviceTracker?.timer);
        return new Promise<void>(resolve => {
            let timer = setTimeout(() => {
                this.execRefreshAdbDevices();
                this.startTracker();
                resolve();
            }, this.refreshDelay);
            this.deviceTracker = { timer, resolve };
        });
    }
    getTreeItem(element: AdbItem): vscode.TreeItem | Thenable<vscode.TreeItem> {
        return element;
    }
    getChildren(element?: AdbItem | undefined): vscode.ProviderResult<AdbItem[]> {
        if (!element) {
            // 设备
            return this.devices.map((item) => {
                return new DeviceItem(AdbTreeItemEnum.device, item.webViews, item, vscode.TreeItemCollapsibleState.Expanded);
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
                    return new PageItem(AdbTreeItemEnum.page, item, vscode.TreeItemCollapsibleState.Collapsed);
                });
            }).catch(() => []);
        }

        if(element.type === AdbTreeItemEnum.page) {
            const detail = element.page;
            type WebViewPageKey = keyof WebViewPage;
            return (Object.keys(detail) as WebViewPageKey[]).map((key: WebViewPageKey) => {
                const value = detail[key];
                return new PageDetailItem(AdbTreeItemEnum.detail, key, value);
            });
        }

        return [];
    }
}
