import * as vscode from 'vscode';
import editorStore from './store';
import { editorEvent, EditorInfo } from '../event/editorEvent'

const baseStr = `
out.backendReceive = function backendReceive(frontend, backend, message) {};
out.frontendReceive = function frontendReceive(frontend, backend, message) {};
out.connect = function connect(frontend, backend) {};
out.dispose = function dispose() {};
`

export class ConnectEditor {
    _doc?: vscode.TextDocument;
    _ws: string;
    _title: string;
    constructor(ws: string, title: string) {
        this._ws = ws;
        this._title = title;
        this.openEditor();
    }
    async openEditor() {
        let cache = editorStore.get(this._ws);
        if(cache && cache.doc) {
            // 重新激活编辑器
            vscode.window.showTextDocument(cache.doc);
            return;
        }
        let code = cache?.code ?? this._title + '\n'+ baseStr;
        this._doc = await vscode.workspace.openTextDocument({
            content: code,
            language: "javascript"
        });
        const editorInfo: EditorInfo = {
            ws: this._ws,
            active: true,
            code,
            doc: this._doc,
        }
        editorStore.set(this._ws, editorInfo)
        editorEvent.fire(editorInfo);
        this.addDocEvent();
    }
    checkIsCurrent(doc: vscode.TextDocument) {
        return doc === this._doc;
    }
    addDocEvent() {
        let onDidChangeTextDocument = vscode.workspace.onDidChangeTextDocument(doc => {
            if(this.checkIsCurrent(doc.document)) {
                let editorInfo = {...(editorStore.get(this._ws) as EditorInfo), code: this._doc?.getText() || '' };
                editorStore.set(this._ws, editorInfo);
                editorEvent.fire(editorInfo);
            }
        });
        let onDidCloseTextDocument = vscode.workspace.onDidCloseTextDocument((doc) => {
            if(this.checkIsCurrent(doc)) {
                let item = editorStore.get(this._ws) as EditorInfo;
                item.doc = void 0;
                onDidChangeTextDocument.dispose();
                onDidCloseTextDocument.dispose();
            }
        })
    }
}