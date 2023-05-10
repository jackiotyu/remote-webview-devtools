import * as vscode from 'vscode';

export default class OutputChannel {
    private static defaultChannel = vscode.window.createOutputChannel('RWD Log');
    private static debugChannel = vscode.window.createOutputChannel('RWD Debug');
    public static dispose = () => {
        this.defaultChannel.dispose();
        this.debugChannel.dispose();
    };
    static print(...value: string[]) {
        this.defaultChannel.show();
        this.debugChannel.appendLine(`[${new Date().toLocaleString()}]`);
        value.forEach((item) => {
            this.defaultChannel.appendLine(`${item}`);
        });
        this.debugChannel.appendLine('');
    }
    static printDebug(...value: string[]) {
        this.debugChannel.show();
        this.debugChannel.appendLine(`[${new Date().toLocaleString()}]`);
        value.forEach((item) => {
            this.debugChannel.appendLine(`${item}`);
        });
        this.debugChannel.appendLine('');
    }
}
