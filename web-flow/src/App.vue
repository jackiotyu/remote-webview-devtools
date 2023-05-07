<template>
  <FlowContainer></FlowContainer>
</template>

<script setup lang="ts">
import FlowContainer from '@/components/FlowContainer.vue';
</script>

<style>
@import '@vue-flow/core/dist/style.css';
@import '@vue-flow/core/dist/theme-default.css';
@import '@vue-flow/controls/dist/style.css';
@import '@vue-flow/minimap/dist/style.css';
@import '@vue-flow/node-resizer/dist/style.css';

html,
body,
#app {
  margin: 0;
  height: 100%;
  width: 100%;
  box-sizing: border-box;
}

#app {
  text-transform: uppercase;
  font-family: 'JetBrains Mono', monospace;
  -webkit-font-smoothing: antialiased;
  -moz-osx-font-smoothing: grayscale;
  text-align: center;
  color: #2c3e50;
}

.vue-flow__minimap {
  transform: scale(75%);
  transform-origin: bottom right;
}

.basicflow.dark {
  background: #57534e;
  color: #fffffb;
}

.basicflow.dark .vue-flow__node {
  background: #292524;
  color: #fffffb;
}

.basicflow.dark .vue-flow__controls .vue-flow__controls-button {
  background: #292524;
  fill: #fffffb;
  border-color: #fffffb;
}

.basicflow.dark .vue-flow__edge-textbg {
  fill: #292524;
}

.basicflow.dark .vue-flow__edge-text {
  fill: #fffffb;
}

.basicflow .controls {
  display: flex;
  flex-wrap: wrap;
  justify-content: center;
  gap: 8px;
}

.basicflow .controls button {
  padding: 4px;
  border-radius: 5px;
  font-weight: 600;
  -webkit-box-shadow: 0px 5px 10px 0px rgba(0, 0, 0, 0.3);
  box-shadow: 0 5px 10px #0000004d;
  cursor: pointer;
  display: flex;
  justify-content: center;
  align-items: center;
}

.basicflow .controls button:hover {
  transform: scale(102%);
  transition: 0.25s all ease;
}

.dndflow {
  flex-direction: row;
  display: flex;
  height: 100%;
}

.dndflow aside {
  color: #fff;
  font-weight: 700;
  border-right: 1px solid #eee;
  padding: 15px 10px;
  font-size: 12px;
  background: #f3f3f3;
  -webkit-box-shadow: 0px 5px 10px 0px rgba(0, 0, 0, 0.3);
  box-shadow: 0 5px 10px #0000004d;
  display: inline-flex;
  align-items: center;
  width: auto;
}

.dndflow aside .nodes {
  display: flex;
  flex-direction: column;
  justify-content: center;
}

.dndflow aside .nodes>* {
  margin-bottom: 10px;
  cursor: grab;
  font-weight: 500;
  -webkit-box-shadow: 5px 5px 10px 2px rgba(0, 0, 0, 0.25);
  box-shadow: 5px 5px 10px 2px #00000040;
}

.dndflow .vue-flow-wrapper {
  flex-grow: 1;
  height: 100%;
}
</style>
