<style lang="scss">
body,html,#app {
  height: 100%;
  margin: 0
}
main {
  display: flex;
  flex-direction: column;
  height: 100%;

  #content {
    flex: 1;
    background: #000;
  }

  #align-line {
    background: #fff;
    height: 5px;

    .align-indicator {
      position: relative;
      height: 100%;
      width: 3px;
    }

    .align-2 {
      background: #f00;
      left: 50%;
    }

    .align-3 {
      background: #993fff;
      &:nth-child(2) {
        left: calc(100% / 3);
        top: -5px
      }
      &:nth-child(3) {
        left: calc(200% / 3);
        top: -10px
      }
    }
  }

  #list-gallery {
    height: 130px;
    background: #222;
    display: flex;
    overflow-y: auto;

    .list-item {

    }
  }

  footer {
    height: 20px;
    background: #444;
  }
}
</style>

<template>
<main>
  <div id="content">
    <img :src="img" alt="">
  </div>
  <div id="align-line">
    <div class="align-indicator align-2"></div>
<!--    <div class="align-indicator align-3"></div>-->
<!--    <div class="align-indicator align-3"></div>-->
  </div>
  <div id="list-gallery">
    <div class="list-item" v-for="fileName in files">
      {{fileName}}
    </div>
  </div>
  <footer>

  </footer>
</main>
</template>

<script setup lang="ts">

import {reactive, ref} from "vue";

const img = ref('')
const files = reactive([] as string[])

window.electron.ipcRenderer.on('openFile',(_, pathData) => {
  files.length = 0
  files.push(...pathData.files)
  img.value = 'file:' + window.api.joinPath(pathData.location,files[pathData.index])
})
</script>
