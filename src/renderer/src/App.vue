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

  #content {
    flex: 1;
    background: #000;
    overflow: hidden;
    img {
      transform-origin: top left;
      position: relative;
    }
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
  }
}
</style>

<template>
<main>
  <div id="content" ref='content'>
    <img @load="doneImg" ref='imgView' :src="`file:${img}`" alt="loading..." :style="`transform: scale(${scale});left: ${left}px;top: ${top}px;`">
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
let init = false

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
  init = true
  setCurrentImg(api.joinPath(pathData.location,files[pathData.index]))
})

window.electron.ipcRenderer.on('cacheFile',(_, cacheData) => {
  if (cacheData.location !== location.value) return
  cacheFiles[file2idx[cacheData.file]] = cacheData.thumbFile
})

window.electron.ipcRenderer.on('initImgView',() => {
  initScale()
})

const setCurrentImg = (path) => {
  img.value = path
  document.title = 'Jack看图 - ' + path
}

const doneImg = () => {
  if (init) {
    init = false
    initScale()
  } else calcCorrectLeftTop()
}

const imgView = ref()
const content = ref()
const scale = ref(1.)
const left = ref(0)
const top = ref(0)
const offsetLeft = ref(0)
const offsetTop = ref(0)

onMounted(() => {
  console.log(content.value)

  new ResizeObserver((e) => {
    for (let i of e) {
      const contentWidth = i.contentRect.width
      const contentHeight = i.contentRect.height

      // resizeDefaultRatio(contentWidth, contentHeight)

    }
  }).observe(content.value)
  // new ResizeObserver((_) => {
  //   resizeDefaultRatio(content.value.getBoundingClientRect().width, content.value.getBoundingClientRect().height)
  // }).observe(imgView.value)
})

const getMetadata = (callback) => {
  if (!img.value) return
  const promise = api.sharpMetaData(img.value)
  if (callback) {
    promise.then(metadata => {
      callback(metadata)
    })
  } else return promise
}

const initScale = () => {
  const width = imgView.value.getBoundingClientRect().width
  const height = imgView.value.getBoundingClientRect().height
  const contentWidth = content.value.getBoundingClientRect().width
  const contentHeight = content.value.getBoundingClientRect().height
  let aspect = width! / height!
  let newWidth, newHeight
  if (contentWidth / aspect <= contentHeight) {
    newWidth = contentWidth
    newHeight = contentWidth / aspect
  } else {
    newWidth = contentHeight * aspect
    newHeight = contentHeight
  }
  console.log(scale.value, newWidth / width)
  scale.value = newWidth / width * scale.value
  offsetLeft.value = 0
  offsetTop.value = 0
  left.value = contentWidth / 2 - newWidth / 2
  top.value = contentHeight / 2 - newHeight / 2
}

const resizeDefaultScale = (contentWidth,contentHeight) => {

  console.log(contentWidth, contentHeight)
}

const calcCorrectLeftTop = () => {
  const width = imgView.value.getBoundingClientRect().width
  const height = imgView.value.getBoundingClientRect().height
  const contentWidth = content.value.getBoundingClientRect().width
  const contentHeight = content.value.getBoundingClientRect().height
  let mLeft = contentWidth / 2 - width / 2
  let mTop = contentHeight / 2 - height / 2
  if (width > contentWidth) mLeft = left.value + offsetLeft.value
  if (height > contentHeight) mTop = top.value + offsetTop.value
  left.value = mLeft
  top.value = mTop
}


</script>
