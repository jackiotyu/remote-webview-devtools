import { MarkerType } from '@vue-flow/core'

/**
 * You can pass elements together as a v-model value
 * or split them up into nodes and edges and pass them to the `nodes` and `edges` props of Vue Flow (or useVueFlow composable)
 */
export const initialElements = [
  { id: '1', type: 'input', label: 'webview', position: { x: 250, y: 0 }, class: 'light' },
  { id: '2', label: '中间件', position: { x: 250, y: 100 }, class: 'light', },
  { id: '3', type: 'output', label: 'devtools', position: { x: 250, y: 200 }, class: 'light' },
  {
    id: 'e1-2',
    type: 'step',
    label: '连接',
    source: '1',
    target: '2',
    style: { stroke: 'orange' },
    labelBgStyle: { fill: 'orange' },
    animated: true
  },
  {
    id: 'e2-3',
    type: 'step',
    label: '连接',
    source: '2',
    target: '3',
    style: { stroke: 'orange' },
    labelBgStyle: { fill: 'orange' },
    animated: true
  },
]
