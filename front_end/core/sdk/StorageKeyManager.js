// Copyright 2022 The Chromium Authors. All rights reserved.
// Use of this source code is governed by a BSD-style license that can be
// found in the LICENSE file.
import { Capability } from './Target.js';
import { SDKModel } from './SDKModel.js';
import * as Common from '../common/common.js';
export class StorageKeyManager extends SDKModel {
    #mainStorageKeyInternal;
    #storageKeysInternal;
    constructor(target) {
        super(target);
        this.#mainStorageKeyInternal = '';
        this.#storageKeysInternal = new Set();
    }
    updateStorageKeys(storageKeys) {
        const oldStorageKeys = this.#storageKeysInternal;
        this.#storageKeysInternal = storageKeys;
        for (const storageKey of oldStorageKeys) {
            if (!this.#storageKeysInternal.has(storageKey)) {
                this.dispatchEventToListeners(Events.StorageKeyRemoved, storageKey);
            }
        }
        for (const storageKey of this.#storageKeysInternal) {
            if (!oldStorageKeys.has(storageKey)) {
                this.dispatchEventToListeners(Events.StorageKeyAdded, storageKey);
            }
        }
    }
    storageKeys() {
        return [...this.#storageKeysInternal];
    }
    mainStorageKey() {
        return this.#mainStorageKeyInternal;
    }
    setMainStorageKey(storageKey) {
        this.#mainStorageKeyInternal = storageKey;
        this.dispatchEventToListeners(Events.MainStorageKeyChanged, {
            mainStorageKey: this.#mainStorageKeyInternal,
        });
    }
}
export function parseStorageKey(storageKeyString) {
    // Based on the canonical implementation of StorageKey::Deserialize in
    // third_party/blink/common/storage_key/storage_key.cc
    const components = storageKeyString.split('^');
    const origin = Common.ParsedURL.ParsedURL.extractOrigin(components[0]);
    const storageKey = { origin, components: new Map() };
    for (let i = 1; i < components.length; ++i) {
        storageKey.components.set(components[i].charAt(0), components[i].substring(1));
    }
    return storageKey;
}
// TODO(crbug.com/1167717): Make this a const enum again
// eslint-disable-next-line rulesdir/const_enum
export var Events;
(function (Events) {
    Events["StorageKeyAdded"] = "StorageKeyAdded";
    Events["StorageKeyRemoved"] = "StorageKeyRemoved";
    Events["MainStorageKeyChanged"] = "MainStorageKeyChanged";
})(Events || (Events = {}));
// TODO(jarhar): this is the one of the two usages of Capability.None. Do something about it!
SDKModel.register(StorageKeyManager, { capabilities: Capability.None, autostart: false });
//# map=StorageKeyManager.js.map