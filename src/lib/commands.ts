import * as vscode from 'vscode';
import * as net from 'net';
import { FrontEndWebview } from './webview';
import { CommandName } from '../constants';
import { Execute } from './adb/execute';
import { getWebViewPages, findDevices, findWebViews } from './adb/bridge';
import { pickWebViewPage } from './adb/ui';
import { adbEvent } from './event/adbEvent';
import { DeviceItem, WebViewItem } from './explorer/adbTreeItem';

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
    // const tracker = await ADB.trackDevices();
    // tracker.on('add', async (device: Device) => {
    //     console.log('Device %s was plugged in', device.id);
    //     console.log('all', await ADB.listDevices());
    //     console.log(await ADB.client.getDevice(device.id).tcpip(5555));
    // });
    // tracker.on('remove', (device: Device) => {
    //     console.log('Device %s was unplugged', device.id);
    // });
    // tracker.on('end', () => console.log('Tracking stopped'));
}

async function openWebview(context: vscode.ExtensionContext, wsLink?: string, title?: string) {
    if (!wsLink) {
        wsLink = await vscode.window.showInputBox({
            title: '输入websocket链接',
            placeHolder: '输入websocket链接，例如127.0.0.1:9229/xx',
            validateInput(value) {
                const ip = value.replace('ws://', '').split(':').shift() || '';
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
    new FrontEndWebview(context, { title: title || 'webview', ws: wsLink });
}

async function refreshAdbDevices() {
    const devices = await findDevices();
    adbEvent.fire(devices.map(item => ({...item, webViews: []})));
}

async function refreshWebViews(item: DeviceItem) {
    const webViews = await findWebViews(item.device);
    return webViews;
}
async function refreshPages(item: WebViewItem) {
    const pages = await getWebViewPages(item.port);
    return pages;
}

export class CommandsManager {
    private context: vscode.ExtensionContext;
    constructor(context: vscode.ExtensionContext) {
        this.context = context;
        this.context.subscriptions.push(
            vscode.commands.registerCommand(CommandName.openWebview, (wsLink: string) =>
                openWebview(this.context, wsLink),
            ),
            vscode.commands.registerCommand(CommandName.trackDevices, () => trackDevices(this.context)),
            vscode.commands.registerCommand(CommandName.refreshAdbDevices, () => refreshAdbDevices()),
            vscode.commands.registerCommand(CommandName.refreshWebViews, (item: DeviceItem) =>  refreshWebViews(item)),
            vscode.commands.registerCommand(CommandName.refreshPages, (item: WebViewItem) =>  refreshPages(item)),
        );
        this.context.subscriptions.push({
            dispose: () => {
                (this.context as any) = null;
            },
        });
    }
}
