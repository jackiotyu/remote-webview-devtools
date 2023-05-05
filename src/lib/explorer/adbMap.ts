import { WebViewPage, WebView } from '../adb/bridge';

export class AdbMap {
    private webViewsMap: Map<string, WebView[]> = new Map();
    private webViewPagesMap: Map<number, WebViewPage[]> = new Map();
    setWebViews(key: string, views: WebView[]) {
        this.webViewsMap.set(key, views);
    }
    getWebViews(key: string) {
        return this.webViewsMap.get(key);
    }
    setPages(port: number, pages: WebViewPage[]) {
        this.webViewPagesMap.set(port, pages);
    }
    getPages(port: number){
        return this.webViewPagesMap.get(port);
    }
    clear() {
        this.webViewPagesMap.clear();
        this.webViewsMap.clear();
    }
}
