import * as vscode from 'vscode';
import { closeServer } from './lib/resourceServer';
import { CommandsManager } from './lib/commands';

export function activate(context: vscode.ExtensionContext) {
    new CommandsManager(context);
    context.subscriptions.push({ dispose: closeServer });
}

export function deactivate() {}
