// Copyright 2018 The Chromium Authors. All rights reserved.
// Use of this source code is governed by a BSD-style license that can be
// found in the LICENSE file.
import * as i18n from '../../core/i18n/i18n.js';
import * as SDK from '../../core/sdk/sdk.js';
/* eslint-disable jsdoc/check-alignment */
/**
 * @overview
                                                   ┌────────────┐
                                                   │CDP Backend │
                                                   └────────────┘
                                                        │ ▲
                                                        │ │ parallelConnection
                          ┌┐                            ▼ │                     ┌┐
                          ││   dispatchProtocolMessage     sendProtocolMessage  ││
                          ││                     │          ▲                   ││
          ProtocolService ││                     |          │                   ││
                          ││    sendWithResponse ▼          │                   ││
                          ││              │    send          onWorkerMessage    ││
                          └┘              │    │                 ▲              └┘
          worker boundary - - - - - - - - ┼ - -│- - - - - - - - -│- - - - - - - - - - - -
                          ┌┐              ▼    ▼                 │                    ┌┐
                          ││   onFrontendMessage      notifyFrontendViaWorkerMessage  ││
                          ││                   │       ▲                              ││
                          ││                   ▼       │                              ││
LighthouseWorkerService   ││          Either ConnectionProxy or LegacyPort            ││
                          ││                           │ ▲                            ││
                          ││     ┌─────────────────────┼─┼───────────────────────┐    ││
                          ││     │  Lighthouse    ┌────▼──────┐                  │    ││
                          ││     │                │connection │                  │    ││
                          ││     │                └───────────┘                  │    ││
                          └┘     └───────────────────────────────────────────────┘    └┘

 * All messages traversing the worker boundary are action-wrapped.
 * All messages over the parallelConnection speak pure CDP.
 * All messages within ConnectionProxy/LegacyPort speak pure CDP.
 * The foundational CDP connection is `parallelConnection`.
 * All connections within the worker are not actual ParallelConnection's.
 */
/* eslint-enable jsdoc/check-alignment */
let lastId = 1;
/**
 * ProtocolService manages a connection between the frontend (Lighthouse panel) and the Lighthouse worker.
 */
export class ProtocolService {
    mainSessionId;
    mainFrameId;
    mainTargetId;
    targetInfos;
    parallelConnection;
    lighthouseWorkerPromise;
    lighthouseMessageUpdateCallback;
    removeDialogHandler;
    configForTesting;
    async attach() {
        await SDK.TargetManager.TargetManager.instance().suspendAllTargets();
        const mainTarget = SDK.TargetManager.TargetManager.instance().primaryPageTarget();
        if (!mainTarget) {
            throw new Error('Unable to find main target required for Lighthouse');
        }
        const childTargetManager = mainTarget.model(SDK.ChildTargetManager.ChildTargetManager);
        if (!childTargetManager) {
            throw new Error('Unable to find child target manager required for Lighthouse');
        }
        const resourceTreeModel = mainTarget.model(SDK.ResourceTreeModel.ResourceTreeModel);
        if (!resourceTreeModel) {
            throw new Error('Unable to find resource tree model required for Lighthouse');
        }
        const mainFrame = resourceTreeModel.mainFrame;
        if (!mainFrame) {
            throw new Error('Unable to find main frame required for Lighthouse');
        }
        const { connection, sessionId } = await childTargetManager.createParallelConnection(message => {
            if (typeof message === 'string') {
                message = JSON.parse(message);
            }
            this.dispatchProtocolMessage(message);
        });
        // Lighthouse implements its own dialog handler like this, however its lifecycle ends when
        // the internal Lighthouse session is disposed.
        //
        // If the page is reloaded near the end of the run (e.g. bfcache testing), the Lighthouse
        // internal session can be disposed before a dialog message appears. This allows the dialog
        // to block important Lighthouse teardown operations in LighthouseProtocolService.
        //
        // To ensure the teardown operations can proceed, we need a dialog handler which lasts until
        // the LighthouseProtocolService detaches.
        const dialogHandler = () => {
            void mainTarget.pageAgent().invoke_handleJavaScriptDialog({ accept: true });
        };
        resourceTreeModel.addEventListener(SDK.ResourceTreeModel.Events.JavaScriptDialogOpening, dialogHandler);
        this.removeDialogHandler = () => resourceTreeModel.removeEventListener(SDK.ResourceTreeModel.Events.JavaScriptDialogOpening, dialogHandler);
        this.parallelConnection = connection;
        this.targetInfos = childTargetManager.targetInfos();
        this.mainFrameId = mainFrame.id;
        this.mainTargetId = await childTargetManager.getParentTargetId();
        this.mainSessionId = sessionId;
    }
    getLocales() {
        return [i18n.DevToolsLocale.DevToolsLocale.instance().locale];
    }
    async startTimespan(currentLighthouseRun) {
        const { inspectedURL, categoryIDs, flags } = currentLighthouseRun;
        if (!this.mainFrameId || !this.mainSessionId || !this.mainTargetId || !this.targetInfos) {
            throw new Error('Unable to get target info required for Lighthouse');
        }
        await this.sendWithResponse('startTimespan', {
            url: inspectedURL,
            categoryIDs,
            flags,
            config: this.configForTesting,
            locales: this.getLocales(),
            mainSessionId: this.mainSessionId,
            mainFrameId: this.mainFrameId,
            mainTargetId: this.mainTargetId,
            targetInfos: this.targetInfos,
        });
    }
    async collectLighthouseResults(currentLighthouseRun) {
        const { inspectedURL, categoryIDs, flags } = currentLighthouseRun;
        if (!this.mainFrameId || !this.mainSessionId || !this.mainTargetId || !this.targetInfos) {
            throw new Error('Unable to get target info required for Lighthouse');
        }
        let mode = flags.mode;
        if (mode === 'timespan') {
            mode = 'endTimespan';
        }
        return this.sendWithResponse(mode, {
            url: inspectedURL,
            categoryIDs,
            flags,
            config: this.configForTesting,
            locales: this.getLocales(),
            mainSessionId: this.mainSessionId,
            mainFrameId: this.mainFrameId,
            mainTargetId: this.mainTargetId,
            targetInfos: this.targetInfos,
        });
    }
    async detach() {
        const oldLighthouseWorker = this.lighthouseWorkerPromise;
        const oldParallelConnection = this.parallelConnection;
        // When detaching, make sure that we remove the old promises, before we
        // perform any async cleanups. That way, if there is a message coming from
        // lighthouse while we are in the process of cleaning up, we shouldn't deliver
        // them to the backend.
        this.lighthouseWorkerPromise = undefined;
        this.parallelConnection = undefined;
        if (oldLighthouseWorker) {
            (await oldLighthouseWorker).terminate();
        }
        if (oldParallelConnection) {
            await oldParallelConnection.disconnect();
        }
        await SDK.TargetManager.TargetManager.instance().resumeAllTargets();
        this.removeDialogHandler?.();
    }
    registerStatusCallback(callback) {
        this.lighthouseMessageUpdateCallback = callback;
    }
    dispatchProtocolMessage(message) {
        // A message without a sessionId is the main session of the main target (call it "Main session").
        // A parallel connection and session was made that connects to the same main target (call it "Lighthouse session").
        // Messages from the "Lighthouse session" have a sessionId.
        // Without some care, there is a risk of sending the same events for the same main frame to Lighthouse–the backend
        // will create events for the "Main session" and the "Lighthouse session".
        // The workaround–only send message to Lighthouse if:
        //   * the message has a sessionId (is not for the "Main session")
        //   * the message does not have a sessionId (is for the "Main session"), but only for the Target domain
        //     (to kickstart autoAttach in LH).
        const protocolMessage = message;
        if (protocolMessage.sessionId || (protocolMessage.method && protocolMessage.method.startsWith('Target'))) {
            void this.send('dispatchProtocolMessage', { message });
        }
    }
    initWorker() {
        this.lighthouseWorkerPromise = new Promise(resolve => {
            const workerUrl = new URL('../../entrypoints/lighthouse_worker/lighthouse_worker.js', import.meta.url);
            const remoteBaseSearchParam = new URL(self.location.href).searchParams.get('remoteBase');
            if (remoteBaseSearchParam) {
                // Allows Lighthouse worker to fetch remote locale files.
                workerUrl.searchParams.set('remoteBase', remoteBaseSearchParam);
            }
            const worker = new Worker(workerUrl, { type: 'module' });
            worker.addEventListener('message', event => {
                if (event.data === 'workerReady') {
                    resolve(worker);
                    return;
                }
                this.onWorkerMessage(event);
            });
        });
        return this.lighthouseWorkerPromise;
    }
    async ensureWorkerExists() {
        let worker;
        if (!this.lighthouseWorkerPromise) {
            worker = await this.initWorker();
        }
        else {
            worker = await this.lighthouseWorkerPromise;
        }
        return worker;
    }
    onWorkerMessage(event) {
        const lighthouseMessage = event.data;
        if (lighthouseMessage.action === 'statusUpdate') {
            if (this.lighthouseMessageUpdateCallback && lighthouseMessage.args && 'message' in lighthouseMessage.args) {
                this.lighthouseMessageUpdateCallback(lighthouseMessage.args.message);
            }
        }
        else if (lighthouseMessage.action === 'sendProtocolMessage') {
            if (lighthouseMessage.args && 'message' in lighthouseMessage.args) {
                this.sendProtocolMessage(lighthouseMessage.args.message);
            }
        }
    }
    sendProtocolMessage(message) {
        if (this.parallelConnection) {
            this.parallelConnection.sendRawMessage(message);
        }
    }
    async send(action, args = {}) {
        const worker = await this.ensureWorkerExists();
        const messageId = lastId++;
        worker.postMessage({ id: messageId, action, args: { ...args, id: messageId } });
    }
    /** sendWithResponse currently only handles the original startLighthouse request and LHR-filled response. */
    async sendWithResponse(action, args = {}) {
        const worker = await this.ensureWorkerExists();
        const messageId = lastId++;
        const messageResult = new Promise(resolve => {
            const workerListener = (event) => {
                const lighthouseMessage = event.data;
                if (lighthouseMessage.id === messageId) {
                    worker.removeEventListener('message', workerListener);
                    resolve(lighthouseMessage.result);
                }
            };
            worker.addEventListener('message', workerListener);
        });
        worker.postMessage({ id: messageId, action, args: { ...args, id: messageId } });
        return messageResult;
    }
}
//# map=LighthouseProtocolService.js.map