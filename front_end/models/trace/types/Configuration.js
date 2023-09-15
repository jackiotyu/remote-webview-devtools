// Copyright 2023 The Chromium Authors. All rights reserved.
// Use of this source code is governed by a BSD-style license that can be
// found in the LICENSE file.
export const DEFAULT = {
    settings: {},
    experiments: {
        timelineV8RuntimeCallStats: false,
        timelineShowAllEvents: false,
    },
    processing: {
        eventsPerChunk: 15_000,
        pauseDuration: 1,
    },
};
//# map=Configuration.js.map