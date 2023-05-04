import * as vscode from 'vscode';
import { closeServer } from './lib/resourceServer';
import { CommandsManager } from './lib/commands';
import { closeWsServer } from './lib/tunnel/tunnel';

export function activate(context: vscode.ExtensionContext) {
    new CommandsManager(context);
    context.subscriptions.push({ dispose: closeServer });
    context.subscriptions.push({ dispose: closeWsServer });
}

export function deactivate() {}
