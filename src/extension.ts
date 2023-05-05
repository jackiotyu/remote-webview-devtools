import * as vscode from 'vscode';
import { closeServer } from './lib/resourceServer';
import { CommandsManager } from './lib/commands';
import { closeWsServer } from './lib/tunnel/tunnel';
import { TreeDataManager } from './lib/explorer/index';
import { AdbEvent } from './lib/event/adbEvent';
import PlaygroundProvider from './lib/editor/playgroundProvider';
import { SCHEME } from './constants';

export function activate(context: vscode.ExtensionContext) {
    new CommandsManager(context);
    context.subscriptions.push({ dispose: closeServer });
    context.subscriptions.push({ dispose: closeWsServer });
    context.subscriptions.push(...AdbEvent.getDisposables());
    new TreeDataManager(context);
    context.subscriptions.push(vscode.workspace.registerTextDocumentContentProvider(SCHEME, new PlaygroundProvider()));
}

export function deactivate() {}
