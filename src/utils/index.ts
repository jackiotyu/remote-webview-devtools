import * as vscode from 'vscode';
import path from 'path';

export function isUndefined(value: any): value is undefined {
    return value === undefined;
}

export function getDocFileName(document: vscode.TextDocument) {
    let filePath = document.uri.fsPath
    let flowName = filePath.split(path.sep).pop()!.split('.').shift();
    return flowName;
}