// Copyright 2023 The Chromium Authors. All rights reserved.
// Use of this source code is governed by a BSD-style license that can be
// found in the LICENSE file.
import * as Host from '../../../core/host/host.js';
import * as i18n from '../../../core/i18n/i18n.js';
import * as ComponentHelpers from '../../../ui/components/helpers/helpers.js';
import * as LitHtml from '../../../ui/lit-html/lit-html.js';
import { SelectButton, } from './SelectButton.js';
const UIStrings = {
    /**
     * @description Button label for the normal speed replay option
     */
    ReplayNormalButtonLabel: 'Replay',
    /**
     * @description Item label for the normal speed replay option
     */
    ReplayNormalItemLabel: 'Normal (Default)',
    /**
     * @description Button label for the slow speed replay option
     */
    ReplaySlowButtonLabel: 'Slow replay',
    /**
     * @description Item label for the slow speed replay option
     */
    ReplaySlowItemLabel: 'Slow',
    /**
     * @description Button label for the very slow speed replay option
     */
    ReplayVerySlowButtonLabel: 'Very slow replay',
    /**
     * @description Item label for the very slow speed replay option
     */
    ReplayVerySlowItemLabel: 'Very slow',
    /**
     * @description Button label for the extremely slow speed replay option
     */
    ReplayExtremelySlowButtonLabel: 'Extremely slow replay',
    /**
     * @description Item label for the slow speed replay option
     */
    ReplayExtremelySlowItemLabel: 'Extremely slow',
    /**
     * @description Label for a group of items in the replay menu that indicate various replay speeds (e.g., Normal, Fast, Slow).
     */
    speedGroup: 'Speed',
    /**
     * @description Label for a group of items in the replay menu that indicate various extensions that can be used for replay.
     */
    extensionGroup: 'Extensions',
};
const items = [
    {
        value: "normal" /* PlayRecordingSpeed.Normal */,
        buttonIconName: 'play',
        buttonLabel: () => i18nString(UIStrings.ReplayNormalButtonLabel),
        label: () => i18nString(UIStrings.ReplayNormalItemLabel),
    },
    {
        value: "slow" /* PlayRecordingSpeed.Slow */,
        buttonIconName: 'play',
        buttonLabel: () => i18nString(UIStrings.ReplaySlowButtonLabel),
        label: () => i18nString(UIStrings.ReplaySlowItemLabel),
    },
    {
        value: "very_slow" /* PlayRecordingSpeed.VerySlow */,
        buttonIconName: 'play',
        buttonLabel: () => i18nString(UIStrings.ReplayVerySlowButtonLabel),
        label: () => i18nString(UIStrings.ReplayVerySlowItemLabel),
    },
    {
        value: "extremely_slow" /* PlayRecordingSpeed.ExtremelySlow */,
        buttonIconName: 'play',
        buttonLabel: () => i18nString(UIStrings.ReplayExtremelySlowButtonLabel),
        label: () => i18nString(UIStrings.ReplayExtremelySlowItemLabel),
    },
];
const replaySpeedToMetricSpeedMap = {
    ["normal" /* PlayRecordingSpeed.Normal */]: Host.UserMetrics.RecordingReplaySpeed.Normal,
    ["slow" /* PlayRecordingSpeed.Slow */]: Host.UserMetrics.RecordingReplaySpeed.Slow,
    ["very_slow" /* PlayRecordingSpeed.VerySlow */]: Host.UserMetrics.RecordingReplaySpeed.VerySlow,
    ["extremely_slow" /* PlayRecordingSpeed.ExtremelySlow */]: Host.UserMetrics.RecordingReplaySpeed.ExtremelySlow,
};
const str_ = i18n.i18n.registerUIStrings('panels/recorder/components/ReplayButton.ts', UIStrings);
const i18nString = i18n.i18n.getLocalizedString.bind(undefined, str_);
export class StartReplayEvent extends Event {
    speed;
    extension;
    static eventName = 'startreplay';
    constructor(speed, extension) {
        super(StartReplayEvent.eventName, { bubbles: true, composed: true });
        this.speed = speed;
        this.extension = extension;
    }
}
const REPLAY_EXTENSION_PREFIX = 'extension';
export class ReplayButton extends HTMLElement {
    static litTagName = LitHtml.literal `devtools-replay-button`;
    #shadow = this.attachShadow({ mode: 'open' });
    #boundRender = this.#render.bind(this);
    #props = { disabled: false };
    #settings;
    #replayExtensions = [];
    set data(data) {
        this.#settings = data.settings;
        this.#replayExtensions = data.replayExtensions;
    }
    get disabled() {
        return this.#props.disabled;
    }
    set disabled(disabled) {
        this.#props.disabled = disabled;
        void ComponentHelpers.ScheduledRender.scheduleRender(this, this.#boundRender);
    }
    connectedCallback() {
        void ComponentHelpers.ScheduledRender.scheduleRender(this, this.#boundRender);
    }
    #handleSelectButtonClick(event) {
        event.stopPropagation();
        if (event.value.startsWith(REPLAY_EXTENSION_PREFIX)) {
            if (this.#settings) {
                this.#settings.replayExtension = event.value;
            }
            const extensionIdx = Number(event.value.substring(REPLAY_EXTENSION_PREFIX.length));
            this.dispatchEvent(new StartReplayEvent("normal" /* PlayRecordingSpeed.Normal */, this.#replayExtensions[extensionIdx]));
            void ComponentHelpers.ScheduledRender.scheduleRender(this, this.#boundRender);
            return;
        }
        const speed = event.value;
        if (this.#settings) {
            this.#settings.speed = speed;
            this.#settings.replayExtension = '';
        }
        Host.userMetrics.recordingReplaySpeed(replaySpeedToMetricSpeedMap[speed]);
        this.dispatchEvent(new StartReplayEvent(event.value));
        void ComponentHelpers.ScheduledRender.scheduleRender(this, this.#boundRender);
    }
    #render() {
        const groups = [{ name: i18nString(UIStrings.speedGroup), items }];
        if (this.#replayExtensions.length) {
            groups.push({
                name: i18nString(UIStrings.extensionGroup),
                items: this.#replayExtensions.map((extension, idx) => {
                    return {
                        value: REPLAY_EXTENSION_PREFIX + idx,
                        buttonIconName: 'play',
                        buttonLabel: () => extension.getName(),
                        label: () => extension.getName(),
                    };
                }),
            });
        }
        // clang-format off
        LitHtml.render(LitHtml.html `
    <${SelectButton.litTagName}
      @selectbuttonclick=${this.#handleSelectButtonClick}
      .variant=${"primary" /* SelectButtonVariant.PRIMARY */}
      .showItemDivider=${false}
      .disabled=${this.#props.disabled}
      .action=${"chrome_recorder.replay-recording" /* Actions.RecorderActions.ReplayRecording */}
      .value=${this.#settings?.replayExtension || this.#settings?.speed}
      .groups=${groups}>
    </${SelectButton.litTagName}>`, this.#shadow, { host: this });
        // clang-format on
    }
}
ComponentHelpers.CustomElements.defineComponent('devtools-replay-button', ReplayButton);
//# map=ReplayButton.js.map