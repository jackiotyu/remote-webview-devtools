// Copyright 2023 The Chromium Authors. All rights reserved.
// Use of this source code is governed by a BSD-style license that can be
// found in the LICENSE file.
// IMPORTANT: this file is auto generated. Please do not edit this file.
/* istanbul ignore file */
const styles = new CSSStyleSheet();
styles.replaceSync(
`/*
 * Copyright 2019 The Chromium Authors. All rights reserved.
 * Use of this source code is governed by a BSD-style license that can be
 * found in the LICENSE file.
 */

.media-attributes-view {
  border-bottom: 1px solid var(--color-details-hairline);
}

.media-property-renderer {
  line-height: 20px;
  min-height: 28px;
  padding: 4px 10px;
  display: block;
  overflow: hidden;
}

.media-property-renderer-hidden {
  display: none;
}

.media-property-renderer-title {
  font-size: 12px;
  float: left;
  width: 150px;
}

.media-property-renderer-title::first-letter {
  text-transform: uppercase;
}

.media-property-renderer-contents {
  position: relative;
  left: 200px;
}

.media-property-renderer-contents > .json-view {
  overflow: hidden;
  padding: 0;
}

.media-property-renderer:nth-child(even) {
  background: var(--color-background-elevation-0);
}

.media-property-renderer:hover {
  background: var(--color-background-hover-overlay);
}

.media-property-renderer:has(.json-view) {
  padding-bottom: 0;
}

.-theme-with-dark-background .media-property-renderer:nth-child(even) {
  background: rgb(41 41 41);
}

.media-property-renderer:has(.json-view > .expanded) {
  padding-bottom: 4px;
}

.media-properties-frame {
  display: block;
  overflow-x: hidden;
}


`);
export default styles;
