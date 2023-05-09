import * as vscode from 'vscode';
import fs from 'fs-extra';
import path from 'path';
import { nanoid } from 'nanoid'
import { ModuleType } from '../../../protocol/flow'
import { FLOW_EXT_NAME } from '../../constants';
import { initialElements } from '../tpl/data'

export default class GlobalStorage {
    private static storageUri: vscode.Uri;
    private static scriptPath: string;
    private static flowPath: string;
    private static flowExtName: string = FLOW_EXT_NAME;
    private static storagePath: string;
    private static protocolPath: string;
    private static tplPath: string;
    private static outScriptPath: string;
    static init(context: vscode.ExtensionContext) {
        this.storageUri = context.globalStorageUri;
        this.storagePath = this.storageUri.fsPath;
        this.protocolPath = path.join(context.extensionPath, 'protocol');
        this.scriptPath = path.join(this.storageUri.fsPath, 'script');
        this.tplPath = path.join(this.storagePath, 'tpl');
        this.flowPath = path.join(this.storageUri.fsPath, 'flow');
        this.outScriptPath = path.join(this.storagePath, 'out', 'script');
        console.log(this.storagePath, 'storagePath')
        if(!fs.existsSync(this.tplPath)) {
            fs.copySync(this.protocolPath, this.storagePath);
        }
    }
    static getStoragePath() {
        return this.storagePath;
    }
    static getScriptPath(name: string, isOutFile = false) {
        if(isOutFile) {
            return path.join(this.outScriptPath, name + '.js')
        }
        return path.join(this.scriptPath, name + '.ts')
    }
    static getScriptTplPath(type: ModuleType) {
        return path.join(this.tplPath, type + '.ts')
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
    /** 获取脚本模板内容 */
    static getScriptTpl(type: ModuleType) {
        const filePath = this.getScriptTplPath(type);
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
    static getScriptList() {
        fs.ensureDirSync(this.scriptPath);
        return fs.readdirSync(this.scriptPath).filter(i => i.endsWith('.ts'));
    }
    static getFlowList() {
        fs.ensureDirSync(this.flowPath);
        let reg = new RegExp(this.flowExtName.replace('.', '\.') + '$', 'i');
        return fs.readdirSync(this.flowPath).filter(i => reg.test(i)).map(i => i.replace(this.flowExtName, ''));
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
    static generateFlow() {
        let filePath = this.getFlowPath(nanoid());
        this.safeSaveFile(filePath, JSON.stringify(initialElements));
        return filePath;
    }
    static renameFlow(oldName: string, newName: string) {
        let oldPath = this.getFlowPath(oldName);
        let newPath = this.getFlowPath(newName);
        fs.ensureFileSync(oldPath);
        fs.renameSync(oldPath, newPath);
    }
    static deleteFlow(name:string) {
        const filePath = this.getFlowPath(name);
        fs.removeSync(filePath);
    }
    static getJsScriptContent(name: string) {
        let filepath = this.getScriptPath(name, true);
        fs.ensureFileSync(filepath);
        return fs.readFileSync(filepath, 'utf-8');
    }
}