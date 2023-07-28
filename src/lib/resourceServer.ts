import * as vscode from 'vscode';
import http from 'http';
import type { AddressInfo } from 'net';
import finalHandler from 'finalhandler';
import serverStatic from 'serve-static';

const MAX_CONNECTIONS = 1000;

let server: http.Server;

export function getServer(context: vscode.ExtensionContext): http.Server {
    if (!server) {
        const resourcePath = vscode.Uri.joinPath(context.extensionUri, 'front_end').fsPath;
        const serve = serverStatic(resourcePath, {
            etag: false,
            cacheControl: false,
            maxAge: 0, //'1d',
        });
        server = http.createServer((req, res) => {
            serve(req, res, finalHandler(req, res));
        });
        server.maxConnections = MAX_CONNECTIONS;
        server.listen(0);
    }
    return server;
}

export function getAddress(context: vscode.ExtensionContext) {
    const server = getServer(context);
    const addressInfo = server.address() as AddressInfo;
    return `http://localhost:${addressInfo.port}`;
}

export function closeServer() {
    server?.close();
}
