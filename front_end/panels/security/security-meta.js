// Copyright 2020 The Chromium Authors. All rights reserved.
// Use of this source code is governed by a BSD-style license that can be
// found in the LICENSE file.
import * as i18n from '../../core/i18n/i18n.js';
import * as UI from '../../ui/legacy/legacy.js';
const UIStrings = {
    /**
     *@description Title of the security panel
     */
    security: 'Security',
    /**
     *@description Command to open the security panel
     */
    showSecurity: 'Show Security',
};
const str_ = i18n.i18n.registerUIStrings('panels/security/security-meta.ts', UIStrings);
const i18nLazyString = i18n.i18n.getLazilyComputedLocalizedString.bind(undefined, str_);
let loadedSecurityModule;
async function loadSecurityModule() {
    if (!loadedSecurityModule) {
        loadedSecurityModule = await import('./security.js');
    }
    return loadedSecurityModule;
}
UI.ViewManager.registerViewExtension({
    location: "panel" /* UI.ViewManager.ViewLocationValues.PANEL */,
    id: 'security',
    title: i18nLazyString(UIStrings.security),
    commandPrompt: i18nLazyString(UIStrings.showSecurity),
    order: 80,
    persistence: "closeable" /* UI.ViewManager.ViewPersistence.CLOSEABLE */,
    async loadView() {
        const Security = await loadSecurityModule();
        return Security.SecurityPanel.SecurityPanel.instance();
    },
});
//# map=security-meta.js.map