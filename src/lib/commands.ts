import * as vscode from 'vscode';
import * as net from 'net';
import { ConnectEditor } from './editor/connectEditor'
import { FrontEndWebview } from './webview';
import { CommandName, FLOW_EDITOR } from '../constants';
import { Execute } from './adb/execute';
import { getWebViewPages, findDevices } from './adb/bridge';
import { pickWebViewPage } from './adb/ui';
import { adbEvent } from './event/adbEvent';
import { flowEvent } from './event/flowEvent';
import { PageDetailItem, PageItem } from './explorer/adbTreeItem';
import { FlowItem } from './explorer/flowTreeItem';
import GlobalStorage from './adaptor/globalStorage';

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
            title: '输入webSocket链接',
            placeHolder: '输入webSocket链接，例如ws://127.0.0.1:9229/xx',
            validateInput(value) {
                const ip = value.replace(/wss?:\/\//, '').split(':').shift() || '';
                if (ip !== 'localhost' && !net.isIP(ip)) {
                    return '请输入正确的webSocket链接';
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

async function connectDevtoolsProtocol(item: PageItem) {
    if(!item || !item.page) {
        return;
    }
    try {
        let { title, url, webSocketDebuggerUrl } = item.page;
        const headerText = '// '+ [title,url,webSocketDebuggerUrl].join('\n// ')
        new ConnectEditor(item.page.webSocketDebuggerUrl, headerText);
    } catch (err) {
        console.log(err, 'err');
    }
}

async function addFlow() {
    let filePath = GlobalStorage.generateFlow();
    let fileUri = vscode.Uri.file(filePath);
    void await vscode.commands.executeCommand("vscode.openWith", fileUri, FLOW_EDITOR);
    flowEvent.fire();
}

async function openFlow(name: string) {
    let filePath = GlobalStorage.getFlowPath(name);
    let fileUri = vscode.Uri.file(filePath);
    void await vscode.commands.executeCommand("vscode.openWith", fileUri, FLOW_EDITOR);
}

async function renameFlow(item: FlowItem) {
    let newName = await vscode.window.showInputBox({
        placeHolder: "请输入新名称",
        title: '修改flow名称',
        value: item.label as string,
        validateInput(value) {
            if(!value) return '请输入名称';
            if(value === item.label) return '与旧名称相同';
            if(GlobalStorage.existsFlow(value)) return '同名文件已存在';
        },
    });
    if(!newName) return;
    GlobalStorage.renameFlow(item.label as string, newName);
    flowEvent.fire();
}

async function deleteFlow(item: FlowItem) {
    const ok = '确定';
    const cancel = '取消'
    let confirm = await vscode.window.showWarningMessage('确定删除？', ok, cancel);
    if(confirm !== ok) return;
    GlobalStorage.deleteFlow(item.label as string);
    flowEvent.fire();
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
            vscode.commands.registerCommand(CommandName.connectDevtoolsProtocol, (item: PageItem) => connectDevtoolsProtocol(item)),
            vscode.commands.registerCommand(CommandName.addFlow, () => addFlow()),
            vscode.commands.registerCommand(CommandName.openFlow, openFlow),
            vscode.commands.registerCommand(CommandName.renameFlow, (name: FlowItem) => renameFlow(name)),
            vscode.commands.registerCommand(CommandName.deleteFlow, (name: FlowItem) => deleteFlow(name)),
        );
        this.context.subscriptions.push({
            dispose: () => {
                (this.context as any) = null;
            },
        });
    }
}
