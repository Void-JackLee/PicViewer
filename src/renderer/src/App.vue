<style lang="scss">
body,html,#app {
  height: 100%;
  margin: 0;
  background: #000;
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

  #image-container {
    flex: 1;
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
    height: 138px;
    background: #222;
    overflow-y: auto;
    white-space: nowrap;

    .list-item {
      display: inline-flex;
      flex-direction: column;
      width: 183px;
      height: 120px;
      .list-img {
        flex: 1;
        display: flex;
        align-items: center;
        justify-content: center;
        img {
          display: block;
          height: 90px;
        }
      }
      .label {
        color: #fff;
        height: 20px;
        font-size: 14.5px;
        transform: translateY(-4.8px);
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
    font-size: 14px;
    color: #fff;
  }
}
</style>

<template>
<main>
  <div id="image-container">
    <ImageView ref="imgView" :img="img" :scale="scale" @load="doneImg" @scale="val => scale = val"></ImageView>
  </div>
  <div id="align-line">
    <div class="align-indicator align-2"></div>
<!--    <div class="align-indicator align-3"></div>-->
<!--    <div class="align-indicator align-3"></div>-->
  </div>
  <div id="list-gallery" ref="gallery" @wheel="scrollY">
    <div :class="'list-item' + (img === api.joinPath(location,fileName) ? ' active' : '')" v-for="(fileName,i) in files" @click="setCurrentImg(fileName)">
      <div class="list-img">
        <img :src="`file:${cacheFiles[i]}`"></img>
      </div>
      <div class="label">{{fileName}}</div>
    </div>
  </div>
  <footer>
    {{scale * 100}}
  </footer>
</main>
</template>

<script setup lang="ts">
import {reactive, ref} from "vue";
import ImageView from "@renderer/components/ImageView.vue";
const api = window.api

const img = ref('')
const files = reactive([] as string[])
const cacheFiles = reactive([] as string[])
const location = ref('')
const imgView = ref()
const gallery = ref()
const PRELOAD_COUNTS = 6

const scale = ref(1.)

let init = false

let file2idx = {}
let preloadList: Set<string> = new Set([])
let loadedImages = {}

window.electron.ipcRenderer.on('openFile',(_, pathData) => {
  files.length = 0
  cacheFiles.length = 0
  file2idx = {}
  files.push(...pathData.files)
  for (let i in files) {
    file2idx[files[i]] = parseInt(i)
  }
  location.value = pathData.location
  init = true
  setCurrentImg(files[pathData.index])
})

window.electron.ipcRenderer.on('cacheFile',(_, cacheData) => {
  if (cacheData.location !== location.value) return
  cacheFiles[file2idx[cacheData.file]] = cacheData.thumbFile
})

window.electron.ipcRenderer.on('initImgView',() => {
  imgView.value.initScale()
})

const getPreloadImageList = (idx: number) => {
  preloadList = new Set([])
  preloadList.add(files[idx])
  for (let i = idx - 1,j = 0;i >= 0 && j < PRELOAD_COUNTS;i --, j ++) {
    preloadList.add(files[i])
  }
  console.log(idx + 1, files.length)
  for (let i = idx + 1,j = 0;i < files.length && j < PRELOAD_COUNTS;i ++, j ++) {
    console.log(i)
    preloadList.add(files[i])
  }
}

const preloadImage = () => {
  for (let i in loadedImages) {
    if (!preloadList.has(i)) {
      new Promise(resolve => {
        console.log('Del:' + i)
        delete loadedImages[i]
        resolve(null)
      })
    }
  }
  for (let i of preloadList) {
    if (!(i in loadedImages)) {
      new Promise(resolve => {
        console.log('Add:' + i)
        loadedImages[i] = new Image()
        loadedImages[i].src = 'file:' + api.joinPath(location.value,i)
        resolve(null)
      })
    }
  }
}

const setCurrentImg = (path) => {
  const fullPath = api.joinPath(location.value, path)
  img.value = fullPath
  document.title = 'Jack看图 - ' + fullPath
  if (path) {
    getPreloadImageList(file2idx[path])
    preloadImage()
  }
}

const doneImg = () => {
  if (init) {
    init = false
    imgView.value.initScale()
  }
}

const scrollY = (e) => {
    e.preventDefault();
    gallery.value.scrollLeft += e.deltaY;
}

const getMetadata = (callback) => {
  if (!img.value) return
  const promise = api.sharpMetaData(img.value)
  if (callback) {
    promise.then(metadata => {
      callback(metadata)
    })
  } else return promise
}

</script>
