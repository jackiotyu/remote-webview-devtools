// Copyright 2022 The Chromium Authors. All rights reserved.
// Use of this source code is governed by a BSD-style license that can be
// found in the LICENSE file.
import * as i18n from '../../../core/i18n/i18n.js';
import * as ComponentHelpers from '../../../ui/components/helpers/helpers.js';
import * as Coordinator from '../../../ui/components/render_coordinator/render_coordinator.js';
import * as ReportView from '../../../ui/components/report_view/report_view.js';
import * as UI from '../../../ui/legacy/legacy.js';
import * as LitHtml from '../../../ui/lit-html/lit-html.js';
import * as IconButton from '../../../ui/components/icon_button/icon_button.js';
import sharedStorageMetadataViewStyles from './sharedStorageMetadataView.css.js';
import sharedStorageMetadataViewResetBudgetButtonStyles from './sharedStorageMetadataViewResetBudgetButton.css.js';
const UIStrings = {
    /**
     *@description Text in SharedStorage Metadata View of the Application panel
     */
    sharedStorage: 'Shared Storage',
    /**
     *@description Section header for Metadata
     */
    metadata: 'Metadata',
    /**
     *@description The origin of a URL (https://web.dev/same-site-same-origin/#origin)
     *(for a lot of languages this does not need to be translated, please translate only where necessary)
     */
    origin: 'Origin',
    /**
     *@description The time when the origin most recently created its shared storage database
     */
    creation: 'Creation Time',
    /**
     *@description The placeholder text if there is no creation time because the origin is not yet using shared storage.
     */
    notYetCreated: 'Not yet created',
    /**
     *@description The number of entries currently in the origin's database
     */
    numEntries: 'Number of Entries',
    /**
     *@description The number of bits remaining in the origin's shared storage privacy budget
     */
    entropyBudget: 'Entropy Budget for Fenced Frames',
    /**
     *@description Hover text for `entropyBudget` giving a more detailed explanation
     */
    budgetExplanation: 'Remaining data leakage allowed within a 24-hour period for this origin in bits of entropy',
    /**
     *@description Label for a button which when clicked causes the budget to be reset to the max.
     */
    resetBudget: 'Reset Budget',
    /**
     *@description Section header above Entries
     */
    entries: 'Entries',
};
const str_ = i18n.i18n.registerUIStrings('panels/application/components/SharedStorageMetadataView.ts', UIStrings);
const i18nString = i18n.i18n.getLocalizedString.bind(undefined, str_);
export class SharedStorageMetadataView extends UI.Widget.VBox {
    #reportView = new SharedStorageMetadataReportView();
    #sharedStorageMetadataGetter;
    constructor(sharedStorageMetadataGetter, owner) {
        super();
        this.#sharedStorageMetadataGetter = sharedStorageMetadataGetter;
        this.contentElement.classList.add('overflow-auto');
        this.contentElement.appendChild(this.#reportView);
        this.#reportView.origin = owner;
        this.#reportView.resetBudgetHandler = () => {
            void this.#resetBudget();
        };
        void this.doUpdate();
    }
    async doUpdate() {
        const metadata = await this.#sharedStorageMetadataGetter.getMetadata();
        const creationTime = metadata?.creationTime ?? null;
        const length = metadata?.length ?? 0;
        const remainingBudget = metadata?.remainingBudget ?? 0;
        this.#reportView.data = { creationTime, length, remainingBudget };
    }
    async #resetBudget() {
        await this.#sharedStorageMetadataGetter.resetBudget();
        await this.doUpdate();
    }
}
const coordinator = Coordinator.RenderCoordinator.RenderCoordinator.instance();
class SharedStorageResetBudgetButton extends HTMLElement {
    static litTagName = LitHtml.literal `devtools-shared-storage-reset-budget-button`;
    #shadow = this.attachShadow({ mode: 'open' });
    #resetBudgetHandler = () => { };
    connectedCallback() {
        this.#shadow.adoptedStyleSheets = [sharedStorageMetadataViewResetBudgetButtonStyles];
    }
    set data(data) {
        this.#resetBudgetHandler = data.resetBudgetHandler;
        this.#render();
    }
    #render() {
        // clang-format off
        LitHtml.render(LitHtml.html `
      <button class="reset-budget-button"
        title=${i18nString(UIStrings.resetBudget)}
        @click=${() => this.#resetBudgetHandler()}>
      <${IconButton.Icon.Icon.litTagName} .data=${{ iconName: 'undo', color: 'var(--icon-default)', width: '16px', height: '16px' }}>
        </${IconButton.Icon.Icon.litTagName}>
      </button>`, this.#shadow, { host: this });
        // clang-format on
    }
}
class SharedStorageMetadataReportView extends HTMLElement {
    static litTagName = LitHtml.literal `devtools-shared-storage-metadata-view`;
    #shadow = this.attachShadow({ mode: 'open' });
    #origin = '';
    #creationTime = null;
    #length = 0;
    #remainingBudget = 0;
    resetBudgetHandler = () => { };
    connectedCallback() {
        this.#shadow.adoptedStyleSheets = [sharedStorageMetadataViewStyles];
    }
    set data(data) {
        if (data.creationTime) {
            this.#creationTime = data.creationTime;
            this.#length = data.length;
            this.#remainingBudget = data.remainingBudget;
        }
        void this.#render();
    }
    set origin(origin) {
        this.#origin = origin;
    }
    async #render() {
        await coordinator.write('SharedStorageMetadataView render', () => {
            const titleForReport = { reportTitle: i18nString(UIStrings.sharedStorage) };
            // Disabled until https://crbug.com/1079231 is fixed.
            // clang-format off
            LitHtml.render(LitHtml.html `
        <${ReportView.ReportView.Report.litTagName} .data=${titleForReport}>
          ${this.#renderMetadataSection()}
          ${this.#renderEntriesSection()}
        </${ReportView.ReportView.Report.litTagName}>
      `, this.#shadow, { host: this });
            // clang-format on
        });
    }
    #renderMetadataSection() {
        return LitHtml.html `
      <${ReportView.ReportView.ReportSectionHeader.litTagName}>${i18nString(UIStrings.metadata)}</${ReportView.ReportView.ReportSectionHeader.litTagName}>
      <${ReportView.ReportView.ReportKey.litTagName}>${i18nString(UIStrings.origin)}</${ReportView.ReportView.ReportKey.litTagName}>
      <${ReportView.ReportView.ReportValue.litTagName}>
          <div class="text-ellipsis" title=${this.#origin}>${this.#origin}</div>
      </${ReportView.ReportView.ReportValue.litTagName}>
     <${ReportView.ReportView.ReportKey.litTagName}>${i18nString(UIStrings.creation)}</${ReportView.ReportView.ReportKey.litTagName}>
     <${ReportView.ReportView.ReportValue.litTagName}>
     ${this.#renderDateForCreationTime()}</${ReportView.ReportView.ReportValue.litTagName}>
     <${ReportView.ReportView.ReportKey.litTagName}>${i18nString(UIStrings.numEntries)}
     </${ReportView.ReportView.ReportKey.litTagName}>
     <${ReportView.ReportView.ReportValue.litTagName}>${this.#length}</${ReportView.ReportView.ReportValue.litTagName}>
     <${ReportView.ReportView.ReportKey.litTagName}>${i18nString(UIStrings.entropyBudget)}<${IconButton.Icon.Icon.litTagName} class="info-icon" title=${i18nString(UIStrings.budgetExplanation)}
          .data=${{ iconName: 'info', color: 'var(--icon-default)', width: '16px' }}>
        </${IconButton.Icon.Icon.litTagName}></${ReportView.ReportView.ReportKey.litTagName}><${ReportView.ReportView.ReportValue.litTagName}>${this.#remainingBudget}${this.#renderResetBudgetButton()}
        </${ReportView.ReportView.ReportValue.litTagName}>
      <${ReportView.ReportView.ReportSectionDivider.litTagName}></${ReportView.ReportView.ReportSectionDivider.litTagName}>
    `;
    }
    #renderDateForCreationTime() {
        if (!this.#creationTime) {
            return LitHtml.html `${i18nString(UIStrings.notYetCreated)}`;
        }
        const date = new Date(1e3 * this.#creationTime);
        return LitHtml.html `${date.toLocaleString()}`;
    }
    #renderResetBudgetButton() {
        // clang-format off
        return LitHtml.html `<${SharedStorageResetBudgetButton.litTagName}
     .data=${{ resetBudgetHandler: this.resetBudgetHandler }}
    ></${SharedStorageResetBudgetButton.litTagName}>`;
        // clang-format on
    }
    #renderEntriesSection() {
        return LitHtml.html `
      <${ReportView.ReportView.ReportSectionHeader.litTagName} title=${i18nString(UIStrings.entries)}>
        ${i18nString(UIStrings.entries)}</${ReportView.ReportView.ReportSectionHeader.litTagName}>
    `;
    }
}
export { SharedStorageMetadataReportView };
ComponentHelpers.CustomElements.defineComponent('devtools-shared-storage-reset-budget-button', SharedStorageResetBudgetButton);
ComponentHelpers.CustomElements.defineComponent('devtools-shared-storage-metadata-view', SharedStorageMetadataReportView);
//# sourceMappingURL=SharedStorageMetadataView.js.map