// Copyright 2023 The Chromium Authors. All rights reserved.
// Use of this source code is governed by a BSD-style license that can be
// found in the LICENSE file.
// IMPORTANT: this file is auto generated. Please do not edit this file.
/* istanbul ignore file */
const styles = new CSSStyleSheet();
styles.replaceSync(
`/*
 * Copyright 2023 The Chromium Authors. All rights reserved.
 * Use of this source code is governed by a BSD-style license that can be
 * found in the LICENSE file.
 */

* {
  padding: 0;
  margin: 0;
  box-sizing: border-box;
  font-size: inherit;
}

.wrapper {
  display: flex;
  flex-direction: row;
  flex: 1;
  height: 100%;
}

.main {
  overflow: hidden;
  display: flex;
  flex-direction: column;
  flex: 1;
}

.sections {
  flex: 1;
  min-height: 0;
  overflow: hidden auto;
  background-color: var(--color-background);
  z-index: 0;
  position: relative;
  container: sections / inline-size; /* stylelint-disable-line property-no-unknown */
}

.section {
  display: flex;
  padding: 0 16px;
  gap: 8px;
  position: relative;
}

.section::after {
  content: "";
  border-bottom: 1px solid var(--color-details-hairline);
  position: absolute;
  left: 0;
  right: 0;
  bottom: 0;
  z-index: -1;
}

.section:last-child {
  /* Make sure there is enough space for the context menu. */
  margin-bottom: 70px;
}

.section:last-child::after {
  content: none;
}

.screenshot-wrapper {
  flex: 0 0 80px;
  padding-top: 32px;
  z-index: 2; /* We want this to be on top of \\'.step-overlay\\' */
}

/* stylelint-disable-next-line at-rule-no-unknown */
@container sections (max-width: 400px) {
  .screenshot-wrapper {
    display: none;
  }
}

.screenshot {
  object-fit: cover;
  object-position: top center;
  max-width: 100%;
  width: 200px;
  height: auto;
  border: 1px solid var(--color-details-hairline);
  border-radius: 1px;
}

.content {
  flex: 1;
  min-width: 0;
}

.steps {
  flex: 1;
  position: relative;
  align-self: flex-start;
  overflow: visible;
}

.step {
  position: relative;
  padding-left: 40px;
  margin: 16px 0;
}

.step .action {
  font-size: 13px;
  line-height: 16px;
  letter-spacing: 0.03em;
}

.recording {
  color: var(--color-primary-old);
  font-style: italic;
  margin-top: 8px;
  margin-bottom: 0;
}

.add-assertion-button {
  margin-top: 8px;
}

.details {
  max-width: 240px;
  display: flex;
  flex-direction: column;
  align-items: flex-end;
}

.url {
  font-size: 12px;
  line-height: 16px;
  letter-spacing: 0.03em;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
  color: var(--color-text-secondary);
  max-width: 100%;
  margin-bottom: 16px;
}

.header {
  align-items: center;
  border-bottom: 1px solid var(--color-details-hairline);
  display: flex;
  flex-wrap: wrap;
  gap: 10px;
  justify-content: space-between;
  padding: 16px;
}

.header-title-wrapper {
  max-width: 100%;
}

.header-title {
  align-items: center;
  display: flex;
  flex: 1;
  max-width: 100%;
}

.header-title::before {
  content: "";
  min-width: 12px;
  height: 12px;
  display: inline-block;
  background: var(--color-primary-old);
  border-radius: 50%;
  margin-right: 7px;
}

#title-input {
  box-sizing: content-box;
  font-family: inherit;
  font-size: 18px;
  line-height: 22px;
  letter-spacing: 0.02em;
  padding: 1px 4px;
  border: 1px solid transparent;
  border-radius: 1px;
  word-break: break-all;
}

#title-input:hover {
  border-color: var(--input-outline);
}

#title-input.has-error {
  border-color: var(--color-input-outline-error);
}

#title-input.disabled {
  color: var(--color-input-text-disabled);
}

.title-input-error-text {
  margin-top: 4px;
  margin-left: 19px;
  color: var(--color-error-text);
}

.title-button-bar {
  padding-left: 2px;
  display: flex;
}

#title-input:focus + .title-button-bar {
  display: none;
}

.settings-row {
  padding: 16px 28px;
  border-bottom: 1px solid var(--color-details-hairline);
  display: flex;
  flex-flow: row wrap;
  justify-content: space-between;
}

.settings-title {
  font-size: 14px;
  line-height: 24px;
  letter-spacing: 0.03em;
  color: var(--color-text-primary);
  display: flex;
  align-items: center;
  align-content: center;
  gap: 5px;
}

.settings {
  margin-top: 4px;
  display: flex;
  font-size: 12px;
  line-height: 20px;
  letter-spacing: 0.03em;
  color: var(--color-text-secondary);
}

.settings.expanded {
  gap: 10px;
}

.settings .separator {
  width: 1px;
  height: 20px;
  background-color: var(--color-details-hairline);
  margin: 0 5px;
}

.actions {
  display: flex;
  align-items: center;
  flex-wrap: wrap;
  gap: 12px;
}

.is-recording .header-title::before {
  background: var(--color-red);
}

.footer {
  display: flex;
  justify-content: center;
  border-top: 1px solid var(--color-details-hairline);
  padding: 12px;
  background: var(--color-background);
  z-index: 1;
}

.controls {
  align-items: center;
  display: flex;
  justify-content: center;
  position: relative;
  width: 100%;
}

.chevron {
  width: 14px;
  height: 14px;
  transform: rotate(-90deg);
}

.expanded .chevron {
  transform: rotate(0);
}

.editable-setting {
  display: flex;
  flex-direction: row;
  gap: 12px;
  align-items: center;
}

.editable-setting devtools-select-menu {
  height: 32px;
}

.editable-setting .devtools-text-input {
  width: fit-content;
}

.wrapping-label {
  display: inline-flex;
  align-items: center;
  gap: 12px;
}

.text-editor {
  height: 100%;
  overflow: auto;
}

.section-toolbar {
  display: flex;
  padding: 3px;
  justify-content: space-between;
  gap: 3px;
}

.section-toolbar > devtools-select-menu {
  min-width: 50px;
}

.sections .section-toolbar {
  justify-content: flex-end;
}

.section-toolbar > * {
  height: 24px;
}

devtools-split-view {
  flex: 1 1 0%;
  min-height: 0;
}

[slot="sidebar"] {
  display: flex;
  flex-direction: column;
  overflow: auto;
  height: 100%;
  width: 100%;
}

[slot="sidebar"] .section-toolbar {
  border-bottom: 1px solid var(--color-details-hairline);
}

.show-code {
  margin-right: 14px;
  margin-top: 8px;
}

devtools-recorder-extension-view {
  flex: 1;
}


`);
export default styles;
