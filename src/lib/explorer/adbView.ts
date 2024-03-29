import * as vscode from 'vscode';
import { AdbTreeItemEnum, AdbDevice } from './types';
import { DeviceItem, WebViewItem, PageItem, PageDetailItem, AdbItem } from './adbTreeItem';
import { adbEvent, toggleRefreshEvent } from '../event/adbEvent';
import { CommandName } from '../../constants';
import { findWebViews, forwardDebugger, getWebViewPages, WebViewPage } from '../adb/bridge';
import { ConfigAdaptor, Config } from '../adaptor/configuration';

type TriggerType = AdbItem | undefined | null | void;

/** adb连接的数据 */
export class AdbViewProvider implements vscode.TreeDataProvider<AdbItem> {
    private _onDidChangeTreeData: vscode.EventEmitter<TriggerType> = new vscode.EventEmitter<TriggerType>();
    readonly onDidChangeTreeData: vscode.Event<TriggerType> = this._onDidChangeTreeData.event;
    private devices: AdbDevice[] = [];
    private deviceTracker?: NodeJS.Timeout;
    private refreshing: boolean = false;
    constructor(context: vscode.ExtensionContext) {
        adbEvent.event((devices) => {
            this.devices = devices;
            this.refresh();
        });
        this.execRefreshAdbDevices();
        if (this.refreshDelay) {
            this.forceStartTracker();
        }
        toggleRefreshEvent.event(() => {
            this.checkTracker();
        });
        context.subscriptions.push(this._onDidChangeTreeData);
    }
    get refreshDelay() {
        return ConfigAdaptor.get(Config.refresh);
    }
    checkTracker() {
        if (this.refreshDelay) {
            this.forceStartTracker();
        } else {
            this.clearTracker();
        }
    }
    clearTracker() {
        clearTimeout(this.deviceTracker);
        this.deviceTracker = undefined;
        this.refreshing = false;
    }
    execRefreshAdbDevices() {
        return vscode.commands.executeCommand(CommandName.refreshAdbDevices);
    }
    refresh(): void {
        this._onDidChangeTreeData.fire();
    }
    forceStartTracker() {
        this.clearTracker();
        this.refreshing = true;
        this.startTracker();
    }
    async startTracker() {
        if (!this.refreshing) return;
        while (this.refreshing) {
            await this.execRefreshAdbDevices();
            await new Promise((resolve) => (this.deviceTracker = setTimeout(resolve, this.refreshDelay)));
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
            let getWebViews = findWebViews(element.device);
            return getWebViews
                .then((webViews) => {
                    return Promise.all(
                        webViews.map(async (item) => {
                            const port = await forwardDebugger(item);
                            return new WebViewItem(item, port, vscode.TreeItemCollapsibleState.Expanded);
                        }),
                    );
                })
                .catch(() => []);
        }

        if (element.type === AdbTreeItemEnum.webView) {
            return getWebViewPages(element.port).then((pages) => {
                const collapsibleState = pages.length
                    ? vscode.TreeItemCollapsibleState.Collapsed
                    : vscode.TreeItemCollapsibleState.None;
                return pages.map((item) => {
                    return new PageItem(item, collapsibleState);
                });
            });
        }

        if (element.type === AdbTreeItemEnum.page) {
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
