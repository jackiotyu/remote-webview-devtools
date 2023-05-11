import * as vscode from 'vscode';

export default class OutputChannel {
    private static defaultChannel = vscode.window.createOutputChannel('RWD Log');
    private static debugChannel = vscode.window.createOutputChannel('RWD Debug');
    private static debugChannelVisible = false;
    private static defaultChannelVisible = false;
    public static dispose = () => {
        this.defaultChannel.dispose();
        this.debugChannel.dispose();
    };
    static print(...args: string[]) {
        this.defaultChannel.appendLine(`[${new Date().toLocaleString()}]`);
        args.forEach((item) => {
            this.defaultChannel.appendLine(item);
        });
        this.defaultChannel.appendLine('');
    }
    static printDebug(...args: string[]) {
        this.debugChannel.appendLine(`[${new Date().toLocaleString()}]`);
        args.forEach((item) => {
            this.debugChannel.appendLine(item);
        });
        this.debugChannel.appendLine('');
    }
    static toggleLogDebugChannel() {
        if(this.debugChannelVisible) {
            this.debugChannel.hide();
            this.debugChannelVisible = false;
        } else {
            this.debugChannel.show();
            this.debugChannelVisible = true;
        }
    }
    static togglePrintChannel() {
        if(this.debugChannelVisible) {
            this.defaultChannel.hide();
            this.defaultChannelVisible = false;
        } else {
            this.defaultChannel.show();
            this.defaultChannelVisible = true;
        }
    }
}
