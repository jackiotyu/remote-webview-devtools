// Copyright 2014 The Chromium Authors. All rights reserved.
// Use of this source code is governed by a BSD-style license that can be
// found in the LICENSE file.
import * as Common from '../common/common.js';
import * as i18n from '../i18n/i18n.js';
import { Capability } from './Target.js';
import { SDKModel } from './SDKModel.js';
import { Events as StorageKeyManagerEvents, StorageKeyManager } from './StorageKeyManager.js';
const UIStrings = {
    /**
     *@description Text in Service Worker Cache Model
     *@example {https://cache} PH1
     *@example {error message} PH2
     */
    serviceworkercacheagentError: '`ServiceWorkerCacheAgent` error deleting cache entry {PH1} in cache: {PH2}',
};
const str_ = i18n.i18n.registerUIStrings('core/sdk/ServiceWorkerCacheModel.ts', UIStrings);
const i18nString = i18n.i18n.getLocalizedString.bind(undefined, str_);
export class ServiceWorkerCacheModel extends SDKModel {
    cacheAgent;
    #storageAgent;
    #storageKeyManager;
    #cachesInternal = new Map();
    #storageKeysUpdated = new Set();
    #throttler = new Common.Throttler.Throttler(2000);
    #enabled = false;
    // Used by tests to remove the Throttler timeout.
    #scheduleAsSoonAsPossible = false;
    /**
     * Invariant: This #model can only be constructed on a ServiceWorker target.
     */
    constructor(target) {
        super(target);
        target.registerStorageDispatcher(this);
        this.cacheAgent = target.cacheStorageAgent();
        this.#storageAgent = target.storageAgent();
        this.#storageKeyManager = target.model(StorageKeyManager);
    }
    enable() {
        if (this.#enabled) {
            return;
        }
        this.#storageKeyManager.addEventListener(StorageKeyManagerEvents.StorageKeyAdded, this.storageKeyAdded, this);
        this.#storageKeyManager.addEventListener(StorageKeyManagerEvents.StorageKeyRemoved, this.storageKeyRemoved, this);
        for (const storageKey of this.#storageKeyManager.storageKeys()) {
            this.addStorageKey(storageKey);
        }
        this.#enabled = true;
    }
    clearForStorageKey(storageKey) {
        this.removeStorageKey(storageKey);
        this.addStorageKey(storageKey);
    }
    refreshCacheNames() {
        for (const cache of this.#cachesInternal.values()) {
            this.cacheRemoved(cache);
        }
        this.#cachesInternal.clear();
        const storageKeys = this.#storageKeyManager.storageKeys();
        for (const storageKey of storageKeys) {
            void this.loadCacheNames(storageKey);
        }
    }
    async deleteCache(cache) {
        const response = await this.cacheAgent.invoke_deleteCache({ cacheId: cache.cacheId });
        if (response.getError()) {
            console.error(`ServiceWorkerCacheAgent error deleting cache ${cache.toString()}: ${response.getError()}`);
            return;
        }
        this.#cachesInternal.delete(cache.cacheId);
        this.cacheRemoved(cache);
    }
    async deleteCacheEntry(cache, request) {
        const response = await this.cacheAgent.invoke_deleteEntry({ cacheId: cache.cacheId, request });
        if (response.getError()) {
            Common.Console.Console.instance().error(i18nString(UIStrings.serviceworkercacheagentError, { PH1: cache.toString(), PH2: String(response.getError()) }));
            return;
        }
    }
    loadCacheData(cache, skipCount, pageSize, pathFilter, callback) {
        void this.requestEntries(cache, skipCount, pageSize, pathFilter, callback);
    }
    loadAllCacheData(cache, pathFilter, callback) {
        void this.requestAllEntries(cache, pathFilter, callback);
    }
    caches() {
        const caches = new Array();
        for (const cache of this.#cachesInternal.values()) {
            caches.push(cache);
        }
        return caches;
    }
    dispose() {
        for (const cache of this.#cachesInternal.values()) {
            this.cacheRemoved(cache);
        }
        this.#cachesInternal.clear();
        if (this.#enabled) {
            this.#storageKeyManager.removeEventListener(StorageKeyManagerEvents.StorageKeyAdded, this.storageKeyAdded, this);
            this.#storageKeyManager.removeEventListener(StorageKeyManagerEvents.StorageKeyRemoved, this.storageKeyRemoved, this);
        }
    }
    addStorageKey(storageKey) {
        void this.loadCacheNames(storageKey);
        void this.#storageAgent.invoke_trackCacheStorageForStorageKey({ storageKey });
    }
    removeStorageKey(storageKey) {
        for (const [opaqueId, cache] of this.#cachesInternal.entries()) {
            if (cache.storageKey === storageKey) {
                this.#cachesInternal.delete(opaqueId);
                this.cacheRemoved(cache);
            }
        }
        void this.#storageAgent.invoke_untrackCacheStorageForStorageKey({ storageKey });
    }
    async loadCacheNames(storageKey) {
        const response = await this.cacheAgent.invoke_requestCacheNames({ storageKey });
        if (response.getError()) {
            return;
        }
        this.updateCacheNames(storageKey, response.caches);
    }
    updateCacheNames(storageKey, cachesJson) {
        function deleteAndSaveOldCaches(cache) {
            if (cache.storageKey === storageKey && !updatingCachesIds.has(cache.cacheId)) {
                oldCaches.set(cache.cacheId, cache);
                this.#cachesInternal.delete(cache.cacheId);
            }
        }
        const updatingCachesIds = new Set();
        const newCaches = new Map();
        const oldCaches = new Map();
        for (const cacheJson of cachesJson) {
            const cache = new Cache(this, cacheJson.storageKey, cacheJson.cacheName, cacheJson.cacheId);
            updatingCachesIds.add(cache.cacheId);
            if (this.#cachesInternal.has(cache.cacheId)) {
                continue;
            }
            newCaches.set(cache.cacheId, cache);
            this.#cachesInternal.set(cache.cacheId, cache);
        }
        this.#cachesInternal.forEach(deleteAndSaveOldCaches, this);
        newCaches.forEach(this.cacheAdded, this);
        oldCaches.forEach(this.cacheRemoved, this);
    }
    storageKeyAdded(event) {
        this.addStorageKey(event.data);
    }
    storageKeyRemoved(event) {
        this.removeStorageKey(event.data);
    }
    cacheAdded(cache) {
        this.dispatchEventToListeners(Events.CacheAdded, { model: this, cache: cache });
    }
    cacheRemoved(cache) {
        this.dispatchEventToListeners(Events.CacheRemoved, { model: this, cache: cache });
    }
    async requestEntries(cache, skipCount, pageSize, pathFilter, callback) {
        const response = await this.cacheAgent.invoke_requestEntries({ cacheId: cache.cacheId, skipCount, pageSize, pathFilter });
        if (response.getError()) {
            console.error('ServiceWorkerCacheAgent error while requesting entries: ', response.getError());
            return;
        }
        callback(response.cacheDataEntries, response.returnCount);
    }
    async requestAllEntries(cache, pathFilter, callback) {
        const response = await this.cacheAgent.invoke_requestEntries({ cacheId: cache.cacheId, pathFilter });
        if (response.getError()) {
            console.error('ServiceWorkerCacheAgent error while requesting entries: ', response.getError());
            return;
        }
        callback(response.cacheDataEntries, response.returnCount);
    }
    cacheStorageListUpdated({ storageKey }) {
        this.#storageKeysUpdated.add(storageKey);
        void this.#throttler.schedule(() => {
            const promises = Array.from(this.#storageKeysUpdated, key => this.loadCacheNames(key));
            this.#storageKeysUpdated.clear();
            return Promise.all(promises);
        }, this.#scheduleAsSoonAsPossible);
    }
    cacheStorageContentUpdated({ storageKey, cacheName }) {
        this.dispatchEventToListeners(Events.CacheStorageContentUpdated, { storageKey, cacheName });
    }
    indexedDBListUpdated(_event) {
    }
    indexedDBContentUpdated(_event) {
    }
    interestGroupAccessed(_event) {
    }
    sharedStorageAccessed(_event) {
    }
    storageBucketCreatedOrUpdated(_event) {
    }
    storageBucketDeleted(_event) {
    }
    setThrottlerSchedulesAsSoonAsPossibleForTest() {
        this.#scheduleAsSoonAsPossible = true;
    }
}
// TODO(crbug.com/1167717): Make this a const enum again
// eslint-disable-next-line rulesdir/const_enum
export var Events;
(function (Events) {
    Events["CacheAdded"] = "CacheAdded";
    Events["CacheRemoved"] = "CacheRemoved";
    Events["CacheStorageContentUpdated"] = "CacheStorageContentUpdated";
})(Events || (Events = {}));
export class Cache {
    #model;
    storageKey;
    cacheName;
    cacheId;
    constructor(model, storageKey, cacheName, cacheId) {
        this.#model = model;
        this.storageKey = storageKey;
        this.cacheName = cacheName;
        this.cacheId = cacheId;
    }
    equals(cache) {
        return this.cacheId === cache.cacheId;
    }
    toString() {
        return this.storageKey + this.cacheName;
    }
    async requestCachedResponse(url, requestHeaders) {
        const response = await this.#model.cacheAgent.invoke_requestCachedResponse({ cacheId: this.cacheId, requestURL: url, requestHeaders });
        if (response.getError()) {
            return null;
        }
        return response.response;
    }
}
SDKModel.register(ServiceWorkerCacheModel, { capabilities: Capability.Storage, autostart: false });
//# map=ServiceWorkerCacheModel.js.map