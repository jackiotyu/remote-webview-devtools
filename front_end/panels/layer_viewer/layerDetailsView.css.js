// Copyright 2023 The Chromium Authors. All rights reserved.
// Use of this source code is governed by a BSD-style license that can be
// found in the LICENSE file.
// IMPORTANT: this file is auto generated. Please do not edit this file.
/* istanbul ignore file */
const styles = new CSSStyleSheet();
styles.replaceSync(
`/*
 * Copyright 2016 The Chromium Authors. All rights reserved.
 * Use of this source code is governed by a BSD-style license that can be
 * found in the LICENSE file.
 */

table td {
  padding-left: 8px;
}

table td:first-child {
  font-weight: bold;
}

.scroll-rect.active {
  --override-active-rect-color: rgb(100 100 100 / 20%);

  background-color: var(--override-active-rect-color);
}

.-theme-with-dark-background .scroll-rect.active,
:host-context(.-theme-with-dark-background) .scroll-rect.active {
  --override-active-rect-color: rgb(155 155 155 / 20%);
}

ul {
  list-style: none;
  padding-inline-start: 0;
  margin-block-start: 0;
  margin-block-end: 0;
}

.devtools-link.link-margin {
  margin: 8px;
  display: inline-block;
}


`);
export default styles;
