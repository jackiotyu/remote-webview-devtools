// Copyright 2022 The Chromium Authors. All rights reserved.
// Use of this source code is governed by a BSD-style license that can be
// found in the LICENSE file.
import * as Platform from '../../../core/platform/platform.js';
import * as CPUProfile from '../../cpu_profile/cpu_profile.js';
import * as Helpers from '../helpers/helpers.js';
import * as Types from '../types/types.js';
const events = new Map();
const profilesInProcess = new Map();
// The profile head, containing its metadata like its start
// time, comes in a "Profile" event. The sample data comes in
// "ProfileChunk" events. We match these ProfileChunks with their head
// using process and profile ids. However, in order to integrate sample
// data with trace data, we need the thread id that owns each profile.
// This thread id is extracted from the head event.
// For this reason, we have a preprocessed data structure, where events
// are matched by profile id, which we then finish processing to export
// events matched by thread id.
const preprocessedData = new Map();
let handlerState = 1 /* HandlerState.UNINITIALIZED */;
export function buildProfileCalls() {
    for (const [processId, profiles] of preprocessedData) {
        for (const [profileId, preProcessedData] of profiles) {
            const threadId = preProcessedData.threadId;
            if (!preProcessedData.rawProfile.nodes.length || !threadId) {
                continue;
            }
            const trackingStack = [];
            const profileModel = new CPUProfile.CPUProfileDataModel.CPUProfileDataModel(preProcessedData.rawProfile);
            const finalizedData = { rawProfile: preProcessedData.rawProfile, parsedProfile: profileModel, profileCalls: [] };
            profileModel.forEachFrame(openFrameCallback, closeFrameCallback);
            Helpers.Trace.sortTraceEventsInPlace(finalizedData.profileCalls);
            const dataByThread = Platform.MapUtilities.getWithDefault(profilesInProcess, processId, () => new Map());
            dataByThread.set(threadId, finalizedData);
            function openFrameCallback(_depth, node, timeStampMs) {
                const ts = Helpers.Timing.millisecondsToMicroseconds(Types.Timing.MilliSeconds(timeStampMs));
                trackingStack.push({ callFrame: node.callFrame, ts, pid: processId, children: [], tid: threadId });
            }
            function closeFrameCallback(depth, node, _timeStamp, durMs, selfTimeMs) {
                const partialProfileCall = trackingStack.pop();
                if (!partialProfileCall) {
                    return;
                }
                const { callFrame, ts, pid, children, tid } = partialProfileCall;
                if (callFrame === undefined || ts === undefined || pid === undefined || profileId === undefined ||
                    children === undefined || tid === undefined) {
                    return;
                }
                const dur = Helpers.Timing.millisecondsToMicroseconds(Types.Timing.MilliSeconds(durMs));
                const selfTime = Helpers.Timing.millisecondsToMicroseconds(Types.Timing.MilliSeconds(selfTimeMs));
                const completeProfileCall = {
                    callFrame,
                    ts,
                    pid,
                    dur,
                    selfTime,
                    children,
                    ph: "X" /* Types.TraceEvents.Phase.COMPLETE */,
                    cat: '',
                    args: {},
                    name: 'ProfileCall',
                    tid,
                    nodeId: node.id,
                };
                const parent = trackingStack.at(-1);
                const calls = finalizedData.profileCalls;
                calls.push(completeProfileCall);
                if (!parent) {
                    return;
                }
                parent.children = parent.children || [];
                parent.children.push(completeProfileCall);
                if (parent.selfTime) {
                    parent.selfTime = Types.Timing.MicroSeconds(parent.selfTime - dur);
                }
            }
        }
    }
}
export function reset() {
    events.clear();
    preprocessedData.clear();
    profilesInProcess.clear();
    handlerState = 1 /* HandlerState.UNINITIALIZED */;
}
export function initialize() {
    if (handlerState !== 1 /* HandlerState.UNINITIALIZED */) {
        throw new Error('Samples Handler was not reset');
    }
    handlerState = 2 /* HandlerState.INITIALIZED */;
}
export function handleEvent(event) {
    if (handlerState !== 2 /* HandlerState.INITIALIZED */) {
        throw new Error('Samples Handler is not initialized');
    }
    if (Types.TraceEvents.isTraceEventProfile(event)) {
        // Do not use event.args.data.startTime as it is in CLOCK_MONOTONIC domain,
        // but use profileEvent.ts which has been translated to Perfetto's clock
        // domain. Also convert from ms to us.
        // Note: events are collected on a different thread than what's sampled.
        // The correct process and thread ids are specified by the profile.
        const profileData = getOrCreatePreProcessedData(event.pid, event.id);
        profileData.rawProfile.startTime = event.ts;
        profileData.threadId = event.tid;
        return;
    }
    if (Types.TraceEvents.isTraceEventProfileChunk(event)) {
        const profileData = getOrCreatePreProcessedData(event.pid, event.id);
        const cdpProfile = profileData.rawProfile;
        const nodesAndSamples = event.args?.data?.cpuProfile || { samples: [] };
        const samples = nodesAndSamples?.samples || [];
        const nodes = [];
        for (const n of nodesAndSamples?.nodes || []) {
            const lineNumber = typeof n.callFrame.lineNumber === 'undefined' ? -1 : n.callFrame.lineNumber;
            const columnNumber = typeof n.callFrame.columnNumber === 'undefined' ? -1 : n.callFrame.columnNumber;
            const scriptId = String(n.callFrame.scriptId);
            const url = n.callFrame.url || '';
            const node = {
                ...n,
                callFrame: {
                    ...n.callFrame,
                    url,
                    lineNumber,
                    columnNumber,
                    scriptId,
                },
            };
            nodes.push(node);
        }
        const timeDeltas = event.args.data?.timeDeltas || [];
        const lines = event.args.data?.lines || Array(samples.length).fill(0);
        cdpProfile.nodes.push(...nodes);
        cdpProfile.samples?.push(...samples);
        cdpProfile.timeDeltas?.push(...timeDeltas);
        cdpProfile.lines?.push(...lines);
        if (cdpProfile.samples && cdpProfile.timeDeltas && cdpProfile.samples.length !== cdpProfile.timeDeltas.length) {
            console.error('Failed to parse CPU profile.');
            return;
        }
        if (!cdpProfile.endTime && cdpProfile.timeDeltas) {
            const timeDeltas = cdpProfile.timeDeltas;
            cdpProfile.endTime = timeDeltas.reduce((x, y) => x + y, cdpProfile.startTime);
        }
        return;
    }
}
export async function finalize() {
    if (handlerState !== 2 /* HandlerState.INITIALIZED */) {
        throw new Error('Samples Handler is not initialized');
    }
    buildProfileCalls();
    handlerState = 3 /* HandlerState.FINALIZED */;
}
export function data() {
    if (handlerState !== 3 /* HandlerState.FINALIZED */) {
        throw new Error('Samples Handler is not finalized');
    }
    return {
        profilesInProcess: new Map(profilesInProcess),
    };
}
function getOrCreatePreProcessedData(processId, profileId) {
    const profileById = Platform.MapUtilities.getWithDefault(preprocessedData, processId, () => new Map());
    return Platform.MapUtilities.getWithDefault(profileById, profileId, () => ({
        rawProfile: {
            startTime: 0,
            endTime: 0,
            nodes: [],
            samples: [],
            timeDeltas: [],
            lines: [],
        },
        profileId,
    }));
}
//# map=SamplesHandler.js.map