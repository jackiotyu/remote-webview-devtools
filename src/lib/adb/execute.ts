/**
 * Copyright (c) 2018-2022 Michael Potthoff
 *
 * This file is part of vscode-android-webview-debug.
 *
 * vscode-android-webview-debug is free software: you can redistribute it and/or modify
 * it under the terms of the GNU Lesser General Public License as published by
 * the Free Software Foundation, either version 3 of the License, or
 * (at your option) any later version.
 *
 * vscode-android-webview-debug is distributed in the hope that it will be useful,
 * but WITHOUT ANY WARRANTY; without even the implied warranty of
 * MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE. See the
 * GNU Lesser General Public License for more details.
 *
 * You should have received a copy of the GNU Lesser General Public License
 * along with vscode-android-webview-debug. If not, see <http://www.gnu.org/licenses/>.
 */

import * as vscode from "vscode";

import * as bridge from "./bridge";
import * as ui from "./ui";

interface AdbConfig {
    port: number;
    connectTimeout?: number;
    application?: string;
}


export class Execute {
    static async run(config: AdbConfig): Promise<AdbConfig | null | undefined> {
        // Test the bridge to ensure that the required executables exist
        await bridge.test();

        return await vscode.window.withProgress({
            location: vscode.ProgressLocation.Notification
        }, async (progress) => {
            let device: bridge.Device | undefined;
            let webView: bridge.WebView | undefined;

            progress.report({ message: "Loading devices..." });

            // Find the connected devices
            const devices = await bridge.findDevices();
            if (devices.length < 1) {
                // vscode.window.showErrorMessage(`No devices found`);
                vscode.window.showErrorMessage(`没有找到设备`);
                return undefined;
            }

            if (!device) {
                // Ask the user to select a connected device
                const pickedDevice = await ui.pickDevice(devices);
                if (!pickedDevice) {
                    return undefined;
                }

                device = pickedDevice;
            }

            if (!webView) {
                progress.report({ message: "加载 WebView 中..." });
                // progress.report({ message: "Loading WebViews..." });

                const webViews = await withTimeoutRetries(config.connectTimeout ?? 0, 500, async () => {
                    // Find the running applications
                    const webViews = await bridge.findWebViews(device!);
                    if (webViews.length < 1) {
                        return undefined;
                    }

                    if (config.application) {
                        // Try to find the configured application
                        const filtered = webViews.filter((el) => el.packageName === config.application);
                        if (filtered.length < 1) {
                            return undefined;
                        }

                        return filtered;
                    } else {
                        return webViews;
                    }
                });

                if (!webViews || webViews.length < 1) {
                    // vscode.window.showErrorMessage(`No matching WebViews found`);
                    vscode.window.showErrorMessage(`没有匹配到 WebView`);
                    return undefined;
                }

                // Ask the user to select a webview
                const pickedWebView = await ui.pickWebView(webViews);
                if (!pickedWebView) {
                    return undefined;
                }

                webView = pickedWebView;
            }

            // progress.report({ message: "Forwarding debugger..." });
            progress.report({ message: "正在打开 debugger..." });

            // Forward the debugger to the local port
            config.port = await bridge.forwardDebugger(webView, config.port);

            // vscode.window.showInformationMessage(`Connected to ${webView.packageName ?? "unknown"} on ${webView.device.serial}`);
            vscode.window.showInformationMessage(`已连接 ${webView.device.serial} 的 ${webView.packageName ?? "unknown"}`);

            return config;
        });
    }
}

function withTimeoutRetries<T>(timeout: number, interval: number, func: () => Promise<T>): Promise<T> {
    const startTime = new Date().valueOf();

    const run = async (): Promise<T> => {
        const result = await func();
        if (result || startTime + timeout <= new Date().valueOf()) {
            return result;
        }

        await new Promise((resolve) => setTimeout(resolve, interval, null));

        return run();
    };

    return run();
}