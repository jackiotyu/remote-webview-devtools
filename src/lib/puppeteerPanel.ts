import * as vscode from 'vscode';
import { CDPTunnel } from './tunnel/tunnel';
import { isUndefined } from '../utils/index';
import { launch } from 'puppeteer-core';
import type { Browser } from 'puppeteer-core';
import { getPlatform } from 'chrome-launcher/dist/utils';
import * as chromeFinder from 'chrome-launcher/dist/chrome-finder';
import path from 'path';

interface ViewOptions {
    title: string;
    ws: string;
}

const panelMap = new Map<string, Browser>();

export class FrontEndPanelProvider {
    private browser?: Browser;
    private options: ViewOptions;
    private url?: string;
    constructor(context: vscode.ExtensionContext, options: ViewOptions) {
        this.options = options;
        this.getBrowser(context);
    }
    async getBrowser(context: vscode.ExtensionContext) {
        const res = await ChromeDebugger.openDebugger(context, this.options.ws);
        if (!res) return;
        const { browser, url } = res;
        this.url = url;
        this.browser = browser;
        if (!this.browser) return;
        this.browser.once('disconnected', () => {
            this.browser = undefined;
            deleteFrontEndPanel(this.options.ws);
        });
        panelMap.set(this.options.ws, this.browser);
    }
    get panelInstance() {
        return this.browser;
    }
    get panelUrl() {
        return this.url;
    }
}

export class FrontEndPanel {
    panel?: Browser;
    constructor(context: vscode.ExtensionContext, private options: ViewOptions) {
        const panel = panelMap.get(options.ws);
        if (!isUndefined(panel)) {
            // 选中窗口
            this.panel = panel;
            this.bringToFront();
            return;
        }
        const newPanel = new FrontEndPanelProvider(context, options).panelInstance;
        if (newPanel) {
            this.panel = newPanel;
        }
    }
    async bringToFront() {
        if (!this.panel) return;
        const pages = await this.panel.pages();
        const targetPage = pages[0];
        await targetPage.bringToFront();
    }
}

export class ChromeDebugger {
    static getInstallation() {
        const platform = getPlatform();
        if (platform === 'darwin') {
            return chromeFinder.darwinFast();
        }
        switch (platform) {
            case 'linux':
            case 'win32':
            case 'wsl':
                const data = chromeFinder[platform]().sort((b, a) => a.localeCompare(b));
                return data[0];
            default:
                return '';
        }
    }
    static async openDebugger(
        context: vscode.ExtensionContext,
        wsDebuggerUrl: string,
    ): Promise<{ browser: Browser; url: string } | undefined> {
        try {
            const browser = await launch({
                executablePath: this.getInstallation(),
                headless: false,
                devtools: false,
                args: [
                    '--no-sandbox',
                    '--disable-setuid-sandbox',
                    '--disable-features=IsolateOrigins,site-per-process',
                    '--window-size=1000,800',
                    '--window-position=400,100',
                    // '--disable-extensions-except=C:\\Users\\jack\\AppData\\Local\\Google\\Chrome\\User Data\\Default\\Extensions\\ceondjobkkcjpcmkcggnpoenhhimmkln\\1.1.0_0',
                    // '--load-extension=C:\\Users\\jack\\AppData\\Local\\Google\\Chrome\\User Data\\Default\\Extensions\\ceondjobkkcjpcmkcggnpoenhhimmkln\\1.1.0_0',
                ],
                ignoreDefaultArgs: ['--enable-automation'],
                defaultViewport: {
                    height: 0,
                    width: 0,
                    hasTouch: false,
                    isMobile: false,
                },
                userDataDir: path.join(context.globalStorageUri.fsPath, 'puppeteer', 'userData'),
            });
            let pages = await browser.pages();
            pages[0]?.close();
            const page = await browser.newPage();
            const tunnel = new CDPTunnel(wsDebuggerUrl);
            const url = `devtools://devtools/bundled/inspector.html?ws=${tunnel.link}`;
            await page.goto(url, { waitUntil: 'domcontentloaded' });
            page.once('close', () => browser.close());
            return { browser, url };
        } catch (err) {
            console.log(err);
        }
    }
}

export function deleteFrontEndPanel(ws: string) {
    let panel = panelMap.get(ws);
    if (!panel) return;
    panel.close();
    panelMap.delete(ws);
}

export function clearAllFrontEndPanel() {
    panelMap.forEach((panel) => {
        panel.close().catch();
    });
    panelMap.clear();
}
