import { ModuleType } from '../protocol/flow';

export const EXTENSION_NAME: 'RemoteWebviewDevtools' = 'RemoteWebviewDevtools';
export const SCHEME = 'REMOTE_WEBVIEW_DEVTOOLS';
export const FLOW_EDITOR = 'REMOTE_WEBVIEW_DEVTOOLS.FLOW_EDITOR';
export const FLOW_EXT_NAME = '.rwdFlow';

export enum CommandName {
    /** 打开webview */
    openWebview = 'RemoteWebviewDevtools.openWebview',
    /** 刷新webview连接 */
    refreshConnects = 'RemoteWebviewDevtools.refreshConnects',
    /** 连接设备 */
    trackDevices = 'RemoteWebviewDevtools.trackDevices',
    /** 更新设备列表 */
    refreshAdbDevices = 'RemoteWebviewDevtools.refreshAdbDevices',
    /** 更新连接列表 */
    refreshDebugPages = 'RemoteWebviewDevtools.refreshDebugPages',
    /** 更新webView列表 */
    refreshWebViews = 'RemoteWebviewDevtools.refreshWebViews',
    /** 更新页面链接列表 */
    refreshPages = 'RemoteWebviewDevtools.refreshPages',
    copyDetail = 'RemoteWebviewDevtools.copyDetail',
    /** 打开设置 */
    openSetting = 'RemoteWebviewDevtools.openSetting',
    openDocumentFromCodeLens = 'RemoteWebviewDevtools.openDocumentFromCodeLens',
    /** 连接到devtools协议中间件 */
    connectDevtoolsProtocol = 'RemoteWebviewDevtools.connectDevtoolsProtocol',
    /** 添加flow */
    addFlow = 'RemoteWebviewDevtools.addFlow',
    /** 打开flow */
    openFlow = 'RemoteWebviewDevtools.openFlow',
    /** 重命名flow */
    renameFlow = 'RemoteWebviewDevtools.renameFlow',
    /** 删除flow */
    deleteFlow = 'RemoteWebviewDevtools.deleteFlow',
    /** 删除flow与devtools的连接 */
    deleteFlowConnect = 'RemoteWebviewDevtools.deleteFlowConnect'
}

export enum Config {
    refresh = 'refresh',
    adbPath = 'adbPath',
    adbArgs = 'adbArgs',
    port = 'port',
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

export const SourceNodeSet = new Set([
    StaticNodeType.devtoolsEvent,
    StaticNodeType.webviewEvent,
    NormalNodeType.cdp,
]);

export const TargetNodeSet = new Set([
    StaticNodeType.devtoolsInput,
    StaticNodeType.webviewInput,
    NormalNodeType.console,
]);


export enum FlowWebviewMethod {
    /** 输出文本到outputChannel */
    toggleLog,
    /** 更新flow文件内容 */
    edit,
    /** 打开编辑器 */
    openEdit,
    /** 展示信息 */
    showInfo,
    update,
    deploy,
    unlinkAll
}

export namespace FlowWebviewPayload {
    export type log = string;
    export type edit = Record<string, any>;
    export type openEdit = { name: string, use: ModuleType };
    export type showInfo = string;
    export type deploy = void;
}

export namespace FlowWebviewRecord {
    export interface log {
        type: FlowWebviewMethod.toggleLog;
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
    export interface deploy {
        type: FlowWebviewMethod.deploy,
        data: FlowWebviewPayload.deploy,
    }
}