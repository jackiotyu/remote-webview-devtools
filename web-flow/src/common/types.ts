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

export enum NormalNodeType {
    console = 'console',
    middleware = 'middleware',
    cdp = 'cdp',
}