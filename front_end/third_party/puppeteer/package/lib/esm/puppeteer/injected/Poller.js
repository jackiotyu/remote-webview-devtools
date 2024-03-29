/**
 * Copyright 2022 Google Inc. All rights reserved.
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *     http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */
import { assert } from '../util/assert.js';
import { Deferred } from '../util/Deferred.js';
/**
 * @internal
 */
export class MutationPoller {
    #fn;
    #root;
    #observer;
    #deferred;
    constructor(fn, root) {
        this.#fn = fn;
        this.#root = root;
    }
    async start() {
        const deferred = (this.#deferred = Deferred.create());
        const result = await this.#fn();
        if (result) {
            deferred.resolve(result);
            return;
        }
        this.#observer = new MutationObserver(async () => {
            const result = await this.#fn();
            if (!result) {
                return;
            }
            deferred.resolve(result);
            await this.stop();
        });
        this.#observer.observe(this.#root, {
            childList: true,
            subtree: true,
            attributes: true,
        });
    }
    async stop() {
        assert(this.#deferred, 'Polling never started.');
        if (!this.#deferred.finished()) {
            this.#deferred.reject(new Error('Polling stopped'));
        }
        if (this.#observer) {
            this.#observer.disconnect();
            this.#observer = undefined;
        }
    }
    result() {
        assert(this.#deferred, 'Polling never started.');
        return this.#deferred.valueOrThrow();
    }
}
/**
 * @internal
 */
export class RAFPoller {
    #fn;
    #deferred;
    constructor(fn) {
        this.#fn = fn;
    }
    async start() {
        const deferred = (this.#deferred = Deferred.create());
        const result = await this.#fn();
        if (result) {
            deferred.resolve(result);
            return;
        }
        const poll = async () => {
            if (deferred.finished()) {
                return;
            }
            const result = await this.#fn();
            if (!result) {
                window.requestAnimationFrame(poll);
                return;
            }
            deferred.resolve(result);
            await this.stop();
        };
        window.requestAnimationFrame(poll);
    }
    async stop() {
        assert(this.#deferred, 'Polling never started.');
        if (!this.#deferred.finished()) {
            this.#deferred.reject(new Error('Polling stopped'));
        }
    }
    result() {
        assert(this.#deferred, 'Polling never started.');
        return this.#deferred.valueOrThrow();
    }
}
/**
 * @internal
 */
export class IntervalPoller {
    #fn;
    #ms;
    #interval;
    #deferred;
    constructor(fn, ms) {
        this.#fn = fn;
        this.#ms = ms;
    }
    async start() {
        const deferred = (this.#deferred = Deferred.create());
        const result = await this.#fn();
        if (result) {
            deferred.resolve(result);
            return;
        }
        this.#interval = setInterval(async () => {
            const result = await this.#fn();
            if (!result) {
                return;
            }
            deferred.resolve(result);
            await this.stop();
        }, this.#ms);
    }
    async stop() {
        assert(this.#deferred, 'Polling never started.');
        if (!this.#deferred.finished()) {
            this.#deferred.reject(new Error('Polling stopped'));
        }
        if (this.#interval) {
            clearInterval(this.#interval);
            this.#interval = undefined;
        }
    }
    result() {
        assert(this.#deferred, 'Polling never started.');
        return this.#deferred.valueOrThrow();
    }
}
//# map=Poller.js.map