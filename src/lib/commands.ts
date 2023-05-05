import * as vscode from 'vscode';
import * as net from 'net';
import { FrontEndWebview } from './webview';
import { CommandName } from '../constants';
import { Execute } from './adb/execute';
import { getWebViewPages, findDevices, findWebViews } from './adb/bridge';
import { pickWebViewPage } from './adb/ui';
import { adbEvent } from './event/adbEvent';
import { PageDetailItem, PageItem } from './explorer/adbTreeItem';

async function trackDevices(context: vscode.ExtensionContext) {
    try {
        let config = await Execute.run({ port: 5555 });
        if(!config) {return;}
        let pages = await getWebViewPages(config.port);
        if(!pages.length) {
            vscode.window.showErrorMessage(`没有找到可用的页面`);
            return;
        }
        let page = await pickWebViewPage(pages);
        if(!page) {return;}
        openWebview(context, page.webSocketDebuggerUrl, page.title);
    } catch (err: any) {
        vscode.window.showErrorMessage(err.message);
    }
}

async function openWebview(context: vscode.ExtensionContext, wsLink?: string, title?: string) {
    if (!wsLink) {
        wsLink = await vscode.window.showInputBox({
            title: '输入websocket链接',
            placeHolder: '输入websocket链接，例如ws://127.0.0.1:9229/xx',
            validateInput(value) {
                const ip = value.replace(/wss?:\/\//, '').split(':').shift() || '';
                if (ip !== 'localhost' && !net.isIP(ip)) {
                    return '请输入正确的ip链接';
                }
                return null;
            },
        });
    }
    if (!wsLink) {
        return;
    }
    new FrontEndWebview(context, { title: title || 'debug webview', ws: wsLink });
}

async function refreshAdbDevices() {
    const devices = await findDevices();
    adbEvent.fire(devices.map(item => ({...item, webViews: []})));
}

function copyDetail(item: PageDetailItem) {
    vscode.env.clipboard.writeText(String(item.description));
}

function openSetting() {
    void vscode.commands.executeCommand('workbench.action.openSettings', `@ext:jackiotyu.remote-webview-devtools` );
}

function connectDevtoolsProtocol(item: PageItem) {
    if(!item || !item.page) {
        return;
    }
}

export class CommandsManager {
    private context: vscode.ExtensionContext;
    constructor(context: vscode.ExtensionContext) {
        this.context = context;
        this.context.subscriptions.push(
            vscode.commands.registerCommand(CommandName.openWebview, (wsLink: string, title?: string) =>
                openWebview(this.context, wsLink, title),
            ),
            vscode.commands.registerCommand(CommandName.trackDevices, () => trackDevices(this.context)),
            vscode.commands.registerCommand(CommandName.refreshAdbDevices, refreshAdbDevices),
            vscode.commands.registerCommand(CommandName.copyDetail, copyDetail),
            vscode.commands.registerCommand(CommandName.openSetting, openSetting),
            vscode.commands.registerCommand(CommandName.connectDevtoolsProtocol, connectDevtoolsProtocol)
        );
        this.context.subscriptions.push({
            dispose: () => {
                (this.context as any) = null;
            },
        });
    }
}
