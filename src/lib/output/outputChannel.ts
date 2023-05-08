import * as vscode from 'vscode';

export default class OutputChannel {
    private static defaultChannel = vscode.window.createOutputChannel('RWD Log');
    private static debugChannel = vscode.window.createOutputChannel('RWD Debug');
    public static dispose = () => {
        this.defaultChannel.dispose();
        this.debugChannel.dispose();
    }
    static print(value: string) {
        if(typeof value === 'object') value = JSON.stringify(value);
        // this.defaultChannel.show();
        this.defaultChannel.appendLine(`[${+new Date()}]`);
        this.defaultChannel.appendLine(`${value}`);
    }
    static printDebug(value: any) {
        if(typeof value === 'object') value = JSON.stringify(value);
        // this.debugChannel.show();
        this.debugChannel.appendLine(`[CONSOLE ${+new Date()}]>>>`);
        this.debugChannel.appendLine(`${value}`);
        this.debugChannel.appendLine('');
    }
}