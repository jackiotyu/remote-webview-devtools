// Copyright 2022 The Chromium Authors. All rights reserved.
// Use of this source code is governed by a BSD-style license that can be
// found in the LICENSE file.
import * as Common from '../../../core/common/common.js';
import * as Platform from '../../../core/platform/platform.js';
export function extractOriginFromTrace(firstNavigationURL) {
    const url = Common.ParsedURL.ParsedURL.fromString(firstNavigationURL);
    if (url) {
        // We do this to save some space in the toolbar - seeing the `www` is less
        // useful than seeing `foo.com` if it's truncated at narrow widths
        if (url.host.startsWith('www.')) {
            return url.host.slice(4);
        }
        return url.host;
    }
    return null;
}
// Each thread contains events. Events indicate the thread and process IDs, which are
// used to store the event in the correct process thread entry below.
export function addEventToProcessThread(event, eventsInProcessThread) {
    const { tid, pid } = event;
    let eventsInThread = eventsInProcessThread.get(pid);
    if (!eventsInThread) {
        eventsInThread = new Map();
    }
    let events = eventsInThread.get(tid);
    if (!events) {
        events = [];
    }
    events.push(event);
    eventsInThread.set(event.tid, events);
    eventsInProcessThread.set(event.pid, eventsInThread);
}
function eventTimeComparator(a, b) {
    const aBeginTime = a.ts;
    const bBeginTime = b.ts;
    if (aBeginTime < bBeginTime) {
        return -1;
    }
    if (aBeginTime > bBeginTime) {
        return 1;
    }
    const aDuration = a.dur ?? 0;
    const bDuration = b.dur ?? 0;
    const aEndTime = aBeginTime + aDuration;
    const bEndTime = bBeginTime + bDuration;
    if (aEndTime > bEndTime) {
        return -1;
    }
    if (aEndTime < bEndTime) {
        return 1;
    }
    return 0;
}
/**
 * Sorts all the events in place, in order, by their start time. If they have
 * the same start time, orders them by longest first.
 */
export function sortTraceEventsInPlace(events) {
    events.sort(eventTimeComparator);
}
/**
 * Returns an array of ordered events that results after merging the two
 * ordered input arrays.
 */
export function mergeEventsInOrder(eventsArray1, eventsArray2) {
    const result = [];
    let i = 0;
    let j = 0;
    while (i < eventsArray1.length && j < eventsArray2.length) {
        const event1 = eventsArray1[i];
        const event2 = eventsArray2[j];
        const compareValue = eventTimeComparator(event1, event2);
        if (compareValue <= 0) {
            result.push(event1);
            i++;
        }
        if (compareValue === 1) {
            result.push(event2);
            j++;
        }
    }
    while (i < eventsArray1.length) {
        result.push(eventsArray1[i++]);
    }
    while (j < eventsArray2.length) {
        result.push(eventsArray2[j++]);
    }
    return result;
}
export function getNavigationForTraceEvent(event, eventFrameId, navigationsByFrameId) {
    const navigations = navigationsByFrameId.get(eventFrameId);
    if (!navigations || eventFrameId === '') {
        // This event's navigation has been filtered out by the meta handler as a noise event
        // or contains an empty frameId.
        return null;
    }
    const eventNavigationIndex = Platform.ArrayUtilities.nearestIndexFromEnd(navigations, navigation => navigation.ts <= event.ts);
    if (eventNavigationIndex === null) {
        // This event's navigation has been filtered out by the meta handler as a noise event.
        return null;
    }
    return navigations[eventNavigationIndex];
}
export function extractId(event) {
    return event.id || event.id2?.global || event.id2?.local;
}
export function activeURLForFrameAtTime(frameId, time, rendererProcessesByFrame) {
    const processData = rendererProcessesByFrame.get(frameId);
    if (!processData) {
        return null;
    }
    for (const processes of processData.values()) {
        for (const processInfo of processes) {
            if (processInfo.window.min > time || processInfo.window.max < time) {
                continue;
            }
            return processInfo.frame.url;
        }
    }
    return null;
}
//# map=Trace.js.map