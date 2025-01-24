<script setup lang="ts">



</script>

<template>
  <div id="content" ref='content' @wheel="scaleListener">
    <img @load="doneImg"
         @mousedown="drag_down"
         @mousemove="drag"
         @mouseup="drag_up"
         @mouseleave="drag_up"
         draggable="false"
         ref='imgView'
         :src="`file:${img}`"
         alt="loading..."
         :style="`transform: scale(${scale});left: ${left}px;top: ${top}px;`">
  </div>
</template>

<style scoped lang="scss">
#content {
  flex: 1;
  background: #000;
  overflow: hidden;
  img {
    transform-origin: top left;
    position: relative;
    cursor: pointer;
  }
}
</style>
