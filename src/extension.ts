import * as vscode from 'vscode';
import { closeServer } from './lib/resourceServer';
import { CommandsManager } from './lib/commands';
import { closeWsServer } from './lib/tunnel/tunnel';
import { TreeDataManager } from './lib/explorer/index';
import EventDisposables from './lib/event/index';
import FlowDocRegister from './lib/editor/flowDocProvider';

export function activate(context: vscode.ExtensionContext) {
    new CommandsManager(context);
    context.subscriptions.push({ dispose: closeServer });
    context.subscriptions.push({ dispose: closeWsServer });
    new TreeDataManager(context);
    new EventDisposables(context);
    new FlowDocRegister(context);
}

export function deactivate() {}
