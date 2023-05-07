<script lang="ts" setup>
import { ref } from 'vue';
import { NormalNodeType } from '../common/types.ts';

export interface NodeInterface {
  type: 'input' | 'output' | 'default';
  label: string;
  uid: NormalNodeType;
}

function onDragStart(event: DragEvent, node: NodeInterface) {
    if (event.dataTransfer) {
        event.dataTransfer.setData('application/vueflow', JSON.stringify(node));
        event.dataTransfer.effectAllowed = 'move';
    }
}

const nodes = ref<NodeInterface[]>([
    { type: 'output', label: 'console输出', uid: NormalNodeType.console },
    { type: 'input', label: '注入cdp指令', uid: NormalNodeType.cdp },
    { type: 'default', label: '中间件', uid: NormalNodeType.middleware },
]);
</script>

<template>
    <aside>
        <div class="nodes">
            <div
                class="vue-flow__node-input"
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
