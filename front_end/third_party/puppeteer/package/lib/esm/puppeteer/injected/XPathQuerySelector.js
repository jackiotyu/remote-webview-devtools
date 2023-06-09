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
/**
 * @internal
 */
export const xpathQuerySelector = (root, selector) => {
    const doc = root.ownerDocument || document;
    const result = doc.evaluate(selector, root, null, XPathResult.FIRST_ORDERED_NODE_TYPE);
    return result.singleNodeValue;
};
/**
 * @internal
 */
export const xpathQuerySelectorAll = (root, selector) => {
    const doc = root.ownerDocument || document;
    const iterator = doc.evaluate(selector, root, null, XPathResult.ORDERED_NODE_ITERATOR_TYPE);
    const array = [];
    let item;
    while ((item = iterator.iterateNext())) {
        array.push(item);
    }
    return array;
};
//# map=XPathQuerySelector.js.map