// Copyright (c) 2022 The Chromium Authors. All rights reserved.
// Use of this source code is governed by a BSD-style license that can be
// found in the LICENSE file.
import * as i18n from '../../../core/i18n/i18n.js';
import * as LitHtml from '../../lit-html/lit-html.js';
import * as ComponentHelpers from '../helpers/helpers.js';
import * as IconButton from '../icon_button/icon_button.js';
import linearMemoryHighlightChipListStyles from './linearMemoryHighlightChipList.css.js';
const UIStrings = {
    /**
     *@description Tooltip text that appears when hovering over an inspected variable's button in the Linear Memory Highlight Chip List.
    Clicking the button changes the displayed slice of computer memory in the Linear Memory Inspector to contain the inspected variable's bytes.
     */
    jumpToAddress: 'Jump to this memory',
    /**
     *@description Tooltip text that appears when hovering over an inspected variable's delete button in the Linear Memory Highlight Chip List.
     Clicking the delete button stops highlighting the variable's memory in the Linear Memory Inspector.
     'Memory' is a slice of bytes in the computer memory.
     */
    deleteHighlight: 'Stop highlighting this memory',
};
const str_ = i18n.i18n.registerUIStrings('ui/components/linear_memory_inspector/LinearMemoryHighlightChipList.ts', UIStrings);
const i18nString = i18n.i18n.getLocalizedString.bind(undefined, str_);
const { render, html } = LitHtml;
export class DeleteMemoryHighlightEvent extends Event {
    static eventName = 'deletememoryhighlight';
    data;
    constructor(highlightInfo) {
        super(DeleteMemoryHighlightEvent.eventName, { bubbles: true, composed: true });
        this.data = highlightInfo;
    }
}
export class JumpToHighlightedMemoryEvent extends Event {
    static eventName = 'jumptohighlightedmemory';
    data;
    constructor(address) {
        super(JumpToHighlightedMemoryEvent.eventName);
        this.data = address;
    }
}
export class LinearMemoryHighlightChipList extends HTMLElement {
    static litTagName = LitHtml.literal `devtools-linear-memory-highlight-chip-list`;
    #shadow = this.attachShadow({ mode: 'open' });
    #highlightedAreas = [];
    #focusedMemoryHighlight;
    connectedCallback() {
        this.#shadow.adoptedStyleSheets = [linearMemoryHighlightChipListStyles];
    }
    set data(data) {
        this.#highlightedAreas = data.highlightInfos;
        this.#focusedMemoryHighlight = data.focusedMemoryHighlight;
        this.#render();
    }
    #render() {
        // Disabled until https://crbug.com/1079231 is fixed.
        // clang-format off
        const chips = [];
        for (const highlightInfo of this.#highlightedAreas) {
            chips.push(this.#createChip(highlightInfo));
        }
        const result = html `
            <div class="highlight-chip-list">
              ${chips}
            </div>
        `;
        render(result, this.#shadow, { host: this });
        // clang-format on
    }
    #createChip(highlightInfo) {
        const expressionName = highlightInfo.name || '<anonymous>';
        const expressionType = highlightInfo.type;
        const isFocused = highlightInfo === this.#focusedMemoryHighlight;
        const classMap = {
            focused: isFocused,
            'highlight-chip': true,
        };
        // Disabled until https://crbug.com/1079231 is fixed.
        // clang-format off
        return html `
      <div class=${LitHtml.Directives.classMap(classMap)}>
        <button class="jump-to-highlight-button" title=${i18nString(UIStrings.jumpToAddress)}
            @click=${() => this.#onJumpToHighlightClick(highlightInfo.startAddress)}>
          <span class="source-code">
            <span class="value">${expressionName}</span><span class="separator">: </span><span>${expressionType}</span>
          </span>
        </button>
        <div class="delete-highlight-container">
          <button class="delete-highlight-button" title=${i18nString(UIStrings.deleteHighlight)} @click=${() => this.#onDeleteHighlightClick(highlightInfo)}>
            <${IconButton.Icon.Icon.litTagName} .data=${{
            iconName: 'cross',
            color: 'var(--icon-default-hover)',
            width: '16px',
        }}>
            </${IconButton.Icon.Icon.litTagName}>
          </button>
        </div>
      </div>
    `;
        // clang-format off
    }
    #onJumpToHighlightClick(startAddress) {
        this.dispatchEvent(new JumpToHighlightedMemoryEvent(startAddress));
    }
    #onDeleteHighlightClick(highlight) {
        this.dispatchEvent(new DeleteMemoryHighlightEvent(highlight));
    }
}
ComponentHelpers.CustomElements.defineComponent('devtools-linear-memory-highlight-chip-list', LinearMemoryHighlightChipList);
//# map=LinearMemoryHighlightChipList.js.map