import { Position } from '@vue-flow/core';
import { StaticNodeType } from '../common/types.ts';

/**
 * You can pass elements together as a v-model value
 * or split them up into nodes and edges and pass them to the `nodes` and `edges` props of Vue Flow (or useVueFlow composable)
 */

export { StaticNodeType };

export const StaticNodeTypeSet = new Set<`${StaticNodeType}`>(Object.values(StaticNodeType));

export const initialElements = [
    {
        id: StaticNodeType.webviewEvent,
        uid: StaticNodeType.webviewEvent,
        type: 'input',
        label: 'webview事件',
        position: { x: 250, y: 0 },
        class: 'light',
        sourcePosition: Position.Right,
        targetPosition: Position.Left,
        style: { background: '#DDDDDD' },
    },
    {
        id: StaticNodeType.devtoolsInput,
        uid: StaticNodeType.devtoolsInput,
        type: 'output',
        label: 'devtools接收',
        position: { x: 750, y: 0 },
        class: 'light',
        sourcePosition: Position.Right,
        targetPosition: Position.Left,
        style: { background: '#DDDDDD' },
    },
    {
        id: StaticNodeType.devtoolsEvent,
        uid: StaticNodeType.devtoolsEvent,
        type: 'input',
        label: 'devtools事件',
        position: { x: 250, y: 200 },
        class: 'light',
        sourcePosition: Position.Right,
        targetPosition: Position.Left,
        style: { background: '#DDDDDD' },
    },
    {
        id: StaticNodeType.webviewInput,
        uid: StaticNodeType.webviewInput,
        type: 'output',
        label: 'webview接收',
        position: { x: 750, y: 200 },
        class: 'light',
        sourcePosition: Position.Right,
        targetPosition: Position.Left,
        style: { background: '#DDDDDD' },
    },
];
