// Copyright 2016 The Chromium Authors. All rights reserved.
// Use of this source code is governed by a BSD-style license that can be
// found in the LICENSE file.
import * as Common from '../../core/common/common.js';
import * as i18n from '../../core/i18n/i18n.js';
import * as Platform from '../../core/platform/platform.js';
import timelineFlamechartPopoverStyles from './timelineFlamechartPopover.css.js';
import * as PerfUI from '../../ui/legacy/components/perf_ui/perf_ui.js';
import * as UI from '../../ui/legacy/legacy.js';
import * as ThemeSupport from '../../ui/legacy/theme_support/theme_support.js';
import { FlameChartStyle, Selection } from './TimelineFlameChartView.js';
import { TimelineSelection } from './TimelineSelection.js';
import { TimelineUIUtils } from './TimelineUIUtils.js';
const UIStrings = {
    /**
     *@description Title of the Network tool
     */
    network: 'Network',
};
const str_ = i18n.i18n.registerUIStrings('panels/timeline/TimelineFlameChartNetworkDataProvider.ts', UIStrings);
const i18nString = i18n.i18n.getLocalizedString.bind(undefined, str_);
export class TimelineFlameChartNetworkDataProvider {
    font;
    style;
    group;
    minimumBoundaryInternal;
    maximumBoundary;
    timeSpan;
    requests;
    maxLevel;
    model;
    // TODO(crbug.com/1172300) Ignored during the jsdoc to ts migration
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    timelineDataInternal;
    startTime;
    endTime;
    lastSelection;
    priorityToValue;
    constructor() {
        this.font = `${PerfUI.Font.DEFAULT_FONT_SIZE} ${PerfUI.Font.getFontFamilyForCanvas()}`;
        this.setModel(null);
        this.style = {
            padding: 4,
            height: 17,
            collapsible: true,
            color: ThemeSupport.ThemeSupport.instance().getComputedValue('--color-text-primary'),
            font: this.font,
            backgroundColor: ThemeSupport.ThemeSupport.instance().getComputedValue('--color-background'),
            nestingLevel: 0,
            useFirstLineForOverview: false,
            useDecoratorsForOverview: true,
            shareHeaderLine: false,
        };
        this.group =
            { startLevel: 0, name: i18nString(UIStrings.network), expanded: false, style: this.style };
        this.minimumBoundaryInternal = 0;
        this.maximumBoundary = 0;
        this.timeSpan = 0;
        this.requests = [];
        this.maxLevel = 0;
        // In the event of a theme change, these colors must be recalculated.
        ThemeSupport.ThemeSupport.instance().addEventListener(ThemeSupport.ThemeChangeEvent.eventName, () => {
            this.style.color = ThemeSupport.ThemeSupport.instance().getComputedValue('--color-text-primary');
            this.style.backgroundColor = ThemeSupport.ThemeSupport.instance().getComputedValue('--color-background');
        });
    }
    setModel(performanceModel) {
        this.model = performanceModel && performanceModel.timelineModel();
        this.timelineDataInternal = null;
    }
    isEmpty() {
        this.timelineData();
        return !this.requests.length;
    }
    maxStackDepth() {
        return this.maxLevel;
    }
    timelineData() {
        if (this.timelineDataInternal) {
            return this.timelineDataInternal;
        }
        this.requests = [];
        this.timelineDataInternal = PerfUI.FlameChart.FlameChartTimelineData.createEmpty();
        if (this.model) {
            this.appendTimelineData();
        }
        return this.timelineDataInternal;
    }
    minimumBoundary() {
        return this.minimumBoundaryInternal;
    }
    totalTime() {
        return this.timeSpan;
    }
    setWindowTimes(startTime, endTime) {
        this.startTime = startTime;
        this.endTime = endTime;
        this.updateTimelineData();
    }
    createSelection(index) {
        if (index === -1) {
            return null;
        }
        const request = this.requests[index];
        this.lastSelection = new Selection(TimelineSelection.fromNetworkRequest(request), index);
        return this.lastSelection.timelineSelection;
    }
    entryIndexForSelection(selection) {
        if (!selection) {
            return -1;
        }
        if (this.lastSelection && this.lastSelection.timelineSelection.object === selection.object) {
            return this.lastSelection.entryIndex;
        }
        if (!TimelineSelection.isNetworkRequestSelection(selection.object)) {
            return -1;
        }
        const index = this.requests.indexOf(selection.object);
        if (index !== -1) {
            this.lastSelection = new Selection(TimelineSelection.fromNetworkRequest(selection.object), index);
        }
        return index;
    }
    entryColor(index) {
        const request = this.requests[index];
        const category = TimelineUIUtils.networkRequestCategory(request);
        return TimelineUIUtils.networkCategoryColor(category);
    }
    textColor(_index) {
        return FlameChartStyle.textColor;
    }
    entryTitle(index) {
        const request = this.requests[index];
        const parsedURL = new Common.ParsedURL.ParsedURL(request.url || '');
        return parsedURL.isValid ? `${parsedURL.displayName} (${parsedURL.host})` : request.url || null;
    }
    entryFont(_index) {
        return this.font;
    }
    decorateEntry(index, context, text, barX, barY, barWidth, barHeight, unclippedBarX, timeToPixelRatio) {
        const request = this.requests[index];
        if (!request.timing) {
            return false;
        }
        const beginTime = request.beginTime();
        const timeToPixel = (time) => Math.floor(unclippedBarX + (time - beginTime) * timeToPixelRatio);
        const minBarWidthPx = 2;
        const startTime = request.getStartTime();
        const endTime = request.endTime;
        const { sendStartTime, headersEndTime } = request.getSendReceiveTiming();
        const sendStart = Math.max(timeToPixel(sendStartTime), unclippedBarX);
        const headersEnd = Math.max(timeToPixel(headersEndTime), sendStart);
        const finish = Math.max(timeToPixel(request.finishTime || endTime), headersEnd + minBarWidthPx);
        const start = timeToPixel(startTime);
        const end = Math.max(timeToPixel(endTime), finish);
        // Draw waiting time.
        context.fillStyle = 'hsla(0, 100%, 100%, 0.8)';
        context.fillRect(sendStart + 0.5, barY + 0.5, headersEnd - sendStart - 0.5, barHeight - 2);
        // Clear portions of initial rect to prepare for the ticks.
        context.fillStyle = ThemeSupport.ThemeSupport.instance().getComputedValue('--color-background');
        context.fillRect(barX, barY - 0.5, sendStart - barX, barHeight);
        context.fillRect(finish, barY - 0.5, barX + barWidth - finish, barHeight);
        // Draws left and right whiskers
        function drawTick(begin, end, y) {
            const /** @const */ tickHeightPx = 6;
            context.moveTo(begin, y - tickHeightPx / 2);
            context.lineTo(begin, y + tickHeightPx / 2);
            context.moveTo(begin, y);
            context.lineTo(end, y);
        }
        context.beginPath();
        context.lineWidth = 1;
        context.strokeStyle = '#ccc';
        const lineY = Math.floor(barY + barHeight / 2) + 0.5;
        const leftTick = start + 0.5;
        const rightTick = end - 0.5;
        drawTick(leftTick, sendStart, lineY);
        drawTick(rightTick, finish, lineY);
        context.stroke();
        if (typeof request.priority === 'string') {
            const color = this.colorForPriority(request.priority);
            if (color) {
                context.fillStyle = color;
                context.fillRect(sendStart + 0.5, barY + 0.5, 3.5, 3.5);
            }
        }
        // Draw request URL as text
        const textStart = Math.max(sendStart, 0);
        const textWidth = finish - textStart;
        const /** @const */ minTextWidthPx = 20;
        if (textWidth >= minTextWidthPx) {
            text = this.entryTitle(index) || '';
            if (request.fromServiceWorker) {
                text = '⚙ ' + text;
            }
            if (text) {
                const /** @const */ textPadding = 4;
                const /** @const */ textBaseline = 5;
                const textBaseHeight = barHeight - textBaseline;
                const trimmedText = UI.UIUtils.trimTextEnd(context, text, textWidth - 2 * textPadding);
                context.fillStyle = '#333';
                context.fillText(trimmedText, textStart + textPadding, barY + textBaseHeight);
            }
        }
        return true;
    }
    forceDecoration(_index) {
        return true;
    }
    prepareHighlightedEntryInfo(index) {
        const /** @const */ maxURLChars = 80;
        const request = this.requests[index];
        if (!request.url) {
            return null;
        }
        const element = document.createElement('div');
        const root = UI.Utils.createShadowRootWithCoreStyles(element, {
            cssFile: [timelineFlamechartPopoverStyles],
            delegatesFocus: undefined,
        });
        const contents = root.createChild('div', 'timeline-flamechart-popover');
        const startTime = request.getStartTime();
        const duration = request.endTime - startTime;
        if (startTime && isFinite(duration)) {
            contents.createChild('span', 'timeline-info-network-time').textContent =
                i18n.TimeUtilities.millisToString(duration, true);
        }
        if (typeof request.priority === 'string') {
            const div = contents.createChild('span');
            div.textContent =
                PerfUI.NetworkPriorities.uiLabelForNetworkPriority(request.priority);
            div.style.color = this.colorForPriority(request.priority) || 'black';
        }
        contents.createChild('span').textContent = Platform.StringUtilities.trimMiddle(request.url, maxURLChars);
        return element;
    }
    colorForPriority(priority) {
        if (!this.priorityToValue) {
            this.priorityToValue = new Map([
                ["VeryLow" /* Protocol.Network.ResourcePriority.VeryLow */, 1],
                ["Low" /* Protocol.Network.ResourcePriority.Low */, 2],
                ["Medium" /* Protocol.Network.ResourcePriority.Medium */, 3],
                ["High" /* Protocol.Network.ResourcePriority.High */, 4],
                ["VeryHigh" /* Protocol.Network.ResourcePriority.VeryHigh */, 5],
            ]);
        }
        const value = this.priorityToValue.get(priority);
        return value ? `hsla(214, 80%, 50%, ${value / 5})` : null;
    }
    appendTimelineData() {
        if (this.model) {
            this.minimumBoundaryInternal = this.model.minimumRecordTime();
            this.maximumBoundary = this.model.maximumRecordTime();
            this.timeSpan = this.model.isEmpty() ? 1000 : this.maximumBoundary - this.minimumBoundaryInternal;
            this.model.networkRequests().forEach(this.appendEntry.bind(this));
            this.updateTimelineData();
        }
    }
    updateTimelineData() {
        if (!this.timelineDataInternal) {
            return;
        }
        const lastTimeByLevel = [];
        let maxLevel = 0;
        for (let i = 0; i < this.requests.length; ++i) {
            const r = this.requests[i];
            const beginTime = r.beginTime();
            const startTime = this.startTime;
            const endTime = this.endTime;
            const visible = beginTime < endTime && r.endTime > startTime;
            if (!visible) {
                this.timelineDataInternal.entryLevels[i] = -1;
                continue;
            }
            while (lastTimeByLevel.length && lastTimeByLevel[lastTimeByLevel.length - 1] <= beginTime) {
                lastTimeByLevel.pop();
            }
            this.timelineDataInternal.entryLevels[i] = lastTimeByLevel.length;
            lastTimeByLevel.push(r.endTime);
            maxLevel = Math.max(maxLevel, lastTimeByLevel.length);
        }
        for (let i = 0; i < this.requests.length; ++i) {
            if (this.timelineDataInternal.entryLevels[i] === -1) {
                this.timelineDataInternal.entryLevels[i] = maxLevel;
            }
        }
        this.timelineDataInternal = PerfUI.FlameChart.FlameChartTimelineData.create({
            entryLevels: this.timelineDataInternal.entryLevels,
            entryTotalTimes: this.timelineDataInternal.entryTotalTimes,
            entryStartTimes: this.timelineDataInternal.entryStartTimes,
            groups: [this.group],
        });
        this.maxLevel = maxLevel;
    }
    appendEntry(request) {
        this.requests.push(request);
        this.timelineDataInternal.entryStartTimes.push(request.beginTime());
        this.timelineDataInternal.entryTotalTimes.push(request.endTime - request.beginTime());
        this.timelineDataInternal.entryLevels.push(this.requests.length - 1);
    }
    preferredHeight() {
        return this.style.height * (this.group.expanded ? Platform.NumberUtilities.clamp(this.maxLevel + 1, 4, 8.5) : 1);
    }
    isExpanded() {
        return this.group && Boolean(this.group.expanded);
    }
    formatValue(value, precision) {
        return i18n.TimeUtilities.preciseMillisToString(value, precision);
    }
    canJumpToEntry(_entryIndex) {
        return false;
    }
    // TODO(crbug.com/1172300) Ignored during the jsdoc to ts migration
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    // TODO(crbug.com/1172300) Ignored during the jsdoc to ts migration
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    navStartTimes() {
        if (!this.model) {
            return new Map();
        }
        return this.model.navStartTimes();
    }
}
//# map=TimelineFlameChartNetworkDataProvider.js.map