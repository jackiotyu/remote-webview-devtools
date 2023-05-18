// Copyright 2023 The Chromium Authors. All rights reserved.
// Use of this source code is governed by a BSD-style license that can be
// found in the LICENSE file.
import { DOMModel } from './DOMModel.js';
import { TargetManager } from './TargetManager.js';
import { CPUThrottlingManager } from './CPUThrottlingManager.js';
import { MultitargetNetworkManager } from './NetworkManager.js';
const domLookUpSingleNodeCache = new Map();
const domLookUpBatchNodesCache = new Map();
// eslint-disable-next-line @typescript-eslint/naming-convention
export function _TEST_clearCache() {
    domLookUpSingleNodeCache.clear();
    domLookUpBatchNodesCache.clear();
    layoutShiftSourcesCache.clear();
    normalizedLayoutShiftNodesCache.clear();
}
/**
 * Looks up the DOM Node on the page for the given BackendNodeId. Uses the
 * provided TraceParseData as the cache and will cache the result after the
 * first lookup.
 */
export async function domNodeForBackendNodeID(modelData, nodeId) {
    const fromCache = domLookUpSingleNodeCache.get(modelData)?.get(nodeId);
    if (fromCache !== undefined) {
        return fromCache;
    }
    const target = TargetManager.instance().primaryPageTarget();
    const domModel = target?.model(DOMModel);
    if (!domModel) {
        return null;
    }
    const domNodesMap = await domModel.pushNodesByBackendIdsToFrontend(new Set([nodeId]));
    const result = domNodesMap?.get(nodeId) || null;
    const cacheForModel = domLookUpSingleNodeCache.get(modelData) || new Map();
    cacheForModel.set(nodeId, result);
    domLookUpSingleNodeCache.set(modelData, cacheForModel);
    return result;
}
/**
 * Takes a set of Protocol.DOM.BackendNodeId ids and will return a map of NodeId=>DOMNode.
 * Results are cached based on 1) the provided TraceParseData and 2) the provided set of IDs.
 */
export async function domNodesForMultipleBackendNodeIds(modelData, nodeIds) {
    const fromCache = domLookUpBatchNodesCache.get(modelData)?.get(nodeIds);
    if (fromCache) {
        return fromCache;
    }
    const target = TargetManager.instance().primaryPageTarget();
    const domModel = target?.model(DOMModel);
    if (!domModel) {
        return new Map();
    }
    const domNodesMap = await domModel.pushNodesByBackendIdsToFrontend(nodeIds) || new Map();
    const cacheForModel = domLookUpBatchNodesCache.get(modelData) ||
        new Map();
    cacheForModel.set(nodeIds, domNodesMap);
    domLookUpBatchNodesCache.set(modelData, cacheForModel);
    return domNodesMap;
}
const layoutShiftSourcesCache = new Map();
const normalizedLayoutShiftNodesCache = new Map();
/**
 * Calculates and returns a list of sources for a LayoutShift.
 * Here, a source is considered as a node that moved and contributed to the
 * given LayoutShift existing and the score it was given. Each source returned
 * contains a reference to the DOM Node, and its dimensions (as a DOMRect), both
 * before and now, so we can see how this node changed and how that impacted the
 * layout shift.
 *
 * This data is cached based on the provided model data and the given layout
 * shift, so it is is safe to call multiple times with the same input.
 */
export async function sourcesForLayoutShift(modelData, event) {
    const fromCache = layoutShiftSourcesCache.get(modelData)?.get(event);
    if (fromCache) {
        return fromCache;
    }
    const impactedNodes = event.args.data?.impacted_nodes;
    if (!impactedNodes) {
        return [];
    }
    const sources = [];
    await Promise.all(impactedNodes.map(async (node) => {
        const domNode = await domNodeForBackendNodeID(modelData, node.node_id);
        if (domNode) {
            sources.push({
                previousRect: new DOMRect(node.old_rect[0], node.old_rect[1], node.old_rect[2], node.old_rect[3]),
                currentRect: new DOMRect(node.new_rect[0], node.new_rect[1], node.new_rect[2], node.new_rect[3]),
                node: domNode,
            });
        }
    }));
    const cacheForModel = layoutShiftSourcesCache.get(modelData) ||
        new Map();
    cacheForModel.set(event, sources);
    layoutShiftSourcesCache.set(modelData, cacheForModel);
    return sources;
}
/**
 * Takes a LayoutShift and normalizes its node dimensions based on the device
 * pixel ratio (DPR) of the user's display.
 * This is required because the Layout Instability API is not based on CSS
 * pixels, but physical pixels. Therefore we need to map these to normalized CSS
 * pixels if we can. For example, if the user is on a device with a DPR of 2,
 * the values of the node dimensions reported by the Instability API need to be
 * divided by 2 to be accurate.
 * This function is safe to call multiple times as results are cached based on
 * the provided model data.
 * See https://crbug.com/1300309 for details.
 */
export async function normalizedImpactedNodesForLayoutShift(modelData, event) {
    const fromCache = normalizedLayoutShiftNodesCache.get(modelData)?.get(event);
    if (fromCache) {
        return fromCache;
    }
    const impactedNodes = event.args?.data?.impacted_nodes;
    if (!impactedNodes) {
        return [];
    }
    let viewportScale = null;
    const target = TargetManager.instance().primaryPageTarget();
    // Get the CSS-to-physical pixel ratio of the device the inspected
    // target is running at.
    const evaluateResult = await target?.runtimeAgent().invoke_evaluate({ expression: 'window.devicePixelRatio' });
    if (evaluateResult?.result.type === 'number') {
        viewportScale = evaluateResult?.result.value ?? null;
    }
    if (!viewportScale) {
        // Bail and return the nodes as is.
        return impactedNodes;
    }
    const normalizedNodes = [];
    for (const impactedNode of impactedNodes) {
        const newNode = { ...impactedNode };
        for (let i = 0; i < impactedNode.old_rect.length; i++) {
            newNode.old_rect[i] /= viewportScale;
        }
        for (let i = 0; i < impactedNode.new_rect.length; i++) {
            newNode.new_rect[i] /= viewportScale;
        }
        normalizedNodes.push(newNode);
    }
    const cacheForModel = normalizedLayoutShiftNodesCache.get(modelData) ||
        new Map();
    cacheForModel.set(event, normalizedNodes);
    normalizedLayoutShiftNodesCache.set(modelData, cacheForModel);
    return normalizedNodes;
}
export async function getMetadataForFreshRecording(recordStartTime) {
    try {
        const cpuThrottlingManager = CPUThrottlingManager.instance();
        // If the CPU Throttling manager has yet to have its primary page target
        // set, it will block on the call to get the current hardware concurrency
        // until it does. At this point where the user has recorded a trace, that
        // target should have been set. So if it doesn't have it set, we instead
        // just bail and don't store the hardware concurrency (this is only
        // metadata, not mission critical information).
        // We also race this call against a 1s timeout, because sometimes this call
        // can hang (unsure exactly why) and we do not want to block parsing for
        // too long as a result.
        function getConcurrencyOrTimeout() {
            return Promise.race([
                CPUThrottlingManager.instance().getHardwareConcurrency(),
                new Promise(resolve => {
                    setTimeout(() => resolve(undefined), 1_000);
                }),
            ]);
        }
        const hardwareConcurrency = cpuThrottlingManager.hasPrimaryPageTargetSet() ? await getConcurrencyOrTimeout() : undefined;
        const cpuThrottling = CPUThrottlingManager.instance().cpuThrottlingRate();
        const networkConditions = MultitargetNetworkManager.instance().networkConditions();
        const networkTitle = typeof networkConditions.title === 'function' ? networkConditions.title() : networkConditions.title;
        return {
            source: 'DevTools',
            startTime: recordStartTime ? new Date(recordStartTime).toJSON() : undefined,
            cpuThrottling,
            networkThrottling: networkTitle,
            hardwareConcurrency,
        };
    }
    catch {
        // If anything went wrong, it does not really matter. The impact is that we
        // will not save the metadata when we save the trace to disk, but that is
        // not really important, so just return undefined and move on
        return undefined;
    }
}
//# map=TraceSDKServices.js.map