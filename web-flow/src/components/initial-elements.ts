import { Position } from '@vue-flow/core';
import { StaticNodeType } from '../common/types.ts';

/**
 * You can pass elements together as a v-model value
 * or split them up into nodes and edges and pass them to the `nodes` and `edges` props of Vue Flow (or useVueFlow composable)
 */

export { StaticNodeType }

export const StaticNodeTypeSet = new Set<`${StaticNodeType}`>(Object.values(StaticNodeType))

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
    },
    {
        id: '2',
        label: '中间件',
        position: { x: 500, y: 0 },
        class: 'light',
        sourcePosition: Position.Right,
        targetPosition: Position.Left,
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
    },
    {
        id: 'e1-2',
        source: StaticNodeType.webviewEvent,
        target: '2',
        style: { stroke: 'orange' },
        labelBgStyle: { fill: 'orange' },
        animated: true,
    },
    {
        id: 'e2-3',
        source: '2',
        target: StaticNodeType.devtoolsInput,
        style: { stroke: 'orange' },
        labelBgStyle: { fill: 'orange' },
        animated: true,
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
    },
    {
        id: '5',
        label: '中间件',
        position: { x: 500, y: 200 },
        class: 'light',
        sourcePosition: Position.Right,
        targetPosition: Position.Left,
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
    },
    {
        id: 'e4-5',
        source: StaticNodeType.devtoolsEvent,
        target: '5',
        style: { stroke: 'orange' },
        labelBgStyle: { fill: 'orange' },
        animated: true,
    },
    {
        id: 'e5-6',
        source: '5',
        target: StaticNodeType.webviewInput,
        style: { stroke: 'orange' },
        labelBgStyle: { fill: 'orange' },
        animated: true,
    },
];
