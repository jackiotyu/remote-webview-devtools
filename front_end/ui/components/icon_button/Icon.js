// Copyright (c) 2020 The Chromium Authors. All rights reserved.
// Use of this source code is governed by a BSD-style license that can be
// found in the LICENSE file.
import * as ComponentHelpers from '../../../ui/components/helpers/helpers.js';
import * as LitHtml from '../../../ui/lit-html/lit-html.js';
import * as Coordinator from '../render_coordinator/render_coordinator.js';
import iconStyles from './icon.css.js';
const isString = (value) => value !== undefined;
const coordinator = Coordinator.RenderCoordinator.RenderCoordinator.instance();
export class Icon extends HTMLElement {
    static litTagName = LitHtml.literal `devtools-icon`;
    #shadow = this.attachShadow({ mode: 'open' });
    #iconPath = '';
    #color = 'rgb(110 110 110)';
    #width = '100%';
    #height = '100%';
    #iconName;
    connectedCallback() {
        this.#shadow.adoptedStyleSheets = [iconStyles];
    }
    set data(data) {
        const { width, height } = data;
        this.#color = data.color;
        this.#width = isString(width) ? width : (isString(height) ? height : this.#width);
        this.#height = isString(height) ? height : (isString(width) ? width : this.#height);
        if ('iconPath' in data && data.iconPath) {
            this.#iconPath = data.iconPath;
        }
        else if ('iconName' in data && data.iconName) {
            this.#iconPath = new URL(`../../../Images/${data.iconName}.svg`, import.meta.url).toString();
            this.#iconName = data.iconName;
        }
        else {
            throw new Error('Misconfigured iconName or iconPath.');
        }
        this.#render();
    }
    get data() {
        const commonData = {
            color: this.#color,
            width: this.#width,
            height: this.#height,
        };
        if (this.#iconName) {
            return {
                ...commonData,
                iconName: this.#iconName,
            };
        }
        return {
            ...commonData,
            iconPath: this.#iconPath,
        };
    }
    #getStyles() {
        const iconPath = this.#iconPath;
        const width = this.#width;
        const height = this.#height;
        const color = this.#color;
        const commonStyles = {
            width,
            height,
            display: 'block',
        };
        if (color) {
            return {
                ...commonStyles,
                webkitMaskImage: `url(${iconPath})`,
                webkitMaskPosition: 'center',
                webkitMaskRepeat: 'no-repeat',
                // We are setting this to 99% to work around an issue where non-standard zoom levels would cause the icon to clip.
                webkitMaskSize: '99%',
                backgroundColor: `var(--icon-color, ${color})`,
            };
        }
        return {
            ...commonStyles,
            backgroundImage: `url(${iconPath})`,
            backgroundPosition: 'center',
            backgroundRepeat: 'no-repeat',
            // We are setting this to 99% to work around an issue where non-standard zoom levels would cause the icon to clip.
            backgroundSize: '99%',
        };
    }
    #render() {
        void coordinator.write(() => {
            // clang-format off
            LitHtml.render(LitHtml.html `
        <div class="icon-basic" style=${LitHtml.Directives.styleMap(this.#getStyles())}></div>
      `, this.#shadow, { host: this });
            // clang-format on
        });
    }
}
ComponentHelpers.CustomElements.defineComponent('devtools-icon', Icon);
//# map=Icon.js.map