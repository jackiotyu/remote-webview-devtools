import { Device, WebView, WebViewPage } from '../adb/bridge';

export enum Explorer {
    adbView = 'RWD.adbView',
    flowView = 'RWD.flowView'
}

export interface AdbWebView extends WebView {
    pages: WebViewPage[]
}

export interface AdbDevice extends Device {
    webViews: AdbWebView[],
}


export enum AdbTreeItemEnum {
    device = 'device',
    webView ='webView',
    page = 'page',
    detail = 'detail'
}