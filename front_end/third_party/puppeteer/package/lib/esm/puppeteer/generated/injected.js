/**
 * CommonJS JavaScript code that provides the puppeteer utilities. See the
 * [README](https://github.com/puppeteer/puppeteer/blob/main/src/injected/README.md)
 * for injection for more information.
 *
 * @internal
 */
export const source = "\"use strict\";\nvar __defProp = Object.defineProperty;\nvar __getOwnPropDesc = Object.getOwnPropertyDescriptor;\nvar __getOwnPropNames = Object.getOwnPropertyNames;\nvar __hasOwnProp = Object.prototype.hasOwnProperty;\nvar __export = (target, all) => {\n  for (var name in all)\n    __defProp(target, name, { get: all[name], enumerable: true });\n};\nvar __copyProps = (to, from, except, desc) => {\n  if (from && typeof from === \"object\" || typeof from === \"function\") {\n    for (let key of __getOwnPropNames(from))\n      if (!__hasOwnProp.call(to, key) && key !== except)\n        __defProp(to, key, { get: () => from[key], enumerable: !(desc = __getOwnPropDesc(from, key)) || desc.enumerable });\n  }\n  return to;\n};\nvar __toCommonJS = (mod) => __copyProps(__defProp({}, \"__esModule\", { value: true }), mod);\n\n// src/injected/injected.ts\nvar injected_exports = {};\n__export(injected_exports, {\n  default: () => injected_default\n});\nmodule.exports = __toCommonJS(injected_exports);\n\n// src/common/Errors.ts\nvar CustomError = class extends Error {\n  constructor(message) {\n    super(message);\n    this.name = this.constructor.name;\n    Error.captureStackTrace(this, this.constructor);\n  }\n};\nvar TimeoutError = class extends CustomError {\n};\nvar ProtocolError = class extends CustomError {\n  #code;\n  #originalMessage = \"\";\n  set code(code) {\n    this.#code = code;\n  }\n  get code() {\n    return this.#code;\n  }\n  set originalMessage(originalMessage) {\n    this.#originalMessage = originalMessage;\n  }\n  get originalMessage() {\n    return this.#originalMessage;\n  }\n};\nvar errors = Object.freeze({\n  TimeoutError,\n  ProtocolError\n});\n\n// src/util/DeferredPromise.ts\nfunction createDeferredPromise(opts) {\n  let isResolved = false;\n  let isRejected = false;\n  let resolver;\n  let rejector;\n  const taskPromise = new Promise((resolve, reject) => {\n    resolver = resolve;\n    rejector = reject;\n  });\n  const timeoutId = opts && opts.timeout > 0 ? setTimeout(() => {\n    isRejected = true;\n    rejector(new TimeoutError(opts.message));\n  }, opts.timeout) : void 0;\n  return Object.assign(taskPromise, {\n    resolved: () => {\n      return isResolved;\n    },\n    finished: () => {\n      return isResolved || isRejected;\n    },\n    resolve: (value) => {\n      if (timeoutId) {\n        clearTimeout(timeoutId);\n      }\n      isResolved = true;\n      resolver(value);\n    },\n    reject: (err) => {\n      clearTimeout(timeoutId);\n      isRejected = true;\n      rejector(err);\n    }\n  });\n}\n\n// src/util/assert.ts\nvar assert = (value, message) => {\n  if (!value) {\n    throw new Error(message);\n  }\n};\n\n// src/injected/Poller.ts\nvar MutationPoller = class {\n  #fn;\n  #root;\n  #observer;\n  #promise;\n  constructor(fn, root) {\n    this.#fn = fn;\n    this.#root = root;\n  }\n  async start() {\n    const promise = this.#promise = createDeferredPromise();\n    const result = await this.#fn();\n    if (result) {\n      promise.resolve(result);\n      return;\n    }\n    this.#observer = new MutationObserver(async () => {\n      const result2 = await this.#fn();\n      if (!result2) {\n        return;\n      }\n      promise.resolve(result2);\n      await this.stop();\n    });\n    this.#observer.observe(this.#root, {\n      childList: true,\n      subtree: true,\n      attributes: true\n    });\n  }\n  async stop() {\n    assert(this.#promise, \"Polling never started.\");\n    if (!this.#promise.finished()) {\n      this.#promise.reject(new Error(\"Polling stopped\"));\n    }\n    if (this.#observer) {\n      this.#observer.disconnect();\n      this.#observer = void 0;\n    }\n  }\n  result() {\n    assert(this.#promise, \"Polling never started.\");\n    return this.#promise;\n  }\n};\nvar RAFPoller = class {\n  #fn;\n  #promise;\n  constructor(fn) {\n    this.#fn = fn;\n  }\n  async start() {\n    const promise = this.#promise = createDeferredPromise();\n    const result = await this.#fn();\n    if (result) {\n      promise.resolve(result);\n      return;\n    }\n    const poll = async () => {\n      if (promise.finished()) {\n        return;\n      }\n      const result2 = await this.#fn();\n      if (!result2) {\n        window.requestAnimationFrame(poll);\n        return;\n      }\n      promise.resolve(result2);\n      await this.stop();\n    };\n    window.requestAnimationFrame(poll);\n  }\n  async stop() {\n    assert(this.#promise, \"Polling never started.\");\n    if (!this.#promise.finished()) {\n      this.#promise.reject(new Error(\"Polling stopped\"));\n    }\n  }\n  result() {\n    assert(this.#promise, \"Polling never started.\");\n    return this.#promise;\n  }\n};\nvar IntervalPoller = class {\n  #fn;\n  #ms;\n  #interval;\n  #promise;\n  constructor(fn, ms) {\n    this.#fn = fn;\n    this.#ms = ms;\n  }\n  async start() {\n    const promise = this.#promise = createDeferredPromise();\n    const result = await this.#fn();\n    if (result) {\n      promise.resolve(result);\n      return;\n    }\n    this.#interval = setInterval(async () => {\n      const result2 = await this.#fn();\n      if (!result2) {\n        return;\n      }\n      promise.resolve(result2);\n      await this.stop();\n    }, this.#ms);\n  }\n  async stop() {\n    assert(this.#promise, \"Polling never started.\");\n    if (!this.#promise.finished()) {\n      this.#promise.reject(new Error(\"Polling stopped\"));\n    }\n    if (this.#interval) {\n      clearInterval(this.#interval);\n      this.#interval = void 0;\n    }\n  }\n  result() {\n    assert(this.#promise, \"Polling never started.\");\n    return this.#promise;\n  }\n};\n\n// src/injected/TextContent.ts\nvar TRIVIAL_VALUE_INPUT_TYPES = /* @__PURE__ */ new Set([\"checkbox\", \"image\", \"radio\"]);\nvar isNonTrivialValueNode = (node) => {\n  if (node instanceof HTMLSelectElement) {\n    return true;\n  }\n  if (node instanceof HTMLTextAreaElement) {\n    return true;\n  }\n  if (node instanceof HTMLInputElement && !TRIVIAL_VALUE_INPUT_TYPES.has(node.type)) {\n    return true;\n  }\n  return false;\n};\nvar UNSUITABLE_NODE_NAMES = /* @__PURE__ */ new Set([\"SCRIPT\", \"STYLE\"]);\nvar isSuitableNodeForTextMatching = (node) => {\n  return !UNSUITABLE_NODE_NAMES.has(node.nodeName) && !document.head?.contains(node);\n};\nvar textContentCache = /* @__PURE__ */ new WeakMap();\nvar eraseFromCache = (node) => {\n  while (node) {\n    textContentCache.delete(node);\n    if (node instanceof ShadowRoot) {\n      node = node.host;\n    } else {\n      node = node.parentNode;\n    }\n  }\n};\nvar observedNodes = /* @__PURE__ */ new WeakSet();\nvar textChangeObserver = new MutationObserver((mutations) => {\n  for (const mutation of mutations) {\n    eraseFromCache(mutation.target);\n  }\n});\nvar createTextContent = (root) => {\n  let value = textContentCache.get(root);\n  if (value) {\n    return value;\n  }\n  value = { full: \"\", immediate: [] };\n  if (!isSuitableNodeForTextMatching(root)) {\n    return value;\n  }\n  let currentImmediate = \"\";\n  if (isNonTrivialValueNode(root)) {\n    value.full = root.value;\n    value.immediate.push(root.value);\n    root.addEventListener(\n      \"input\",\n      (event) => {\n        eraseFromCache(event.target);\n      },\n      { once: true, capture: true }\n    );\n  } else {\n    for (let child = root.firstChild; child; child = child.nextSibling) {\n      if (child.nodeType === Node.TEXT_NODE) {\n        value.full += child.nodeValue ?? \"\";\n        currentImmediate += child.nodeValue ?? \"\";\n        continue;\n      }\n      if (currentImmediate) {\n        value.immediate.push(currentImmediate);\n      }\n      currentImmediate = \"\";\n      if (child.nodeType === Node.ELEMENT_NODE) {\n        value.full += createTextContent(child).full;\n      }\n    }\n    if (currentImmediate) {\n      value.immediate.push(currentImmediate);\n    }\n    if (root instanceof Element && root.shadowRoot) {\n      value.full += createTextContent(root.shadowRoot).full;\n    }\n    if (!observedNodes.has(root)) {\n      textChangeObserver.observe(root, {\n        childList: true,\n        characterData: true\n      });\n      observedNodes.add(root);\n    }\n  }\n  textContentCache.set(root, value);\n  return value;\n};\n\n// src/injected/TextQuerySelector.ts\nvar TextQuerySelector_exports = {};\n__export(TextQuerySelector_exports, {\n  textQuerySelector: () => textQuerySelector,\n  textQuerySelectorAll: () => textQuerySelectorAll\n});\nvar textQuerySelector = (root, selector) => {\n  for (const node of root.childNodes) {\n    if (node instanceof Element && isSuitableNodeForTextMatching(node)) {\n      let matchedNode;\n      if (node.shadowRoot) {\n        matchedNode = textQuerySelector(node.shadowRoot, selector);\n      } else {\n        matchedNode = textQuerySelector(node, selector);\n      }\n      if (matchedNode) {\n        return matchedNode;\n      }\n    }\n  }\n  if (root instanceof Element) {\n    const textContent = createTextContent(root);\n    if (textContent.full.includes(selector)) {\n      return root;\n    }\n  }\n  return null;\n};\nvar textQuerySelectorAll = (root, selector) => {\n  let results = [];\n  for (const node of root.childNodes) {\n    if (node instanceof Element) {\n      let matchedNodes;\n      if (node.shadowRoot) {\n        matchedNodes = textQuerySelectorAll(node.shadowRoot, selector);\n      } else {\n        matchedNodes = textQuerySelectorAll(node, selector);\n      }\n      results = results.concat(matchedNodes);\n    }\n  }\n  if (results.length > 0) {\n    return results;\n  }\n  if (root instanceof Element) {\n    const textContent = createTextContent(root);\n    if (textContent.full.includes(selector)) {\n      return [root];\n    }\n  }\n  return [];\n};\n\n// src/injected/XPathQuerySelector.ts\nvar XPathQuerySelector_exports = {};\n__export(XPathQuerySelector_exports, {\n  xpathQuerySelector: () => xpathQuerySelector,\n  xpathQuerySelectorAll: () => xpathQuerySelectorAll\n});\nvar xpathQuerySelector = (root, selector) => {\n  const doc = root.ownerDocument || document;\n  const result = doc.evaluate(\n    selector,\n    root,\n    null,\n    XPathResult.FIRST_ORDERED_NODE_TYPE\n  );\n  return result.singleNodeValue;\n};\nvar xpathQuerySelectorAll = (root, selector) => {\n  const doc = root.ownerDocument || document;\n  const iterator = doc.evaluate(\n    selector,\n    root,\n    null,\n    XPathResult.ORDERED_NODE_ITERATOR_TYPE\n  );\n  const array = [];\n  let item;\n  while (item = iterator.iterateNext()) {\n    array.push(item);\n  }\n  return array;\n};\n\n// src/injected/PierceQuerySelector.ts\nvar PierceQuerySelector_exports = {};\n__export(PierceQuerySelector_exports, {\n  pierceQuerySelector: () => pierceQuerySelector,\n  pierceQuerySelectorAll: () => pierceQuerySelectorAll\n});\nvar pierceQuerySelector = (root, selector) => {\n  let found = null;\n  const search = (root2) => {\n    const iter = document.createTreeWalker(root2, NodeFilter.SHOW_ELEMENT);\n    do {\n      const currentNode = iter.currentNode;\n      if (currentNode.shadowRoot) {\n        search(currentNode.shadowRoot);\n      }\n      if (currentNode instanceof ShadowRoot) {\n        continue;\n      }\n      if (currentNode !== root2 && !found && currentNode.matches(selector)) {\n        found = currentNode;\n      }\n    } while (!found && iter.nextNode());\n  };\n  if (root instanceof Document) {\n    root = root.documentElement;\n  }\n  search(root);\n  return found;\n};\nvar pierceQuerySelectorAll = (element, selector) => {\n  const result = [];\n  const collect = (root) => {\n    const iter = document.createTreeWalker(root, NodeFilter.SHOW_ELEMENT);\n    do {\n      const currentNode = iter.currentNode;\n      if (currentNode.shadowRoot) {\n        collect(currentNode.shadowRoot);\n      }\n      if (currentNode instanceof ShadowRoot) {\n        continue;\n      }\n      if (currentNode !== root && currentNode.matches(selector)) {\n        result.push(currentNode);\n      }\n    } while (iter.nextNode());\n  };\n  if (element instanceof Document) {\n    element = element.documentElement;\n  }\n  collect(element);\n  return result;\n};\n\n// src/injected/util.ts\nvar util_exports = {};\n__export(util_exports, {\n  checkVisibility: () => checkVisibility,\n  createFunction: () => createFunction\n});\nvar createdFunctions = /* @__PURE__ */ new Map();\nvar createFunction = (functionValue) => {\n  let fn = createdFunctions.get(functionValue);\n  if (fn) {\n    return fn;\n  }\n  fn = new Function(`return ${functionValue}`)();\n  createdFunctions.set(functionValue, fn);\n  return fn;\n};\nvar HIDDEN_VISIBILITY_VALUES = [\"hidden\", \"collapse\"];\nvar checkVisibility = (node, visible) => {\n  if (!node) {\n    return visible === false;\n  }\n  if (visible === void 0) {\n    return node;\n  }\n  const element = node.nodeType === Node.TEXT_NODE ? node.parentElement : node;\n  const style = window.getComputedStyle(element);\n  const isVisible = style && !HIDDEN_VISIBILITY_VALUES.includes(style.visibility) && isBoundingBoxVisible(element);\n  return visible === isVisible ? node : false;\n};\nfunction isBoundingBoxVisible(element) {\n  const rect = element.getBoundingClientRect();\n  return rect.width > 0 && rect.height > 0 && rect.right > 0 && rect.bottom > 0;\n}\n\n// src/injected/injected.ts\nvar PuppeteerUtil = Object.freeze({\n  ...util_exports,\n  ...TextQuerySelector_exports,\n  ...XPathQuerySelector_exports,\n  ...PierceQuerySelector_exports,\n  createDeferredPromise,\n  createTextContent,\n  IntervalPoller,\n  isSuitableNodeForTextMatching,\n  MutationPoller,\n  RAFPoller\n});\nvar injected_default = PuppeteerUtil;\n";
//# map=injected.js.map