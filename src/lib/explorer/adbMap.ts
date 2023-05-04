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
    setPages(key: number, pages: WebViewPage[]) {
        this.webViewPagesMap.set(key, pages);
    }
    getPages(key: number){
        return this.webViewPagesMap.get(key);
    }
    clear() {
        this.webViewPagesMap.clear();
        this.webViewsMap.clear();
    }
}
