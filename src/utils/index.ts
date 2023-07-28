import * as vscode from 'vscode';
import path from 'path';
import os from 'os';

export function isUndefined(value: any): value is undefined {
    return value === undefined;
}

export function getDocFileName(document: vscode.TextDocument) {
    let filePath = document.uri.fsPath
    let flowName = filePath.split(path.sep).pop()!.split('.').shift();
    return flowName;
}

/**
 * 获取当前机器的ip地址
 */
export function getIpAddress() {
    let iFaces = os.networkInterfaces();
    for (let dev in iFaces) {
        let iface = iFaces[dev];
        if (!iface) continue;
        for (let i = 0; i < iface.length; i++) {
            let { family, address, internal } = iface[i];
            if (family === 'IPv4' && address !== '127.0.0.1' && !internal) {
                return address;
            }
        }
    }
}