<style lang="scss">
body,html,#app {
  height: 100%;
  margin: 0;
  ::-webkit-scrollbar {
    background: #333;
  }
  ::-webkit-scrollbar-track {
    background: #333;
  }
  ::-webkit-scrollbar-thumb {
    border-radius: 4px;
    border: 2px solid transparent;
    background-clip: content-box;
    background-color: #777;
  }
}
main {
  display: flex;
  flex-direction: column;
  height: 100%;

  #content {
    flex: 1;
    background: #000;
    overflow: hidden;
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
    overflow-y: auto;
    white-space: nowrap;

    .list-item {
      display: inline-flex;
      flex-direction: column;
      width: 170px;
      height: 112px;
      .list-img {
        flex: 1;
        display: flex;
        align-items: center;
        justify-content: center;
        img {
          display: block;
          height: 80px;
        }
      }
      .label {
        color: #fff;
        height: 20px;
        font-size: 13px;
        text-align: center;
        user-select: none;
      }
      &.active {
        background: #555;
      }
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
  <div id="content" ref='content'>
    <img ref='imgView' :src="img" alt="loading...">
  </div>
  <div id="align-line">
    <div class="align-indicator align-2"></div>
<!--    <div class="align-indicator align-3"></div>-->
<!--    <div class="align-indicator align-3"></div>-->
  </div>
  <div id="list-gallery">
    <div :class="'list-item' + (img === 'file:' + api.joinPath(location,fileName) ? ' active' : '')" v-for="(fileName,i) in files" @click="setCurrentImg(api.joinPath(location,fileName))">
      <div class="list-img">
        <img :src="`file:${cacheFiles[i]}`"></img>
      </div>
      <div class="label">{{fileName}}</div>
    </div>
  </div>
  <footer>

  </footer>
</main>
</template>

<script setup lang="ts">
import {onMounted, reactive, ref} from "vue";
const api = window.api

const img = ref('')
const files = reactive([] as string[])
const cacheFiles = reactive([] as string[])
const location = ref('')

let file2idx = {}

window.electron.ipcRenderer.on('openFile',(_, pathData) => {
  files.length = 0
  cacheFiles.length = 0
  file2idx = {}
  files.push(...pathData.files)
  for (let i in files) {
    file2idx[files[i]] = i
  }
  location.value = pathData.location
  setCurrentImg(api.joinPath(pathData.location,files[pathData.index]))
})

window.electron.ipcRenderer.on('cacheFile',(_, cacheData) => {
  if (cacheData.location !== location.value) return
  cacheFiles[file2idx[cacheData.file]] = cacheData.thumbFile
})

const setCurrentImg = (path) => {
  img.value = 'file:' + path
  document.title = 'Jack看图 - ' + path
}

const imgView = ref()
const content = ref()
const ratio = ref(1.)

onMounted(() => {
  console.log(imgView.value)



  new ResizeObserver((e) => {
    for (let i of e) {
      console.log(i.contentRect.width)
    }
  }).observe(imgView.value)

})



</script>
