/**
 * Copyright 2023 Google Inc. All rights reserved.
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
/**
 * This class mimics the injected {@link CustomQuerySelectorRegistry}.
 */
class CustomQuerySelectorRegistry {
    #selectors = new Map();
    register(name, handler) {
        if (!handler.queryOne && handler.queryAll) {
            const querySelectorAll = handler.queryAll;
            handler.queryOne = (node, selector) => {
                for (const result of querySelectorAll(node, selector)) {
                    return result;
                }
                return null;
            };
        }
        else if (handler.queryOne && !handler.queryAll) {
            const querySelector = handler.queryOne;
            handler.queryAll = (node, selector) => {
                const result = querySelector(node, selector);
                return result ? [result] : [];
            };
        }
        else if (!handler.queryOne || !handler.queryAll) {
            throw new Error('At least one query method must be defined.');
        }
        this.#selectors.set(name, {
            querySelector: handler.queryOne,
            querySelectorAll: handler.queryAll,
        });
    }
    unregister(name) {
        this.#selectors.delete(name);
    }
    get(name) {
        return this.#selectors.get(name);
    }
    clear() {
        this.#selectors.clear();
    }
}
export const customQuerySelectors = new CustomQuerySelectorRegistry();
//# map=CustomQuerySelector.js.map