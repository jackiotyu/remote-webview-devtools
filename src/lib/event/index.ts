import * as vscode from 'vscode';

import AdbEvent from './adbEvent';
import EditorEvent from './editorEvent';
import FlowEvent from './flowEvent';
import { deployEvent } from './tunnelEvent'

export default class EventDisposables {
    constructor(extension: vscode.ExtensionContext) {
        extension.subscriptions.push(
            ...AdbEvent.getDisposables(),
            ...EditorEvent.getDisposables(),
            ...FlowEvent.getDisposables(),
            deployEvent,
        )
    }
}