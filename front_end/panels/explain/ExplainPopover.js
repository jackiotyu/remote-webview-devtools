// Copyright 2023 The Chromium Authors. All rights reserved.
// Use of this source code is governed by a BSD-style license that can be
// found in the LICENSE file.
import * as Host from '../../core/host/host.js';
import * as Marked from '../../third_party/marked/marked.js';
import * as Buttons from '../../ui/components/buttons/buttons.js';
import * as MarkdownView from '../../ui/components/markdown_view/markdown_view.js';
import * as UI from '../../ui/legacy/legacy.js';
const surveyLink = 'https://docs.google.com/forms/d/e/1FAIpQLSfKm4UX5PvTkM-N6aZ2UcaNyRhoP075Hr-lOmRaJv_4zN4kkQ/viewform';
export class ExplainPopover {
    #source;
    #contentElement = document.createElement('div');
    #markdownElement;
    #answer = '';
    #prompt = '';
    #detectOutsideInteraction = (event) => {
        const el = event?.composedPath()[0];
        if (!el.isDescendant(this.#contentElement) && this.#contentElement !== el) {
            this.hide();
        }
    };
    #popover = UI.PopoverHelper.PopoverHelper.createPopover();
    constructor(source) {
        this.#source = source;
        this.#contentElement.style.padding = '16px';
        this.#contentElement.style.maxWidth = '500px';
        this.#contentElement.innerHTML = `
      <div class="markdown">
      </div>
      <div class="rating">
        <span>Rate this response:</span>
      </div>
    `;
        this.#popover.contentElement.classList.toggle('has-padding', false);
        this.#popover.contentElement.appendChild(this.#contentElement);
        this.#markdownElement = this.#contentElement.querySelector('.markdown');
        const ratingContainer = this.#contentElement.querySelector('.rating');
        ratingContainer.style.display = 'none';
        ratingContainer.style.flexDirection = 'row';
        ratingContainer.style.alignItems = 'center';
        const plusButton = new Buttons.Button.Button();
        plusButton.data = {
            variant: "toolbar" /* Buttons.Button.Variant.TOOLBAR */,
            size: "TINY" /* Buttons.Button.Size.TINY */,
            iconName: 'thumb-up',
        };
        plusButton.classList.add('plus');
        plusButton.style.marginLeft = '1em';
        plusButton.style.width = '20px';
        plusButton.style.height = '20px';
        const minusButton = new Buttons.Button.Button();
        minusButton.data = {
            variant: "toolbar" /* Buttons.Button.Variant.TOOLBAR */,
            size: "TINY" /* Buttons.Button.Size.TINY */,
            iconName: 'thumb-down',
        };
        minusButton.classList.add('minus');
        minusButton.style.width = '20px';
        minusButton.style.height = '20px';
        ratingContainer.append(plusButton);
        ratingContainer.append(minusButton);
        this.#contentElement.addEventListener('click', event => {
            const isPlus = event.target.matches('.plus');
            const isMinus = event.target.matches('.minus');
            if (isMinus || isPlus) {
                const rating = isMinus ? 'Bad' : 'Good';
                Host.InspectorFrontendHost.InspectorFrontendHostInstance.openInNewTab(`${surveyLink}?usp=pp_url&entry.1692896504=${encodeURIComponent(rating)}&entry.1188367343=${encodeURIComponent(this.#prompt)}&entry.405375461=${encodeURIComponent(this.#answer)}`);
            }
        });
    }
    #renderMarkdown(content) {
        const markdown = new MarkdownView.MarkdownView.MarkdownView();
        markdown.data = { tokens: Marked.Marked.lexer(content) };
        this.#markdownElement.removeChildren();
        this.#markdownElement.append(markdown);
    }
    #setupListeners() {
        window.addEventListener('mousedown', this.#detectOutsideInteraction);
        window.addEventListener('focusin', this.#detectOutsideInteraction);
        window.addEventListener('wheel', this.#detectOutsideInteraction);
        window.addEventListener('keydown', this.#detectOutsideInteraction);
    }
    #teardownListeners() {
        window.removeEventListener('mousedown', this.#detectOutsideInteraction);
        window.removeEventListener('focusin', this.#detectOutsideInteraction);
        window.removeEventListener('wheel', this.#detectOutsideInteraction);
        window.removeEventListener('keydown', this.#detectOutsideInteraction);
    }
    async show() {
        this.#setupListeners();
        this.#renderMarkdown('loading...');
        this.#popover.setContentAnchorBox(this.#source.getAnchor());
        this.#popover.show(document);
        this.#popover.positionContent();
        try {
            this.#prompt = await this.#source.getPrompt();
            const result = await runPrompt(this.#prompt);
            this.#renderMarkdown(result);
            this.#answer = result;
            const ratingContainer = this.#contentElement.querySelector('.rating');
            ratingContainer.style.display = 'flex';
        }
        catch (err) {
            this.#renderMarkdown(`loading failed: ${err.message}`);
        }
        this.#popover.positionContent();
    }
    hide() {
        this.#popover.hide();
        this.#teardownListeners();
    }
}
async function runPrompt(input) {
    return new Promise((resolve, reject) => {
        if (!Host.InspectorFrontendHost.InspectorFrontendHostInstance.doAidaConversation) {
            return reject(new Error('doAidaConversation is not available'));
        }
        console.time('request');
        Host.InspectorFrontendHost.InspectorFrontendHostInstance.doAidaConversation(JSON.stringify({
            input,
            client: 'GENERAL',
        }), result => {
            console.timeEnd('request');
            try {
                const results = JSON.parse(result.response);
                const text = results
                    .map((result) => {
                    if ('textChunk' in result) {
                        return result.textChunk.text;
                    }
                    if ('codeChunk' in result) {
                        return result.codeChunk.code;
                    }
                    throw new Error('Unknown chunk result');
                })
                    .join(' ');
                resolve(text);
            }
            catch (err) {
                reject(err);
            }
        });
    });
}
//# map=ExplainPopover.js.map