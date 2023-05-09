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

body {
  background-color: #eee;
}

body.dark {
  background: #000;
}

.dndflow.dark {
  background: #57534e;
  color: #999999;
}

.dndflow.dark .vue-flow__node {
  background: #292524;
  color: #999999;
}

.dndflow.dark .vue-flow__controls .vue-flow__controls-button {
  background: #292524;
  fill: #999999;
  border-color: #999999;
}

.dndflow.dark .vue-flow__edge-textbg {
  fill: #292524;
}

.dndflow.dark .vue-flow__edge-text {
  fill: #999999;
}


.dndflow .action-bar {
  position: fixed;
  bottom: 80px;
  margin: 0 auto;
  /* width: 200px; */
  left: 50%;
  display: flex;
  justify-content: center;
  /* background: rgba(255, 255, 255, 0.5); */
  /* filter: blur(10); */
  z-index: 1;
  /* padding: 10px; */
  /* border-radius: 10px; */
}

.dndflow .action-bar .action-btn {
  padding: 14px;
  box-sizing: border-box;
  background-color: #000000;
  display: inline-block;
  border-radius: 50%;
  cursor: pointer;
  border: 6px solid #cccccc;
  /* -webkit-box-shadow: 0 1px 4px 1px rgb(0 0 0 / 8%); */
  /* box-shadow: 0 1px 4px 1px rgb(0 0 0 / 8%); */
  animation: shadowSpread linear infinite;
  animation-duration: 1.2s;
  transition: box-shadow 1.2s;
}

@keyframes shadowSpread {
  0% {
    box-shadow: 0 1px 4px 1px rgb(0 0 0 / 8%);
  }
  50% {
    box-shadow: 0 1px 12px 6px #cccccc;
  }
  100% {
    box-shadow: 0 1px 12px 6px rgb(255, 255, 255);
  }
}


.dndflow .action-bar .action-btn .icon {
  fill: #ffffff;
  width: 40px;
  height: 40px;
}

.dndflow.dark aside {
  background: #999999;
  color: #999999;
}

.dndflow.dark aside .vue-flow__node-input {
  color: #999999;
  background: #292524;
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
  background: rgba(243, 243, 243, 0.5);
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
  -webkit-box-shadow: 1px 1px 5px 2px rgba(0, 0, 0, 0.1);
  box-shadow: 1px 1px 5px 2px rgba(0, 0, 0, 0.1);
}

.dndflow .vue-flow-wrapper {
  flex-grow: 1;
  height: 100%;
}

.dndflow .vue-flow__edge.selected .vue-flow__edge-textbg {
  filter: brightness(1.5);
}
</style>
