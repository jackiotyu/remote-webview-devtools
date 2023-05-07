import { Connection } from '@vue-flow/core'

// import { StaticNodeType, NormalNodeType } from '../common/types';

// const InputNodeSet = new Set<string>([
//     StaticNodeType.devtoolsInput,
//     StaticNodeType.webviewInput,
//     NormalNodeType.console
// ]);
// const OutputNodeSet = new Set<string>([
//     StaticNodeType.devtoolsEvent,
//     StaticNodeType.webviewEvent,
//     NormalNodeType.cdp
// ]);


export function checkInvalidConnect(connect: Connection) {
    if(
        /\_handle\-left/.test(connect.sourceHandle || '')
        || /\_handle\-right/.test(connect.targetHandle || '')
    ) {
        return true;
    }
    return false;
}