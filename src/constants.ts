export const EXTENSION_NAME: 'RemoteWebviewDevtools' = 'RemoteWebviewDevtools';
export const SCHEME = 'REMOTE_WEBVIEW_DEVTOOLS';
export const FLOW_EDITOR = 'REMOTE_WEBVIEW_DEVTOOLS.FLOW_EDITOR';
export const FLOW_EXT_NAME = '.rwd-flow';

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
    connectDevtoolsProtocol = 'RemoteWebviewDevtools.connectDevtoolsProtocol'
}

export enum Config {
    refresh = 'refresh',
    adbPath = 'adbPath',
    adbArgs = 'adbArgs',
}