// Copyright 2023 The Chromium Authors. All rights reserved.
// Use of this source code is governed by a BSD-style license that can be
// found in the LICENSE file.
import * as Animations from './AnimationHandler.js';
import * as GPU from './GPUHandler.js';
import * as LayoutShifts from './LayoutShiftsHandler.js';
import * as Memory from './MemoryHandler.js';
import * as NetworkRequests from './NetworkRequestsHandler.js';
import * as PageLoadMetrics from './PageLoadMetricsHandler.js';
import * as Screenshots from './ScreenshotsHandler.js';
import * as UserInteractions from './UserInteractionsHandler.js';
import * as UserTimings from './UserTimingsHandler.js';
import * as Warnings from './WarningsHandler.js';
import * as Workers from './WorkersHandler.js';
// As we migrate the data engine we are incrementally enabling the new handlers
// one by one, so we do not waste effort parsing data that we do not use. This
// object should be updated when we add a new handler to enable it.
export const ENABLED_TRACE_HANDLERS = {
    Animations,
    UserTimings,
    PageLoadMetrics,
    UserInteractions,
    LayoutShifts,
    Screenshots,
    GPU,
    Memory,
    NetworkRequests,
    Warnings,
    Workers,
};
//# map=Migration.js.map