import { source as injectedSource } from '../generated/injected.js';
class ScriptInjector {
    #updated = false;
    #amendments = new Set();
    // Appends a statement of the form `(PuppeteerUtil) => {...}`.
    append(statement) {
        this.#update(() => {
            this.#amendments.add(statement);
        });
    }
    pop(statement) {
        this.#update(() => {
            this.#amendments.delete(statement);
        });
    }
    inject(inject, force = false) {
        if (this.#updated || force) {
            inject(this.#get());
        }
        this.#updated = false;
    }
    #update(callback) {
        callback();
        this.#updated = true;
    }
    #get() {
        return `(() => {
      const module = {};
      ${injectedSource}
      ${[...this.#amendments]
            .map(statement => {
            return `(${statement})(module.exports.default);`;
        })
            .join('')}
      return module.exports.default;
    })()`;
    }
}
/**
 * @internal
 */
export const scriptInjector = new ScriptInjector();
//# map=ScriptInjector.js.map