import * as vscode from 'vscode';
import { AdbTreeItemEnum, AdbDevice } from './types';
import { DeviceItem, WebViewItem, PageItem, PageDetailItem, AdbItem } from './adbTreeItem';
import { adbEvent, toggleRefreshEvent } from '../event/adbEvent';
import { CommandName } from '../../constants';
import { findWebViews, forwardDebugger, getWebViewPages, WebViewPage } from '../adb/bridge';
import { AdbMap } from './adbMap';
import { ConfigAdaptor, Config } from '../adaptor/configuration';

type TriggerType = AdbItem | undefined | null | void;

/** adb连接的数据 */
export class AdbViewProvider implements vscode.TreeDataProvider<AdbItem> {
    private _onDidChangeTreeData: vscode.EventEmitter<TriggerType> = new vscode.EventEmitter<TriggerType>();
    readonly onDidChangeTreeData: vscode.Event<TriggerType> = this._onDidChangeTreeData.event;
    private devices: AdbDevice[] = [];
    private adbMap: AdbMap = new AdbMap();
    private deviceTracker?: NodeJS.Timeout;
    private refreshing: boolean = false;
    constructor(context: vscode.ExtensionContext) {
        adbEvent.event((devices) => {
            this.devices = devices;
            this.refresh();
        });
        this.execRefreshAdbDevices();
        if(this.refreshDelay) {
            this.forceStartTracker();
        }
        toggleRefreshEvent.event(() => {
            if(this.refreshDelay) {
                this.forceStartTracker();
            } else{
               this.clearTracker();
            }
        });
        context.subscriptions.push(this._onDidChangeTreeData);
    }
    get refreshDelay() {
        return ConfigAdaptor.get(Config.refresh);
    }
    clearTracker() {
        clearTimeout(this.deviceTracker);
        this.deviceTracker = undefined;
        this.refreshing = false;
    }
    execRefreshAdbDevices() {
        vscode.commands.executeCommand(CommandName.refreshAdbDevices);
    }
    refresh(): void {
        this.adbMap.clear();
        this._onDidChangeTreeData.fire();
    }
    forceStartTracker() {
        this.clearTracker();
        this.refreshing = true;
        this.startTracker();
    }
    async startTracker() {
        if (!this.refreshing) return;
        while(this.refreshing) {
            this.execRefreshAdbDevices();
            await new Promise(resolve => this.deviceTracker = setTimeout(resolve, this.refreshDelay));
        }
    }
    getTreeItem(element: AdbItem): vscode.TreeItem | Thenable<vscode.TreeItem> {
        return element;
    }
    getChildren(element?: AdbItem | undefined): vscode.ProviderResult<AdbItem[]> {
        if (!element) {
            // 设备
            return this.devices.map((item) => {
                return new DeviceItem(item.webViews, item, vscode.TreeItemCollapsibleState.Expanded);
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
                        item,
                        port,
                        vscode.TreeItemCollapsibleState.Expanded
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
                const collapsibleState = pages.length
                    ? vscode.TreeItemCollapsibleState.Collapsed
                    : vscode.TreeItemCollapsibleState.None;
                return pages.map((item) => {
                    return new PageItem(item, collapsibleState);
                });
            }).catch(() => []);
        }

        if(element.type === AdbTreeItemEnum.page) {
            const detail = element.page;
            type WebViewPageKey = keyof WebViewPage;
            return (Object.keys(detail) as WebViewPageKey[]).map((key: WebViewPageKey) => {
                const value = detail[key];
                return new PageDetailItem(key, value || '');
            });
        }

        return [];
    }
}
