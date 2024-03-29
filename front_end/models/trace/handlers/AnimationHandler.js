// Copyright 2022 The Chromium Authors. All rights reserved.
// Use of this source code is governed by a BSD-style license that can be
// found in the LICENSE file.
import * as Platform from '../../../core/platform/platform.js';
import * as Types from '../types/types.js';
const animations = [];
const animationsSyntheticEvents = [];
let handlerState = 1 /* HandlerState.UNINITIALIZED */;
export function reset() {
    animations.length = 0;
    animationsSyntheticEvents.length = 0;
}
export function handleEvent(event) {
    if (Types.TraceEvents.isTraceEventAnimation(event)) {
        animations.push(event);
        return;
    }
}
export async function finalize() {
    const matchedEvents = matchBeginningAndEndEvents();
    createSortedAnimationsSyntheticEvents(matchedEvents);
    handlerState = 3 /* HandlerState.FINALIZED */;
}
function matchBeginningAndEndEvents() {
    // map to store begin and end of the event
    const matchedEvents = new Map();
    // looking for start and end
    for (const event of animations) {
        const id = event.id2;
        if (id === undefined) {
            continue;
        }
        const syntheticId = `${event.cat}:${id.local}:${event.name}`;
        const otherEventsWithID = Platform.MapUtilities.getWithDefault(matchedEvents, syntheticId, () => {
            return { begin: null, end: null };
        });
        const isStartEvent = event.ph === "b" /* Types.TraceEvents.Phase.ASYNC_NESTABLE_START */;
        const isEndEvent = event.ph === "e" /* Types.TraceEvents.Phase.ASYNC_NESTABLE_END */;
        if (isStartEvent) {
            otherEventsWithID.begin = {
                ...event,
                ph: "b" /* Types.TraceEvents.Phase.ASYNC_NESTABLE_START */,
                id2: {
                    local: event.id2?.local,
                },
                id: event.args?.id,
            };
        }
        else if (isEndEvent) {
            otherEventsWithID.end = {
                ...event,
                ph: "e" /* Types.TraceEvents.Phase.ASYNC_NESTABLE_END */,
                id2: {
                    local: event.id2?.local,
                },
                id: event.args?.id,
            };
        }
    }
    return matchedEvents;
}
function createSortedAnimationsSyntheticEvents(matchedEvents) {
    for (const [id, eventsPair] of matchedEvents.entries()) {
        if (!eventsPair.begin || !eventsPair.end) {
            continue;
        }
        const event = {
            cat: eventsPair.end.cat,
            ph: eventsPair.end.ph,
            pid: eventsPair.end.pid,
            tid: eventsPair.end.tid,
            id,
            name: eventsPair.begin.name,
            dur: Types.Timing.MicroSeconds(eventsPair.end.ts - eventsPair.begin.ts),
            ts: eventsPair.begin.ts,
            args: {
                data: {
                    beginEvent: eventsPair.begin,
                    endEvent: eventsPair.end,
                },
            },
        };
        if (event.dur < 0) {
            // We have seen in the backend that sometimes animation events get
            // generated with multiple begin entries, or multiple end entries, and this
            // can cause invalid data on the performance panel, so we drop them.
            // crbug.com/1472375
            continue;
        }
        animationsSyntheticEvents.push(event);
    }
    animationsSyntheticEvents.sort((a, b) => a.ts - b.ts);
}
export function data() {
    if (handlerState !== 3 /* HandlerState.FINALIZED */) {
        throw new Error('Animation handler is not finalized');
    }
    return {
        animations: Array.from(animationsSyntheticEvents),
    };
}
//# map=AnimationHandler.js.map