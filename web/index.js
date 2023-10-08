window.vscode ??= window.acquireVsCodeApi();
const extCmdSet = new Set(['openInNewTab']);
const receiveMessage = function (event) {
    if (event.data?.command === 'copyText') {
        navigator.clipboard.writeText(event.data.data);
    }
    if (extCmdSet.has(event.data?.command)) {
        window.vscode?.postMessage(event.data);
    }
};
window.addEventListener('message', receiveMessage);