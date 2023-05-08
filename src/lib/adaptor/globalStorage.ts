import * as vscode from 'vscode';
import fs from 'fs-extra';
import path from 'path';
import { FLOW_EXT_NAME } from '../../constants'

export default class GlobalStorage {
    private static storageUri: vscode.Uri;
    private static scriptPath: string;
    private static flowPath: string;
    private static flowExtName: string = FLOW_EXT_NAME;
    private static storagePath: string;
    private static protocolPath: string;
    static init(context: vscode.ExtensionContext) {
        this.storageUri = context.globalStorageUri;
        this.storagePath = this.storageUri.fsPath;
        this.protocolPath = path.join(context.extensionPath, 'protocol');
        this.scriptPath = path.join(this.storageUri.fsPath, 'script');
        this.flowPath = path.join(this.storageUri.fsPath, 'flow');
        let protocolPath = path.join(this.storagePath, 'protocol')
        console.log(this.storagePath, 'storagePath')
        if(!fs.existsSync(protocolPath)) {
            fs.copySync(this.protocolPath, protocolPath);
            fs.copyFileSync(
                path.join(this.protocolPath, 'tsconfig.json'),
                path.join(this.storagePath,  'tsconfig.json')
            );
        }

    }
    static getScriptPath(name: string) {
        return path.join(this.scriptPath, name + '.ts')
    }
    static getFlowPath(name: string) {
        return path.join(this.flowPath, name + this.flowExtName);
    }
    /** 写入脚本内容 */
    static setScript(name: string, content: string) {
        const filePath = this.getScriptPath(name);
        this.safeSaveFile(filePath, content);
    }
    /** 写入flow内容 */
    static setFlow(name: string, content: string) {
        const filePath = this.getFlowPath(name);
        this.safeSaveFile(filePath, content);
    }
    /** 获取脚本内容 */
    static getScript(name: string) {
        const filePath = this.getScriptPath(name);
        return this.safeReadFile(filePath);
    }
    /** 获取flow内容 */
    static getFlow(name: string) {
        const filePath = this.getFlowPath(name);
        return this.safeReadFile(filePath);
    }
    /** 判断脚本是否存在 */
    static existsScript(name: string) {
        const filePath = this.getScriptPath(name);
        return fs.existsSync(filePath);
    }
    /** 判断flow是否存在 */
    static existsFlow(name: string) {
        const filePath = this.getFlowPath(name);
        return fs.existsSync(filePath);
    }
    static getFlowList() {
        fs.ensureDirSync(this.flowPath);
        let reg = new RegExp(this.flowExtName.replace('.', '\.') + '$', 'i');
        return fs.readdirSync(this.flowPath).filter(i => reg.test(i));
    }
    static ensureFileSync(filePath: string) {
        fs.ensureFileSync(filePath);
    }
    /** 确保文件写入 */
    private static safeSaveFile(filePath: string, content: string) {
        fs.ensureFileSync(filePath);
        fs.writeFile(filePath, content, 'utf-8');
    }
    /** 确保文件读取 */
    private static safeReadFile(filePath: string) {
        fs.ensureFileSync(filePath);
        return fs.readFileSync(filePath, 'utf-8');
    }
}