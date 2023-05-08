export enum Position {
    Left = 'left',
    Top = 'top',
    Right = 'right',
    Bottom = 'bottom',
}

export enum StaticNodeType {
    /** webview事件 */
    webviewEvent = 'webviewEvent',
    /** devtools接收 */
    devtoolsInput = 'devtoolsInput',
    /** devtools事件 */
    devtoolsEvent = 'devtoolsEvent',
    /** webview接收 */
    webviewInput = 'webviewInput',
}

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
