import * as vscode from 'vscode';
import { EXTENSION_NAME, Config } from '../../constants';

export { Config };
export class ConfigAdaptor {
    static extName = EXTENSION_NAME;
    static get(key: Config.refresh): number;
    static get(key: Config.adbPath): string;
    static get(key: Config.adbArgs): string[];
    static get(key: Config) {
        const value = vscode.workspace.getConfiguration(EXTENSION_NAME).get(key);
        if (key === Config.refresh) {
            return Number(value) || 0;
        }
        return value;
    }
    static set(key: Config, value: any) {
        vscode.workspace.getConfiguration(EXTENSION_NAME).update(key, value);
    }
    static getKey(key: Config) {
        return `${ConfigAdaptor.extName}.${key}`;
    }
}
