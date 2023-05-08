import { ModuleType } from '@/../protocol/flow'

export const EXTENSION_NAME: 'RemoteWebviewDevtools' = 'RemoteWebviewDevtools';
export const SCHEME = 'REMOTE_WEBVIEW_DEVTOOLS';
export const FLOW_EDITOR = 'REMOTE_WEBVIEW_DEVTOOLS.FLOW_EDITOR';
export const FLOW_EXT_NAME = '.rwdFlow';

export enum CommandName {
    /** 打开webview */
    openWebview = 'RemoteWebviewDevtools.openWebview',
    /** 刷新webview连接 */
    refreshConnects = 'RemoteWebviewDevtools.refreshConnects',
    trackDevices = 'RemoteWebviewDevtools.trackDevices',
    /** 更新设备列表 */
    refreshAdbDevices = 'RemoteWebviewDevtools.refreshAdbDevices',
    /** 更新webView列表 */
    refreshWebViews = 'RemoteWebviewDevtools.refreshWebViews',
    /** 更新页面链接列表 */
    refreshPages = 'RemoteWebviewDevtools.refreshPages',
    copyDetail = 'RemoteWebviewDevtools.copyDetail',
    openSetting = 'RemoteWebviewDevtools.openSetting',
    openDocumentFromCodeLens = 'RemoteWebviewDevtools.openDocumentFromCodeLens',
    /** 连接到devtools协议中间件 */
    connectDevtoolsProtocol = 'RemoteWebviewDevtools.connectDevtoolsProtocol',
    addFlow = 'RemoteWebviewDevtools.addFlow',
    openFlow = 'RemoteWebviewDevtools.openFlow',
    renameFlow = 'RemoteWebviewDevtools.renameFlow',
    deleteFlow = 'RemoteWebviewDevtools.deleteFlow',
}

export enum Config {
    refresh = 'refresh',
    adbPath = 'adbPath',
    adbArgs = 'adbArgs',
}

export enum StaticNodeType {
    /** webview事件 */
    webviewEvent = 'webviewEvent',
    /** devtools接收 */
    devtoolsInput = 'devtoolsInput',
    /** devtools事件 */
    devtoolsEvent = 'devtoolsEvent',
    /** webview接收 */
    webviewInput = 'webviewInput',
}

export const StaticNodeSet = new Set(Object.keys(StaticNodeType));

export enum NormalNodeType {
    console = 'console',
    middleware = 'middleware',
    cdp = 'cdp',
}

export enum FlowWebviewMethod {
    /** 输出文本到outputChannel */
    log,
    /** 更新flow文件内容 */
    edit,
    /** 打开编辑器 */
    openEdit,
    /** 展示信息 */
    showInfo,
    update,
}

export namespace FlowWebviewPayload {
    export type log = string;
    export type edit = Record<string, any>;
    export type openEdit = { name: string, use: ModuleType }
    export type showInfo = string;
}

export namespace FlowWebviewRecord {
    export interface log {
        type: FlowWebviewMethod.log;
        data: FlowWebviewPayload.log;
    }
    export interface edit {
        type: FlowWebviewMethod.edit;
        data: FlowWebviewPayload.edit
    }
    export interface openEdit {
        type: FlowWebviewMethod.openEdit,
        data: FlowWebviewPayload.openEdit
    }
    export interface showInfo {
        type: FlowWebviewMethod.showInfo,
        data: FlowWebviewPayload.showInfo,
    }
}