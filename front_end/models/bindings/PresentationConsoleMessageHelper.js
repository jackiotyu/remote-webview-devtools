/*
 * Copyright (C) 2012 Google Inc. All rights reserved.
 *
 * Redistribution and use in source and binary forms, with or without
 * modification, are permitted provided that the following conditions are
 * met:
 *
 *     * Redistributions of source code must retain the above copyright
 * notice, this list of conditions and the following disclaimer.
 *     * Redistributions in binary form must reproduce the above
 * copyright notice, this list of conditions and the following disclaimer
 * in the documentation and/or other materials provided with the
 * distribution.
 *     * Neither the name of Google Inc. nor the names of its
 * contributors may be used to endorse or promote products derived from
 * this software without specific prior written permission.
 *
 * THIS SOFTWARE IS PROVIDED BY THE COPYRIGHT HOLDERS AND CONTRIBUTORS
 * "AS IS" AND ANY EXPRESS OR IMPLIED WARRANTIES, INCLUDING, BUT NOT
 * LIMITED TO, THE IMPLIED WARRANTIES OF MERCHANTABILITY AND FITNESS FOR
 * A PARTICULAR PURPOSE ARE DISCLAIMED. IN NO EVENT SHALL THE COPYRIGHT
 * OWNER OR CONTRIBUTORS BE LIABLE FOR ANY DIRECT, INDIRECT, INCIDENTAL,
 * SPECIAL, EXEMPLARY, OR CONSEQUENTIAL DAMAGES (INCLUDING, BUT NOT
 * LIMITED TO, PROCUREMENT OF SUBSTITUTE GOODS OR SERVICES; LOSS OF USE,
 * DATA, OR PROFITS; OR BUSINESS INTERRUPTION) HOWEVER CAUSED AND ON ANY
 * THEORY OF LIABILITY, WHETHER IN CONTRACT, STRICT LIABILITY, OR TORT
 * (INCLUDING NEGLIGENCE OR OTHERWISE) ARISING IN ANY WAY OUT OF THE USE
 * OF THIS SOFTWARE, EVEN IF ADVISED OF THE POSSIBILITY OF SUCH DAMAGE.
 */
import * as SDK from '../../core/sdk/sdk.js';
import * as TextUtils from '../text_utils/text_utils.js';
import * as Workspace from '../workspace/workspace.js';
import { DebuggerWorkspaceBinding } from './DebuggerWorkspaceBinding.js';
import { LiveLocationPool, LiveLocationWithPool } from './LiveLocation.js';
import { CSSWorkspaceBinding } from './CSSWorkspaceBinding.js';
const targetToMessageHelperMap = new WeakMap();
export class PresentationConsoleMessageManager {
    constructor() {
        SDK.TargetManager.TargetManager.instance().observeModels(SDK.DebuggerModel.DebuggerModel, this);
        SDK.TargetManager.TargetManager.instance().observeModels(SDK.CSSModel.CSSModel, this);
        SDK.TargetManager.TargetManager.instance().addModelListener(SDK.ConsoleModel.ConsoleModel, SDK.ConsoleModel.Events.ConsoleCleared, this.consoleCleared, this);
        SDK.TargetManager.TargetManager.instance().addModelListener(SDK.ConsoleModel.ConsoleModel, SDK.ConsoleModel.Events.MessageAdded, event => this.consoleMessageAdded(event.data));
        SDK.ConsoleModel.ConsoleModel.allMessagesUnordered().forEach(this.consoleMessageAdded, this);
    }
    modelAdded(model) {
        const target = model.target();
        const helper = targetToMessageHelperMap.get(target) ?? new PresentationConsoleMessageHelper();
        if (model instanceof SDK.DebuggerModel.DebuggerModel) {
            helper.setDebuggerModel(model);
        }
        else {
            helper.setCSSModel(model);
        }
        targetToMessageHelperMap.set(target, helper);
    }
    modelRemoved(model) {
        const target = model.target();
        const helper = targetToMessageHelperMap.get(target);
        if (helper) {
            helper.consoleCleared();
        }
    }
    consoleMessageAdded(message) {
        const runtimeModel = message.runtimeModel();
        if (!message.isErrorOrWarning() || !message.runtimeModel() ||
            message.source === "violation" /* Protocol.Log.LogEntrySource.Violation */ || !runtimeModel) {
            return;
        }
        const helper = targetToMessageHelperMap.get(runtimeModel.target());
        if (helper) {
            void helper.consoleMessageAdded(message);
        }
    }
    consoleCleared() {
        for (const target of SDK.TargetManager.TargetManager.instance().targets()) {
            const helper = targetToMessageHelperMap.get(target);
            if (helper) {
                helper.consoleCleared();
            }
        }
    }
}
export class PresentationConsoleMessageHelper {
    #debuggerModel;
    #cssModel;
    #presentationMessages = new Map();
    #locationPool;
    constructor() {
        this.#locationPool = new LiveLocationPool();
        Workspace.Workspace.WorkspaceImpl.instance().addEventListener(Workspace.Workspace.Events.UISourceCodeAdded, this.#uiSourceCodeAdded.bind(this));
    }
    setDebuggerModel(debuggerModel) {
        if (this.#debuggerModel) {
            throw new Error('Cannot set DebuggerModel twice');
        }
        this.#debuggerModel = debuggerModel;
        // TODO(dgozman): queueMicrotask because we race with DebuggerWorkspaceBinding on ParsedScriptSource event delivery.
        debuggerModel.addEventListener(SDK.DebuggerModel.Events.ParsedScriptSource, event => {
            queueMicrotask(() => {
                this.#parsedScriptSource(event);
            });
        });
        debuggerModel.addEventListener(SDK.DebuggerModel.Events.GlobalObjectCleared, this.#debuggerReset, this);
    }
    setCSSModel(cssModel) {
        if (this.#cssModel) {
            throw new Error('Cannot set CSSModel twice');
        }
        this.#cssModel = cssModel;
        cssModel.addEventListener(SDK.CSSModel.Events.StyleSheetAdded, event => queueMicrotask(() => this.#styleSheetAdded(event)));
    }
    async consoleMessageAdded(message) {
        const presentation = new PresentationConsoleMessage(message, this.#locationPool);
        const location = this.#rawLocation(message) ?? this.#cssLocation(message) ?? this.#uiLocation(message);
        if (location) {
            await presentation.updateLocationSource(location);
        }
        if (message.url) {
            let messages = this.#presentationMessages.get(message.url);
            if (!messages) {
                messages = [];
                this.#presentationMessages.set(message.url, messages);
            }
            messages.push({ message, presentation });
        }
    }
    #uiLocation(message) {
        if (!message.url) {
            return null;
        }
        const uiSourceCode = Workspace.Workspace.WorkspaceImpl.instance().uiSourceCodeForURL(message.url);
        if (!uiSourceCode) {
            return null;
        }
        return new Workspace.UISourceCode.UILocation(uiSourceCode, message.line, message.column);
    }
    #cssLocation(message) {
        if (!this.#cssModel || !message.url) {
            return null;
        }
        const locations = this.#cssModel.createRawLocationsByURL(message.url, message.line, message.column);
        return locations[0] ?? null;
    }
    #rawLocation(message) {
        if (!this.#debuggerModel) {
            return null;
        }
        if (message.scriptId) {
            return this.#debuggerModel.createRawLocationByScriptId(message.scriptId, message.line, message.column);
        }
        const callFrame = message.stackTrace && message.stackTrace.callFrames ? message.stackTrace.callFrames[0] : null;
        if (callFrame) {
            return this.#debuggerModel.createRawLocationByScriptId(callFrame.scriptId, callFrame.lineNumber, callFrame.columnNumber);
        }
        if (message.url) {
            return this.#debuggerModel.createRawLocationByURL(message.url, message.line, message.column);
        }
        return null;
    }
    #parsedScriptSource(event) {
        const script = event.data;
        const messages = this.#presentationMessages.get(script.sourceURL);
        const promises = [];
        for (const { message, presentation } of messages ?? []) {
            const rawLocation = this.#rawLocation(message);
            if (rawLocation && script.scriptId === rawLocation.scriptId) {
                promises.push(presentation.updateLocationSource(rawLocation));
            }
        }
        void Promise.all(promises).then(this.parsedScriptSourceForTest.bind(this));
    }
    parsedScriptSourceForTest() {
    }
    #uiSourceCodeAdded(event) {
        const uiSourceCode = event.data;
        const messages = this.#presentationMessages.get(uiSourceCode.url());
        const promises = [];
        for (const { message, presentation } of messages ?? []) {
            promises.push(presentation.updateLocationSource(new Workspace.UISourceCode.UILocation(uiSourceCode, message.line, message.column)));
        }
        void Promise.all(promises).then(this.uiSourceCodeAddedForTest.bind(this));
    }
    uiSourceCodeAddedForTest() {
    }
    #styleSheetAdded(event) {
        const header = event.data;
        const messages = this.#presentationMessages.get(header.sourceURL);
        const promises = [];
        for (const { message, presentation } of messages ?? []) {
            if (header.containsLocation(message.line, message.column)) {
                promises.push(presentation.updateLocationSource(new SDK.CSSModel.CSSLocation(header, message.line, message.column)));
            }
        }
        void Promise.all(promises).then(this.styleSheetAddedForTest.bind(this));
    }
    styleSheetAddedForTest() {
    }
    consoleCleared() {
        this.#debuggerReset();
    }
    #debuggerReset() {
        const presentations = Array.from(this.#presentationMessages.values()).flat();
        for (const { presentation } of presentations) {
            presentation.dispose();
        }
        this.#presentationMessages.clear();
        this.#locationPool.disposeAll();
    }
}
class FrozenLiveLocation extends LiveLocationWithPool {
    #uiLocation;
    constructor(uiLocation, updateDelegate, locationPool) {
        super(updateDelegate, locationPool);
        this.#uiLocation = uiLocation;
    }
    async isIgnoreListed() {
        return false;
    }
    async uiLocation() {
        return this.#uiLocation;
    }
}
export class PresentationConsoleMessage extends Workspace.UISourceCode.Message {
    #uiSourceCode;
    #liveLocation;
    #locationPool;
    constructor(message, locationPool) {
        const level = message.level === "error" /* Protocol.Log.LogEntryLevel.Error */ ? Workspace.UISourceCode.Message.Level.Error :
            Workspace.UISourceCode.Message.Level.Warning;
        super(level, message.messageText);
        this.#locationPool = locationPool;
    }
    async updateLocationSource(source) {
        if (source instanceof SDK.DebuggerModel.Location) {
            await DebuggerWorkspaceBinding.instance().createLiveLocation(source, this.#updateLocation.bind(this), this.#locationPool);
        }
        else if (source instanceof SDK.CSSModel.CSSLocation) {
            await CSSWorkspaceBinding.instance().createLiveLocation(source, this.#updateLocation.bind(this), this.#locationPool);
        }
        else if (source instanceof Workspace.UISourceCode.UILocation) {
            if (!this.#liveLocation) { // Don't "downgrade" the location if a debugger or css mapping was already successful
                this.#liveLocation = new FrozenLiveLocation(source, this.#updateLocation.bind(this), this.#locationPool);
                await this.#liveLocation.update();
            }
        }
    }
    async #updateLocation(liveLocation) {
        if (this.#uiSourceCode) {
            this.#uiSourceCode.removeMessage(this);
        }
        if (liveLocation !== this.#liveLocation) {
            this.#uiSourceCode?.removeMessage(this);
            this.#liveLocation?.dispose();
            this.#liveLocation = liveLocation;
        }
        const uiLocation = await liveLocation.uiLocation();
        if (!uiLocation) {
            return;
        }
        this.range = TextUtils.TextRange.TextRange.createFromLocation(uiLocation.lineNumber, uiLocation.columnNumber || 0);
        this.#uiSourceCode = uiLocation.uiSourceCode;
        this.#uiSourceCode.addMessage(this);
    }
    dispose() {
        this.#uiSourceCode?.removeMessage(this);
        this.#liveLocation?.dispose();
    }
}
//# sourceMappingURL=PresentationConsoleMessageHelper.js.map