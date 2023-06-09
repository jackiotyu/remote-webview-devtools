// Copyright 2021 The Chromium Authors. All rights reserved.
// Use of this source code is governed by a BSD-style license that can be
// found in the LICENSE file.
class ValueChangedEvent extends Event {
    static eventName = 'valuechanged';
    data;
    constructor(value) {
        super(ValueChangedEvent.eventName, {});
        this.data = { value };
    }
}
export { ValueChangedEvent };
//# map=InlineEditorUtils.js.map