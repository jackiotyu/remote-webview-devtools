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
            maxAge: 0//'1d',
        });
        server = http.createServer((req, res) => {
            serve(req, res, finalHandler(req, res));
        });
        server.maxConnections = MAX_CONNECTIONS;
        server.listen(0);
    }
    return server;
}

export function getPort(context: vscode.ExtensionContext) {
    const server = getServer(context);
    return (server.address() as AddressInfo)?.port;
}

export function closeServer() {
    server?.close();
}
