// Copyright 2021 The Chromium Authors. All rights reserved.
// Use of this source code is governed by a BSD-style license that can be
// found in the LICENSE file.
export function toOffset(doc, { lineNumber, columnNumber }) {
    // DevTools history items are 0-based, but CodeMirror is 1-based, so we have to increment the
    // line we want to scroll to by 1.
    const line = doc.line(Math.max(1, Math.min(doc.lines, lineNumber + 1)));
    return Math.max(line.from, Math.min(line.to, line.from + columnNumber));
}
export function toLineColumn(doc, offset) {
    offset = Math.max(0, Math.min(offset, doc.length));
    const line = doc.lineAt(offset);
    return { lineNumber: line.number - 1, columnNumber: offset - line.from };
}
//# map=position.js.map