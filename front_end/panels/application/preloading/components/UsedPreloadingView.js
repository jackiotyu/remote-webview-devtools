// Copyright 2023 The Chromium Authors. All rights reserved.
// Use of this source code is governed by a BSD-style license that can be
// found in the LICENSE file.
import * as i18n from '../../../../core/i18n/i18n.js';
import * as SDK from '../../../../core/sdk/sdk.js';
import * as ComponentHelpers from '../../../../ui/components/helpers/helpers.js';
import * as Coordinator from '../../../../ui/components/render_coordinator/render_coordinator.js';
import * as LitHtml from '../../../../ui/lit-html/lit-html.js';
const UIStrings = {
    /**
     *@description Message that reports counts of prefetch that used for this page.
     *@example {1} PH1
     */
    prefetchUsed: '{PH1} prefetched resources are used for this page',
    /**
     *@description Message that reports this page was prerendered.
     */
    prerenderUsed: 'This page was prerendered',
};
const str_ = i18n.i18n.registerUIStrings('panels/application/preloading/components/UsedPreloadingView.ts', UIStrings);
const i18nString = i18n.i18n.getLocalizedString.bind(undefined, str_);
const coordinator = Coordinator.RenderCoordinator.RenderCoordinator.instance();
class UsedPreloadingView extends HTMLElement {
    static litTagName = LitHtml.literal `devtools-resources-used-preloading-view`;
    #shadow = this.attachShadow({ mode: 'open' });
    #data = [];
    connectedCallback() {
        this.#shadow.adoptedStyleSheets = [];
    }
    set data(data) {
        this.#data = data;
        void this.#render();
    }
    async #render() {
        await coordinator.write('UsedPreloadingView render', () => {
            const used = this.#data.filter(attempt => attempt.status === "Success" /* SDK.PreloadingModel.PreloadingStatus.Success */);
            const prefetchCount = used.filter(attempt => attempt.key.action === "Prefetch" /* Protocol.Preload.SpeculationAction.Prefetch */).length;
            const prerenderCount = used.length - prefetchCount;
            if (used.length === 0) {
                LitHtml.render(LitHtml.nothing, this.#shadow, { host: this });
                return;
            }
            let message = '';
            if (prerenderCount > 0) {
                message = i18nString(UIStrings.prerenderUsed);
            }
            else if (prefetchCount > 0) {
                message = i18nString(UIStrings.prefetchUsed, { PH1: prefetchCount });
            }
            // Disabled until https://crbug.com/1079231 is fixed.
            // clang-format off
            LitHtml.render(LitHtml.html `
          <div>
            <p>${message}</p>
          </div>
      `, this.#shadow, { host: this });
            // clang-format on
        });
    }
}
export { UsedPreloadingView };
ComponentHelpers.CustomElements.defineComponent('devtools-resources-used-preloading-view', UsedPreloadingView);
//# sourceMappingURL=UsedPreloadingView.js.map