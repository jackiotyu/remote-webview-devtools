import * as vscode from 'vscode';
import { CommandName } from './constants';

export function activate(context: vscode.ExtensionContext) {
	context.subscriptions.push(
		vscode.commands.registerCommand(CommandName.openWebview, (wsLink: string) => {

		})
	);
}

export function deactivate() {}
