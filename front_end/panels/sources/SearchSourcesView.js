// Copyright 2018 The Chromium Authors. All rights reserved.
// Use of this source code is governed by a BSD-style license that can be
// found in the LICENSE file.
import * as Common from '../../core/common/common.js';
import * as UI from '../../ui/legacy/legacy.js';
import * as Search from '../search/search.js';
import { SourcesSearchScope } from './SourcesSearchScope.js';
let searchSourcesViewInstance;
export class SearchSourcesView extends Search.SearchView.SearchView {
    constructor() {
        super('sources', new Common.Throttler.Throttler(/* timeoutMs */ 200));
    }
    static instance() {
        if (!searchSourcesViewInstance) {
            searchSourcesViewInstance = new SearchSourcesView();
        }
        return searchSourcesViewInstance;
    }
    static async openSearch(query, searchImmediately) {
        const view = UI.ViewManager.ViewManager.instance().view('sources.search-sources-tab');
        // Deliberately use target location name so that it could be changed
        // based on the setting later.
        // TODO(crbug.com/1172300) Ignored during the jsdoc to ts migration)
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        const location = await UI.ViewManager.ViewManager.instance().resolveLocation('drawer-view');
        location.appendView(view);
        await UI.ViewManager.ViewManager.instance().revealView(view);
        const widget = await view.widget();
        void widget.toggle(query, Boolean(searchImmediately));
        return widget;
    }
    createScope() {
        return new SourcesSearchScope();
    }
}
let actionDelegateInstance;
export class ActionDelegate {
    static instance(opts = { forceNew: null }) {
        const { forceNew } = opts;
        if (!actionDelegateInstance || forceNew) {
            actionDelegateInstance = new ActionDelegate();
        }
        return actionDelegateInstance;
    }
    handleAction(_context, _actionId) {
        void this.showSearch();
        return true;
    }
    showSearch() {
        const selection = UI.InspectorView.InspectorView.instance().element.window().getSelection();
        let queryCandidate = '';
        if (selection && selection.rangeCount) {
            queryCandidate = selection.toString().replace(/\r?\n.*/, '');
        }
        return SearchSourcesView.openSearch(queryCandidate);
    }
}
//# map=SearchSourcesView.js.map