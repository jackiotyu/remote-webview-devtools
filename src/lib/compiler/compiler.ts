import * as vscode from 'vscode';
import vm from 'node:vm';
import { exec } from 'child_process';
import { promisify } from 'node:util';
import GlobalStorage from '../adaptor/globalStorage';
import OutputChannel from '../output/outputChannel'
import ws from 'ws';

const execPromise = promisify(exec);

export function compilerFlow(flow: string) {
    return execPromise('tsc', {
        cwd: GlobalStorage.getStoragePath(),
    })
        .then((res) => {
            if (res.stderr) {
                vscode.window.showErrorMessage('[编译文件失败]: ' + res.stderr);
                return false;
            }
            return true;
        })
        .catch((reason) => {
            vscode.window.showErrorMessage('[编译文件失败]: ' + reason);
            return false;
        });
}

export function compilerScript(name: string) {
    let content = GlobalStorage.getJsScriptContent(name);
    let script = new vm.Script(content);
    let base = { exports: {} };
    let context = vm.createContext({
        ...global,
        module: base,
        exports: base.exports,
        require,
        Logger: OutputChannel,
        window: vscode.window,
        ws,
    });
    script.runInContext(context);
    return base.exports as { default: { trigger?: (...args: any[]) => any } };
}
