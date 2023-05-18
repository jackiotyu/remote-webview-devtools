// Copyright 2023 The Chromium Authors. All rights reserved.
// Use of this source code is governed by a BSD-style license that can be
// found in the LICENSE file.
import * as PerfUI from '../../../legacy/components/perf_ui/perf_ui.js';
export class FakeProvider {
    minimumBoundary() {
        return 0;
    }
    totalTime() {
        return 100;
    }
    formatValue(value) {
        return value.toString();
    }
    maxStackDepth() {
        return 3;
    }
    prepareHighlightedEntryInfo(_entryIndex) {
        return null;
    }
    canJumpToEntry(_entryIndex) {
        return false;
    }
    entryTitle(entryIndex) {
        return `Entry ${entryIndex}`;
    }
    entryFont(_entryIndex) {
        return null;
    }
    entryColor(_entryIndex) {
        return 'lightblue';
    }
    decorateEntry() {
        return false;
    }
    forceDecoration(_entryIndex) {
        return false;
    }
    textColor(_entryIndex) {
        return 'black';
    }
    navStartTimes() {
        return new Map();
    }
    timelineData() {
        return PerfUI.FlameChart.FlameChartTimelineData.createEmpty();
    }
}
//# map=FlameChartHelpers.js.map