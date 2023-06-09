// Copyright (c) 2015 The Chromium Authors. All rights reserved.
// Use of this source code is governed by a BSD-style license that can be
// found in the LICENSE file.
import * as SDK from '../../core/sdk/sdk.js';
import { CategorizedBreakpointsSidebarPane } from './CategorizedBreakpointsSidebarPane.js';
let cspViolationBreakpointsSidebarPaneInstance;
export class CSPViolationBreakpointsSidebarPane extends CategorizedBreakpointsSidebarPane {
    constructor() {
        const breakpoints = SDK.DOMDebuggerModel.DOMDebuggerManager.instance().cspViolationBreakpoints();
        const categories = breakpoints.map(breakpoint => breakpoint.category());
        categories.sort();
        super(categories, breakpoints, 'sources.cspViolationBreakpoints', "CSPViolation" /* Protocol.Debugger.PausedEventReason.CSPViolation */);
    }
    static instance() {
        if (!cspViolationBreakpointsSidebarPaneInstance) {
            cspViolationBreakpointsSidebarPaneInstance = new CSPViolationBreakpointsSidebarPane();
        }
        return cspViolationBreakpointsSidebarPaneInstance;
    }
    getBreakpointFromPausedDetails(details) {
        const breakpointType = details.auxData && details.auxData['violationType'] ? details.auxData['violationType'] : '';
        const breakpoints = SDK.DOMDebuggerModel.DOMDebuggerManager.instance().cspViolationBreakpoints();
        const breakpoint = breakpoints.find(x => x.type() === breakpointType);
        return breakpoint ? breakpoint : null;
    }
    toggleBreakpoint(breakpoint, enabled) {
        breakpoint.setEnabled(enabled);
        SDK.DOMDebuggerModel.DOMDebuggerManager.instance().updateCSPViolationBreakpoints();
    }
}
//# map=CSPViolationBreakpointsSidebarPane.js.map