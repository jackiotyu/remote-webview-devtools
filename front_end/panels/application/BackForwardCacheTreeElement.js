// Copyright 2020 The Chromium Authors. All rights reserved.
// Use of this source code is governed by a BSD-style license that can be
// found in the LICENSE file.
import * as i18n from '../../core/i18n/i18n.js';
import * as UI from '../../ui/legacy/legacy.js';
import * as LegacyWrapper from '../../ui/components/legacy_wrapper/legacy_wrapper.js';
import * as ApplicationComponents from './components/components.js';
import * as Host from '../../core/host/host.js';
import { ApplicationPanelTreeElement } from './ApplicationPanelTreeElement.js';
const UIStrings = {
    /**
     *@description Text in Application Panel Sidebar of the Application panel
     */
    backForwardCache: 'Back/forward cache',
};
const str_ = i18n.i18n.registerUIStrings('panels/application/BackForwardCacheTreeElement.ts', UIStrings);
const i18nString = i18n.i18n.getLocalizedString.bind(undefined, str_);
export class BackForwardCacheTreeElement extends ApplicationPanelTreeElement {
    view;
    constructor(resourcesPanel) {
        super(resourcesPanel, i18nString(UIStrings.backForwardCache), false);
        const icon = UI.Icon.Icon.create('database', 'resource-tree-item');
        this.setLeadingIcons([icon]);
    }
    get itemURL() {
        return 'bfcache://';
    }
    onselect(selectedByUser) {
        super.onselect(selectedByUser);
        if (!this.view) {
            this.view = LegacyWrapper.LegacyWrapper.legacyWrapper(UI.Widget.Widget, new ApplicationComponents.BackForwardCacheView.BackForwardCacheView());
        }
        this.showView(this.view);
        Host.userMetrics.panelShown(Host.UserMetrics.PanelCodes[Host.UserMetrics.PanelCodes.back_forward_cache]);
        return false;
    }
}
//# map=BackForwardCacheTreeElement.js.map