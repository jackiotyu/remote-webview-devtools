import * as vscode from 'vscode';
import { Enum, ConnectPageItem, ConnectItem, ConnectDetailItem, DebugPage } from './connectTreeItem';
import { toggleRefreshEvent, debugPageEvent } from '../event/adbEvent';
import { ConfigAdaptor, Config } from '../adaptor/configuration';
import { getWebViewPages } from '../adb/bridge';


type TriggerType = ConnectItem | undefined | null | void;

export class ConnectViewProvider implements vscode.TreeDataProvider<ConnectItem> {
    private _onDidChangeTreeData: vscode.EventEmitter<TriggerType> = new vscode.EventEmitter<TriggerType>();
    readonly onDidChangeTreeData: vscode.Event<TriggerType> = this._onDidChangeTreeData.event;
    private pageList: DebugPage[] = [];
    private deviceTracker?: { timer: NodeJS.Timeout, resolve: () => void };
    constructor(context: vscode.ExtensionContext) {
        if(this.refreshDelay) {
            this.startTracker();
        }
        debugPageEvent.event(() => {
            this.execRefresh();
        })
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
        context.subscriptions.push(this._onDidChangeTreeData);
    }
    get refreshDelay() {
        return ConfigAdaptor.get(Config.refresh);
    }
    startTracker() {
        clearTimeout(this.deviceTracker?.timer);
        return new Promise<void>(resolve => {
            let timer = setTimeout(() => {
                this.execRefresh();
                this.startTracker();
                resolve();
            }, this.refreshDelay);
            this.deviceTracker = { timer, resolve };
        });
    }
    clearTracker() {
        clearTimeout(this.deviceTracker?.timer);
        this.deviceTracker?.resolve();
    }
    async execRefresh() {
        this.pageList = await getWebViewPages(ConfigAdaptor.get(Config.port));
        this._onDidChangeTreeData.fire();
    }
    getTreeItem(element: ConnectItem): vscode.TreeItem | Thenable<vscode.TreeItem> {
        return element;
    }
    getChildren(element?: ConnectItem | undefined): vscode.ProviderResult<ConnectItem[]> {
        if(!element) {
            return this.pageList.map(item => {
                return new ConnectPageItem(item, vscode.TreeItemCollapsibleState.Collapsed);
            });
        }

        if(element.type === Enum.connectPageItem) {
            const detail = element.page;
            type PageKey = keyof DebugPage;
            return (Object.keys(detail) as PageKey[]).map(key => {
                const value = detail[key];
                return new ConnectDetailItem(key, value);
            })
        }
    }
}
