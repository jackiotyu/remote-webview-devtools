// Copyright 2023 The Chromium Authors. All rights reserved.
// Use of this source code is governed by a BSD-style license that can be
// found in the LICENSE file.
import * as TimelineModel from '../../models/timeline_model/timeline_model.js';
import * as TraceEngine from '../../models/trace/trace.js';
const SelectionRangeSymbol = Symbol('SelectionRange');
export class TimelineSelection {
    startTime;
    endTime;
    object;
    constructor(startTime, endTime, object) {
        this.startTime = startTime;
        this.endTime = endTime;
        this.object = object;
    }
    static isFrameObject(object) {
        return object instanceof TimelineModel.TimelineFrameModel.TimelineFrame;
    }
    static fromFrame(frame) {
        return new TimelineSelection(TraceEngine.Types.Timing.MilliSeconds(frame.startTime), TraceEngine.Types.Timing.MilliSeconds(frame.endTime), frame);
    }
    static isSyntheticNetworkRequestDetailsEventSelection(object) {
        if (object instanceof TraceEngine.Legacy.Event) {
            return false;
        }
        // Sadly new trace events are just raw objects, so now we have to confirm it is a trace event by ruling everything else out.
        if (TimelineSelection.isFrameObject(object) || TimelineSelection.isRangeSelection(object)) {
            return false;
        }
        if (TraceEngine.Legacy.eventIsFromNewEngine(object)) {
            return TraceEngine.Types.TraceEvents.isSyntheticNetworkRequestDetailsEvent(object);
        }
        return false;
    }
    static isTraceEventSelection(object) {
        if (object instanceof TraceEngine.Legacy.Event) {
            return true;
        }
        // Sadly new trace events are just raw objects, so now we have to confirm it is a trace event by ruling everything else out.
        if (TimelineSelection.isFrameObject(object) || TimelineSelection.isRangeSelection(object)) {
            return false;
        }
        // Now the network request will be handled separately, so return false here.
        if (TraceEngine.Types.TraceEvents.isSyntheticNetworkRequestDetailsEvent(object)) {
            return false;
        }
        return TraceEngine.Legacy.eventIsFromNewEngine(object);
    }
    static fromTraceEvent(event) {
        const { startTime, endTime } = TraceEngine.Legacy.timesForEventInMilliseconds(event);
        return new TimelineSelection(startTime, TraceEngine.Types.Timing.MilliSeconds(endTime || (startTime + 1)), event);
    }
    static isRangeSelection(object) {
        return object === SelectionRangeSymbol;
    }
    static fromRange(startTime, endTime) {
        return new TimelineSelection(TraceEngine.Types.Timing.MilliSeconds(startTime), TraceEngine.Types.Timing.MilliSeconds(endTime), SelectionRangeSymbol);
    }
}
//# map=TimelineSelection.js.map