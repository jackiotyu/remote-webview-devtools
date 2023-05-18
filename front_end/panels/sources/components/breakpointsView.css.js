// Copyright 2023 The Chromium Authors. All rights reserved.
// Use of this source code is governed by a BSD-style license that can be
// found in the LICENSE file.
// IMPORTANT: this file is auto generated. Please do not edit this file.
/* istanbul ignore file */
const styles = new CSSStyleSheet();
styles.replaceSync(
`/*
 * Copyright 2022 The Chromium Authors. All rights reserved.
 * Use of this source code is governed by a BSD-style license that can be
 * found in the LICENSE file.
 */

:host {
  flex: auto;
  display: flex;
  flex-direction: column;
}

.code-snippet {
  width: 100%;
  font-family: var(--source-code-font-family);
  font-size: var(--source-code-font-size);
  color: var(--color-text-secondary);
  text-overflow: ellipsis;
  overflow: hidden;
  white-space: nowrap;
  flex-shrink: 100;
  cursor: pointer;
}

.code-snippet:hover {
  color: var(--color-text-primary);
  text-decoration: underline;
}

input {
  height: 12px;
  width: 12px;
  flex-shrink: 0;
  margin: 3px 0;
}

details {
  border-top: 1px solid var(--color-details-hairline);
}

details:not(.active) {
  background-color: var(--color-background-elevation-1);
  opacity: 30%;
}

details > summary {
  height: 18px;
  list-style: none;
  display: flex;
  padding: 0 8px 0 6px;
  align-items: center;
}

details > summary:hover {
  background-color: var(--color-background-elevation-1);
}

details > summary::before {
  display: block;
  user-select: none;
  -webkit-mask-image: var(--image-file-triangle-right);
  background-color: var(--icon-default);
  content: "";
  height: 14px;
  min-width: 14px;
  max-width: 14px;
  margin-left: -4px;
  overflow: hidden;
  transition: transform 200ms;
}

details[open] > summary::before {
  transform: rotate(90deg);
}

.group-header {
  display: inline-flex;
  align-items: center;
  width: 100%;
  padding-right: 8px;
  overflow: hidden;
}

.group-icon-or-disable {
  justify-content: center;
  display: flex;
  width: 16px;
  margin-left: 2px;
}

.group-header-title {
  margin-left: 4px;
  font-weight: 500;
  font-size: var(--source-code-font-size);
  text-overflow: ellipsis;
  overflow: hidden;
  white-space: nowrap;
}

.group-header-differentiator {
  font-weight: normal;
  color: var(--color-text-disabled);
  margin-left: 8px;
}

.group-hover-actions {
  display: flex;
  align-items: center;
  justify-content: right;
  font-size: 10px;
  font-weight: 500;
}

.breakpoint-item-location-or-actions {
  min-width: 20px;
  flex: 0 0 auto;
  display: flex;
  padding-left: 8px;
  justify-content: right;
}

button {
  cursor: pointer;
  width: 13px;
  height: 13px;
  border: none;
  background-color: transparent;
  display: none;
  align-items: center;
  justify-content: center;
}

button + span {
  padding-left: 6px;
}

button + button {
  padding-left: 11px;
}

summary:hover button {
  display: flex;
}

button:hover devtools-icon {
  --icon-color: var(--icon-default-hover);
}

.type-indicator {
  --override-color-conditional-breakpoint: #f29900;
  --override-color-logpoint: #f439a0;

  border-right: 4px solid;
  border-radius: 0 2px 2px 0;
  border-color: transparent;
  height: 16px;
}

.breakpoint-item {
  display: flex;
  align-items: center;
  line-height: 13px;
  height: 20px;
  padding-right: 8px;
}

.breakpoint-item:hover {
  background-color: var(--color-background-elevation-1);
}

.breakpoint-item.hit {
  --override-breakpoint-hit-background: rgb(255 255 194);

  background-color: var(--override-breakpoint-hit-background);
}

.breakpoint-item.hit:focus {
  background-color: var(--legacy-focus-bg-color);
}

:host-context(.-theme-with-dark-background) .breakpoint-item.hit {
  background-color: hsl(46deg 98% 22%);
  color: var(--color-text-primary);
}

.-theme-with-dark-background .type-indicator,
:host-context(.-theme-with-dark-background) .type-indicator {
  --override-color-conditional-breakpoint: #e9a33a;
  --override-color-logpoint: #e54d9b;
}

.breakpoint-item.logpoint > label > .type-indicator {
  border-color: var(--override-color-logpoint);
}

.breakpoint-item.conditional-breakpoint > label > .type-indicator {
  border-color: var(--override-color-conditional-breakpoint);
}

.checkbox-label {
  display: flex;
  align-items: center;
}

.checkbox-label > input {
  margin-left: 16px;
  margin-right: 6px;
}

summary:hover .file-icon {
  display: none;
}

.group-checkbox {
  margin: 0;
  display: none;
}

summary:hover .group-checkbox {
  display: flex;
}

.location {
  line-height: 14px;
  text-overflow: ellipsis;
  overflow: hidden;
}

.breakpoint-item:hover button {
  display: flex;
}

.pause-on-uncaught-exceptions {
  margin-top: 3px;
}

.pause-on-caught-exceptions {
  margin-bottom: 3px;
}

/* TODO(crbug.com/1382762): Remove special casing with dependent toggles as soon as Node LTS caught up on independent pause of exception toggles. */
input:disabled + span {
  color: var(--color-text-disabled);
}

.pause-on-caught-exceptions > .checkbox-label > input,
.pause-on-uncaught-exceptions > .checkbox-label > input {
  margin-left: 6px;
}

.pause-on-caught-exceptions > .checkbox-label > span,
.pause-on-uncaught-exceptions > .checkbox-label > span {
  text-overflow: ellipsis;
  overflow: hidden;
  white-space: nowrap;
}

.pause-on-uncaught-exceptions,
.pause-on-caught-exceptions {
  line-height: 13px;
  height: 18px;
  padding-right: 8px;
}

details > summary:focus,
.breakpoint-item:focus,
.pause-on-uncaught-exceptions:focus,
.pause-on-caught-exceptions:focus {
  background-color: var(--legacy-focus-bg-color);
  outline-width: 0;
}


`);
export default styles;
