// Copyright 2023 The Chromium Authors. All rights reserved.
// Use of this source code is governed by a BSD-style license that can be
// found in the LICENSE file.
export function flattenBreadcrumbs(initialBreadcrumb) {
    const allBreadcrumbs = [initialBreadcrumb];
    let breadcrumbsIter = initialBreadcrumb;
    while (breadcrumbsIter.child !== null) {
        const iterChild = breadcrumbsIter.child;
        if (iterChild !== null) {
            allBreadcrumbs.push(iterChild);
            breadcrumbsIter = iterChild;
        }
    }
    return allBreadcrumbs;
}
export class Breadcrumbs {
    initialBreadcrumb;
    #lastBreadcrumb;
    constructor(initialTraceWindow) {
        this.initialBreadcrumb = {
            window: initialTraceWindow,
            child: null,
        };
        this.#lastBreadcrumb = this.initialBreadcrumb;
    }
    add(newBreadcrumbTraceWindow) {
        if (this.isTraceWindowWithinTraceWindow(newBreadcrumbTraceWindow, this.#lastBreadcrumb.window)) {
            const newBreadcrumb = {
                window: newBreadcrumbTraceWindow,
                child: null,
            };
            this.#lastBreadcrumb.child = newBreadcrumb;
            this.#lastBreadcrumb = newBreadcrumb;
        }
        else {
            throw new Error('Can not add a breadcrumb that is equal to or is outside of the parent breadcrumb TimeWindow');
        }
    }
    // Breadcumb should be within the bounds of the parent and can not have both start and end be equal to the parent
    isTraceWindowWithinTraceWindow(child, parent) {
        return (child.min >= parent.min && child.max <= parent.max) &&
            !(child.min === parent.min && child.max === parent.max);
    }
    // Make breadcrumb active by removing all of its children and making it the last breadcrumb
    makeBreadcrumbActive(newLastBreadcrumb) {
        let breadcrumbsIter = this.initialBreadcrumb;
        while (breadcrumbsIter !== newLastBreadcrumb && breadcrumbsIter.child !== null) {
            breadcrumbsIter = breadcrumbsIter.child;
        }
        breadcrumbsIter.child = null;
        this.#lastBreadcrumb = breadcrumbsIter;
    }
}
//# map=Breadcrumbs.js.map