// Copyright 2022 The Chromium Authors. All rights reserved.
// Use of this source code is governed by a BSD-style license that can be
// found in the LICENSE file.
import * as ChromeLink from '../../../ui/components/chrome_link/chrome_link.js';
import * as i18n from '../../../core/i18n/i18n.js';
import * as UI from '../../../ui/legacy/legacy.js';
import * as SDK from '../../../core/sdk/sdk.js';
import * as PreloadingComponents from './components/components.js';
// eslint-disable-next-line rulesdir/es_modules_import
import emptyWidgetStyles from '../../../ui/legacy/emptyWidget.css.js';
import preloadingViewStyles from './preloadingView.css.js';
const UIStrings = {
    /**
     *@description Text in grid: Rule set is valid
     */
    validityValid: 'Valid',
    /**
     *@description Text in grid: Rule set must be a valid JSON object
     */
    validityInvalid: 'Invalid',
    /**
     *@description Text in grid: Rule set contains invalid rules and they are ignored
     */
    validitySomeRulesInvalid: 'Some rules invalid',
    /**
     *@description Text in grid and details: Preloading attempt is not yet triggered.
     */
    statusNotTriggered: 'Not triggered',
    /**
     *@description Text in grid and details: Preloading attempt is eligible but pending.
     */
    statusPending: 'Pending',
    /**
     *@description Text in grid and details: Preloading is running.
     */
    statusRunning: 'Running',
    /**
     *@description Text in grid and details: Preloading finished and the result is ready for the next navigation.
     */
    statusReady: 'Ready',
    /**
     *@description Text in grid and details: Ready, then used.
     */
    statusSuccess: 'Success',
    /**
     *@description Text in grid and details: Preloading failed.
     */
    statusFailure: 'Failure',
    /**
     *@description Title in infobar
     */
    warningTitlePreloadingDisabledByFeatureFlag: 'Preloading was disabled, but is force-enabled now',
    /**
     *@description Detail in infobar
     */
    warningDetailPreloadingDisabledByFeatureFlag: 'Preloading is forced-enabled because DevTools is open. When DevTools is closed, prerendering will be disabled because this browser session is part of a holdback group used for performance comparisons.',
    /**
     *@description Title in infobar
     */
    warningTitlePrerenderingDisabledByFeatureFlag: 'Prerendering was disabled, but is force-enabled now',
    /**
     *@description Detail in infobar
     */
    warningDetailPrerenderingDisabledByFeatureFlag: 'Prerendering is forced-enabled because DevTools is open. When DevTools is closed, prerendering will be disabled because this browser session is part of a holdback group used for performance comparisons.',
    /**
     *@description Title of preloading state disabled warning in infobar
     */
    warningTitlePreloadingStateDisabled: 'Preloading is disabled',
    /**
     *@description Detail of preloading state disabled warning in infobar
     *@example {chrome://settings/preloading} PH1
     *@example {chrome://extensions} PH2
     */
    warningDetailPreloadingStateDisabled: 'Preloading is disabled because of user settings or an extension. Go to {PH1} to learn more, or go to {PH2} to disable the extension.',
    /**
     *@description Title in infobar when preloading is disabled by data saver.
     */
    warningTitlePreloadingDisabledByDatasaver: 'Preloading is disabled',
    /**
     *@description Detail in infobar when preloading is disabled by data saver.
     */
    warningDetailPreloadingDisabledByDatasaver: 'Preloading is disabled because of the operating system\'s Data Saver mode.',
    /**
     *@description Title in infobar when preloading is disabled by battery saver.
     */
    warningTitlePreloadingDisabledByBatterysaver: 'Preloading is disabled',
    /**
     *@description Detail in infobar when preloading is disabled by data saver.
     */
    warningDetailPreloadingDisabledByBatterysaver: 'Preloading is disabled because of the operating system\'s Battery Saver mode.',
    /**
     *@description Text of Preload pages settings
     */
    preloadingPageSettings: 'Preload pages settings',
    /**
     *@description Text of Extension settings
     */
    extensionSettings: 'Extensions settings',
};
const str_ = i18n.i18n.registerUIStrings('panels/application/preloading/PreloadingView.ts', UIStrings);
const i18nString = i18n.i18n.getLocalizedString.bind(undefined, str_);
class PreloadingUIUtils {
    static action({ key }) {
        // Use "prefetch"/"prerender" as is in SpeculationRules.
        switch (key.action) {
            case "Prefetch" /* Protocol.Preload.SpeculationAction.Prefetch */:
                return i18n.i18n.lockedString('prefetch');
            case "Prerender" /* Protocol.Preload.SpeculationAction.Prerender */:
                return i18n.i18n.lockedString('prerender');
        }
    }
    static status({ status }) {
        // See content/public/browser/preloading.h PreloadingAttemptOutcome.
        switch (status) {
            case "NotTriggered" /* SDK.PreloadingModel.PreloadingStatus.NotTriggered */:
                return i18nString(UIStrings.statusNotTriggered);
            case "Pending" /* SDK.PreloadingModel.PreloadingStatus.Pending */:
                return i18nString(UIStrings.statusPending);
            case "Running" /* SDK.PreloadingModel.PreloadingStatus.Running */:
                return i18nString(UIStrings.statusRunning);
            case "Ready" /* SDK.PreloadingModel.PreloadingStatus.Ready */:
                return i18nString(UIStrings.statusReady);
            case "Success" /* SDK.PreloadingModel.PreloadingStatus.Success */:
                return i18nString(UIStrings.statusSuccess);
            case "Failure" /* SDK.PreloadingModel.PreloadingStatus.Failure */:
                return i18nString(UIStrings.statusFailure);
            // NotSupported is used to handle unreachable case. For example,
            // there is no code path for
            // PreloadingTriggeringOutcome::kTriggeredButPending in prefetch,
            // which is mapped to NotSupported. So, we regard it as an
            // internal error.
            case "NotSupported" /* SDK.PreloadingModel.PreloadingStatus.NotSupported */:
                return i18n.i18n.lockedString('Internal error');
        }
    }
    // Summary of error of rule set shown in grid.
    static validity({ errorType }) {
        switch (errorType) {
            case undefined:
                return i18nString(UIStrings.validityValid);
            case "SourceIsNotJsonObject" /* Protocol.Preload.RuleSetErrorType.SourceIsNotJsonObject */:
                return i18nString(UIStrings.validityInvalid);
            case "InvalidRulesSkipped" /* Protocol.Preload.RuleSetErrorType.InvalidRulesSkipped */:
                return i18nString(UIStrings.validitySomeRulesInvalid);
        }
    }
    // Where a rule set came from, shown in grid.
    static location(ruleSet) {
        if (ruleSet.backendNodeId !== undefined) {
            return i18n.i18n.lockedString('<script>');
        }
        if (ruleSet.url !== undefined) {
            return ruleSet.url;
        }
        throw Error('unreachable');
    }
}
// Holds PreloadingModel of current context
//
// There can be multiple Targets and PreloadingModels and they switch as
// time goes. For example:
//
// - Prerendering started and a user switched context with
//   ExecutionContextSelector. This switching is bidirectional.
// - Prerendered page is activated. This switching is unidirectional.
//
// Context switching is managed by scoped target. This class handles
// switching events and holds PreloadingModel of current context.
//
// Note that switching at the timing of activation triggers handing over
// from the old model to the new model. See
// PreloadingMoedl.onPrimaryPageChanged.
class PreloadingModelProxy {
    view;
    model;
    constructor(view, model) {
        this.view = view;
        this.model = model;
        this.model.addEventListener(SDK.PreloadingModel.Events.ModelUpdated, this.view.render, this.view);
    }
    initialize() {
        SDK.TargetManager.TargetManager.instance().observeModels(SDK.PreloadingModel.PreloadingModel, this, { scoped: true });
    }
    modelAdded(model) {
        // Ignore models/targets of non-outermost frames like iframe/FencedFrames.
        if (model.target().outermostTarget() !== model.target()) {
            return;
        }
        this.model.removeEventListener(SDK.PreloadingModel.Events.ModelUpdated, this.view.render, this.view);
        this.model = model;
        this.model.addEventListener(SDK.PreloadingModel.Events.ModelUpdated, this.view.render, this.view);
        this.view.render();
    }
    modelRemoved(_model) {
        this.model.removeEventListener(SDK.PreloadingModel.Events.ModelUpdated, this.view.render, this.view);
    }
}
export class PreloadingView extends UI.Widget.VBox {
    modelProxy;
    focusedRuleSetId = null;
    focusedPreloadingAttemptId = null;
    infobarContainer;
    hsplitUsedPreloading;
    hsplit;
    vsplitRuleSets;
    ruleSetGrid = new PreloadingComponents.RuleSetGrid.RuleSetGrid();
    ruleSetDetails = new PreloadingComponents.RuleSetDetailsReportView.RuleSetDetailsReportView();
    preloadingGrid = new PreloadingComponents.PreloadingGrid.PreloadingGrid();
    preloadingDetails = new PreloadingComponents.PreloadingDetailsReportView.PreloadingDetailsReportView();
    usedPreloading = new PreloadingComponents.UsedPreloadingView.UsedPreloadingView();
    featureFlagWarningsPromise;
    constructor(model) {
        super(/* isWebComponent */ true, /* delegatesFocus */ false);
        this.modelProxy = new PreloadingModelProxy(this, model);
        // this (VBox)
        //   +- infobarContainer
        //   +- hsplitUsedPreloading
        //        +- hsplit
        //             +- vsplitRuleSets
        //                  +- leftContainer
        //                       +- RuleSetGrid
        //                  +- rightContainer
        //                       +- RuleSetDetailsReportView
        //             +- vsplitPreloadingAttempts
        //                  +- leftContainer
        //                       +- PreloadingGrid
        //                  +- rightContainer
        //                       +- PreloadingDetailsReportView
        //        +- VBox
        //             + UsedPreloadingReportView
        //
        // - If an row of RuleSetGrid selected, RuleSetDetailsReportView shows details of it.
        // - If not, RuleSetDetailsReportView hides.
        //
        // - If an row of PreloadingGrid selected, PreloadingDetailsReportView shows details of it.
        // - If not, PreloadingDetailsReportView shows some messages.
        this.infobarContainer = document.createElement('div');
        this.infobarContainer.classList.add('flex-none');
        this.contentElement.insertBefore(this.infobarContainer, this.contentElement.firstChild);
        this.ruleSetGrid.addEventListener('cellfocused', this.onRuleSetsGridCellFocused.bind(this));
        this.vsplitRuleSets = this.makeVsplit(this.ruleSetGrid, this.ruleSetDetails);
        this.preloadingGrid.addEventListener('cellfocused', this.onPreloadingGridCellFocused.bind(this));
        const vsplitPreloadingAttempts = this.makeVsplit(this.preloadingGrid, this.preloadingDetails);
        this.hsplit = new UI.SplitWidget.SplitWidget(
        /* isVertical */ false,
        /* secondIsSidebar */ false,
        /* settingName */ undefined,
        /* defaultSidebarWidth */ undefined,
        /* defaultSidebarHeight */ 200,
        /* constraintsInDip */ undefined);
        this.hsplit.setSidebarWidget(this.vsplitRuleSets);
        this.hsplit.setMainWidget(vsplitPreloadingAttempts);
        const usedPreloadingContainer = new UI.Widget.VBox();
        usedPreloadingContainer.contentElement.appendChild(this.usedPreloading);
        this.hsplitUsedPreloading = new UI.SplitWidget.SplitWidget(
        /* isVertical */ false,
        /* secondIsSidebar */ true,
        /* settingName */ undefined,
        /* defaultSidebarWidth */ undefined,
        /* defaultSidebarHeight */ 50,
        /* constraintsInDip */ undefined);
        this.hsplitUsedPreloading.setMainWidget(this.hsplit);
        this.hsplitUsedPreloading.setSidebarWidget(usedPreloadingContainer);
        this.featureFlagWarningsPromise = this.getFeatureFlags().then(x => this.onGetFeatureFlags(x));
    }
    makeVsplit(left, right) {
        const leftContainer = new UI.Widget.VBox();
        leftContainer.setMinimumSize(0, 40);
        leftContainer.contentElement.classList.add('overflow-auto');
        leftContainer.contentElement.appendChild(left);
        const rightContainer = new UI.Widget.VBox();
        rightContainer.setMinimumSize(0, 80);
        rightContainer.contentElement.classList.add('overflow-auto');
        rightContainer.contentElement.appendChild(right);
        const vsplit = new UI.SplitWidget.SplitWidget(
        /* isVertical */ true,
        /* secondIsSidebar */ true,
        /* settingName */ undefined,
        /* defaultSidebarWidth */ 400,
        /* defaultSidebarHeight */ undefined,
        /* constraintsInDip */ undefined);
        vsplit.setMainWidget(leftContainer);
        vsplit.setSidebarWidget(rightContainer);
        return vsplit;
    }
    wasShown() {
        super.wasShown();
        this.registerCSSFiles([emptyWidgetStyles, preloadingViewStyles]);
        this.hsplitUsedPreloading.show(this.contentElement);
        // Lazily initialize PreloadingModelProxy because this triggers a chain
        //
        //    PreloadingModelProxy.initialize()
        // -> TargetManager.observeModels()
        // -> PreloadingModelProxy.modelAdded()
        // -> PreloadingView.render()
        //
        // , and PreloadingView.onModelAdded() requires all members are
        // initialized. So, here is the best timing.
        this.modelProxy.initialize();
    }
    // `cellfocused` events only emitted focus modified. So, we can't
    // catch the case focused cell is clicked. Currently, we need
    //
    // 1. Click a cell and focus.
    // 2. Click out of rows.
    // 3. Click the last cell.
    //
    // to hide the details.
    //
    // TODO(https://crbug.com/1384419): Consider to add `cellclicked` event.
    updateRuleSetDetails() {
        const id = this.focusedRuleSetId;
        const ruleSet = id === null ? null : this.modelProxy.model.getRuleSetById(id);
        this.ruleSetDetails.data = ruleSet;
        if (ruleSet === null) {
            this.vsplitRuleSets.hideSidebar();
        }
        else {
            this.vsplitRuleSets.showBoth();
        }
    }
    updatePreloadingDetails() {
        const id = this.focusedPreloadingAttemptId;
        const preloadingAttempt = id === null ? null : this.modelProxy.model.getPreloadingAttemptById(id);
        if (preloadingAttempt === null) {
            this.preloadingDetails.data = null;
        }
        else {
            const ruleSets = preloadingAttempt.ruleSetIds.map(id => this.modelProxy.model.getRuleSetById(id)).filter(x => x !== null);
            this.preloadingDetails.data = {
                preloadingAttempt,
                ruleSets,
            };
        }
        // TODO(crbug.com/1384419): Add more information in PreloadEnabledState from
        // backend to distinguish the details of the reasons why preloading is
        // disabled.
        switch (this.modelProxy.model.getPreloadEnabledState()) {
            case "DisabledByPreference" /* Protocol.Preload.PreloadEnabledState.DisabledByPreference */: {
                const preloadingSettingLink = new ChromeLink.ChromeLink.ChromeLink();
                preloadingSettingLink.href = 'chrome://settings/cookies';
                preloadingSettingLink.textContent = i18nString(UIStrings.preloadingPageSettings);
                const extensionSettingLink = new ChromeLink.ChromeLink.ChromeLink();
                extensionSettingLink.href = 'chrome://extensions';
                extensionSettingLink.textContent = i18nString(UIStrings.extensionSettings);
                const detailsMessage = i18n.i18n.getFormatLocalizedString(str_, UIStrings.warningDetailPreloadingStateDisabled, { PH1: preloadingSettingLink, PH2: extensionSettingLink });
                this.showInfobar(i18nString(UIStrings.warningTitlePreloadingStateDisabled), detailsMessage);
                break;
            }
            case "DisabledByDataSaver" /* Protocol.Preload.PreloadEnabledState.DisabledByDataSaver */: {
                this.showInfobar(i18nString(UIStrings.warningTitlePreloadingDisabledByDatasaver), i18nString(UIStrings.warningDetailPreloadingDisabledByDatasaver));
                break;
            }
            case "DisabledByBatterySaver" /* Protocol.Preload.PreloadEnabledState.DisabledByBatterySaver */: {
                this.showInfobar(i18nString(UIStrings.warningTitlePreloadingDisabledByBatterysaver), i18nString(UIStrings.warningDetailPreloadingDisabledByBatterysaver));
                break;
            }
            default:
                break;
        }
    }
    render() {
        // Update rule sets grid
        //
        // Currently, all rule sets that appear in DevTools are valid.
        // TODO(https://crbug.com/1384419): Add property `validity` to the CDP.
        const ruleSetRows = this.modelProxy.model.getAllRuleSets().map(({ id, value }) => ({
            id,
            validity: PreloadingUIUtils.validity(value),
            location: PreloadingUIUtils.location(value),
        }));
        this.ruleSetGrid.update(ruleSetRows);
        this.updateRuleSetDetails();
        // Update preloaidng grid
        const preloadingAttemptRows = this.modelProxy.model.getPreloadingAttempts(this.focusedRuleSetId)
            .map(({ id, value }) => ({
            id,
            action: PreloadingUIUtils.action(value),
            url: value.key.url,
            status: PreloadingUIUtils.status(value),
        }));
        this.preloadingGrid.update(preloadingAttemptRows);
        this.updatePreloadingDetails();
        this.usedPreloading.data = this.modelProxy.model.getPreloadingAttemptsOfPreviousPage().map(({ value }) => value);
    }
    onRuleSetsGridCellFocused(event) {
        const focusedEvent = event;
        const id = focusedEvent.data.row.cells.find(cell => cell.columnId === 'id')?.value;
        if (this.focusedRuleSetId === id) {
            // Toggle details
            this.focusedRuleSetId = null;
        }
        else {
            this.focusedRuleSetId = id;
        }
        this.render();
    }
    onPreloadingGridCellFocused(event) {
        const focusedEvent = event;
        this.focusedPreloadingAttemptId = focusedEvent.data.row.cells.find(cell => cell.columnId === 'id')?.value;
        this.render();
    }
    async getFeatureFlags() {
        const preloadingHoldbackPromise = this.modelProxy.model.target().systemInfo().invoke_getFeatureState({
            featureState: 'PreloadingHoldback',
        });
        const prerender2HoldbackPromise = this.modelProxy.model.target().systemInfo().invoke_getFeatureState({
            featureState: 'PrerenderHoldback',
        });
        return {
            preloadingHoldback: (await preloadingHoldbackPromise).featureEnabled ?? null,
            prerender2Holdback: (await prerender2HoldbackPromise).featureEnabled ?? null,
        };
    }
    // Shows warnings if features are disabled by feature flags.
    onGetFeatureFlags(flags) {
        if (flags.preloadingHoldback === true) {
            this.showInfobar(i18nString(UIStrings.warningTitlePreloadingDisabledByFeatureFlag), i18nString(UIStrings.warningDetailPreloadingDisabledByFeatureFlag));
        }
        if (flags.prerender2Holdback === true) {
            this.showInfobar(i18nString(UIStrings.warningTitlePrerenderingDisabledByFeatureFlag), i18nString(UIStrings.warningDetailPrerenderingDisabledByFeatureFlag));
        }
    }
    showInfobar(titleText, detailsMessage) {
        const infobar = new UI.Infobar.Infobar(UI.Infobar.Type.Warning, /* text */ titleText, /* actions? */ undefined, /* disableSetting? */ undefined);
        infobar.setParentView(this);
        infobar.createDetailsRowMessage(detailsMessage);
        this.infobarContainer.appendChild(infobar.element);
    }
    getInfobarContainerForTest() {
        return this.infobarContainer;
    }
    getRuleSetGridForTest() {
        return this.ruleSetGrid;
    }
    getRuleSetDetailsForTest() {
        return this.ruleSetDetails;
    }
    getPreloadingGridForTest() {
        return this.preloadingGrid;
    }
    getPreloadingDetailsForTest() {
        return this.preloadingDetails;
    }
    getUsedPreloadingForTest() {
        return this.usedPreloading;
    }
    getFeatureFlagWarningsPromiseForTest() {
        return this.featureFlagWarningsPromise;
    }
}
//# map=PreloadingView.js.map