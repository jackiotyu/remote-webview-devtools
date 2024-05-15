import * as vscode from 'vscode';
import { clearAllFrontEndPanel } from './lib/puppeteerPanel'
import { CommandsManager } from './lib/commands';
import { closeWsServer } from './lib/tunnel/tunnel';
import { TreeDataManager } from './lib/explorer/index';
import EventDisposables from './lib/event/index';
import ChannelMap from './lib/event/tunnelEvent';
import FlowDocRegister from './lib/editor/flowDocProvider';
import OutputChannel from './lib/output/outputChannel';
import GlobalStorage from './lib/adaptor/globalStorage';
import QRCodeViewRegister from './lib/webviewQRCode';

export function activate(context: vscode.ExtensionContext) {
    GlobalStorage.init(context);
    new CommandsManager(context);
    context.subscriptions.push({ dispose: clearAllFrontEndPanel });
    context.subscriptions.push({ dispose: closeWsServer });
    context.subscriptions.push({ dispose: OutputChannel.dispose });
    context.subscriptions.push({ dispose: () => ChannelMap.forEach(event => event.dispose()) });
    new TreeDataManager(context);
    new EventDisposables(context);
    new FlowDocRegister(context);
    new QRCodeViewRegister(context);
}

export function deactivate() {}
