import * as vscode from 'vscode';
import vm from 'node:vm';
import { exec } from 'child_process';
import { promisify } from 'node:util'
import GlobalStorage from '../adaptor/globalStorage';
const execPromise = promisify(exec);

export function compilerFlow(flow: string) {
    console.log('compilerFlow exec', GlobalStorage.getStoragePath())
    return execPromise('tsc', {
        cwd: GlobalStorage.getStoragePath()
    }).then(res => {
        console.log('compilerFlow res', { res });
        if(res.stderr) {
            vscode.window.showErrorMessage('[编译文件失败]: ' + res.stderr);
            return false;
        }
        return true;
    }).catch(reason => {
        vscode.window.showErrorMessage('[编译文件失败]: ' + reason);
        return false;
    })
}

export function compilerScript(name: string) {
    let content = GlobalStorage.getJsScriptContent(name);
    let script = new vm.Script(content);
    let base = { exports: {}, require: require, setImmediate, setTimeout, setInterval, console };
    let context = vm.createContext({ module: base, exports: base.exports })
    script.runInContext(context);
    console.log(base, 'module')
    return base.exports as { default: { trigger?: (...args: any[]) => any } }
}