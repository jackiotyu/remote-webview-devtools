// Copyright 2023 The Chromium Authors. All rights reserved.
// Use of this source code is governed by a BSD-style license that can be
// found in the LICENSE file.
// IMPORTANT: this file is auto generated. Please do not edit this file.
/* istanbul ignore file */
const styles = new CSSStyleSheet();
styles.replaceSync(
`/*
 * Copyright 2021 The Chromium Authors. All rights reserved.
 * Use of this source code is governed by a BSD-style license that can be
 * found in the LICENSE file.
 */

:host {
  text-overflow: ellipsis;
  overflow: hidden;
  flex-grow: 1;
}

.computed-style-trace {
  margin-left: 16px;
  font-family: var(--monospace-font-family);
  font-size: var(--monospace-font-size);
}

.computed-style-trace:hover {
  background-color: var(--legacy-focus-bg-color);
  cursor: text;
}

.goto {
  /* TODO: reuse with ComputedStyleProperty */
  --size: 16px;

  display: none;
  cursor: pointer;
  position: absolute;
  width: var(--size);
  height: var(--size);
  margin: -1px 0 0 calc(-1 * var(--size));
  -webkit-mask-image: var(--image-file-mediumIcons);
  -webkit-mask-position: -32px 48px;
  background-color: var(--legacy-active-control-bg-color);
}

.computed-style-trace:hover .goto {
  display: inline-block;
}

.devtools-link {
  --override-text-decoration-color: hsl(0deg 0% 60%);

  color: var(--color-text-primary);
  text-decoration-color: var(--override-text-decoration-color);
  text-decoration-line: underline;
  cursor: pointer;
}

.trace-value {
  margin-left: 16px;
}

.computed-style-trace.inactive slot[name="trace-value"] {
  text-decoration: line-through;
}

.trace-selector {
  --override-trace-selector-color: rgb(128 128 128);

  color: var(--override-trace-selector-color);
  padding-left: 2em;
}

.trace-link {
  user-select: none;
  float: right;
  padding-left: 1em;
  position: relative;
  z-index: 1;
}
/* high-contrast styles */
@media (forced-colors: active) {
  .computed-style-trace:hover {
    forced-color-adjust: none;
    background-color: Highlight;
  }

  .goto {
    background-color: Highlight;
  }

  .computed-style-trace:hover * {
    color: HighlightText;
  }

  .computed-style-trace:hover .trace-selector {
    --override-trace-selector-color: HighlightText;
  }
}


`);
export default styles;
