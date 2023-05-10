<script lang="ts" setup>
import { ref } from 'vue';
import { NormalNodeType } from '../common/types.ts';
import { ModuleType } from '@/../../protocol/flow.ts';

export interface NodeInterface {
    type: 'input' | 'output' | 'default';
    label: string;
    uid: NormalNodeType;
    use: ModuleType;
}

function onDragStart(event: DragEvent, node: NodeInterface) {
    if (event.dataTransfer) {
        event.dataTransfer.setData('application/vueflow', JSON.stringify(node));
        event.dataTransfer.effectAllowed = 'move';
    }
}

const nodes = ref<NodeInterface[]>([
    {
        type: 'output',
        label: '输出',
        uid: NormalNodeType.console,
        use: ModuleType.target,
    },
    {
        type: 'input',
        label: '输入',
        uid: NormalNodeType.cdp,
        use: ModuleType.source,
    },
    {
        type: 'default',
        label: '中间件',
        uid: NormalNodeType.middleware,
        use: ModuleType.middleware,
    },
]);
</script>

<template>
    <aside>
        <div class="nodes">
            <div
                class="vue-flow__node-input vue-flow__edge-textbg"
                :draggable="true"
                @dragstart="onDragStart($event, node)"
                v-for="node in nodes"
                :key="node.label"
            >
                {{ node.label }}
            </div>
        </div>
    </aside>
</template>
