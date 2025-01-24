<script setup lang="ts">

import {onMounted, ref, watch} from "vue";

const props = defineProps({
  img: {
    type: String,
    required: true
  },
  scale: {
    type: Number,
    default: 1.
  }
})

const imgView = ref()
const content = ref()
const scale = ref(props.scale)
const left = ref(0)
const top = ref(0)
const offsetLeft = ref(0)
const offsetTop = ref(0)

const dragStartX = ref(null as number | null)
const dragStartY = ref(null as number | null)
const dragCurrentX = ref(null as number | null)
const dragCurrentY = ref(null as number | null)

const emit = defineEmits(["load","scale"])

watch(scale,newVal => {
  emit("scale", newVal)
})



onMounted(() => {
  new ResizeObserver((e) => {
    for (let _ of e) {
      calcCorrectLeftTop()
    }
  }).observe(content.value)
})

const calcCorrectLeftTop = (width: number | null = null, height: number | null = null) => {
  width = width != null ? width : imgView.value.getBoundingClientRect().width
  height = height != null ? height : imgView.value.getBoundingClientRect().height
  const contentWidth = content.value.getBoundingClientRect().width
  const contentHeight = content.value.getBoundingClientRect().height
  let mLeft = contentWidth / 2 - width! / 2
  let mTop = contentHeight / 2 - height! / 2
  if (width! > contentWidth) {
    mLeft = mLeft + offsetLeft.value
    if (mLeft > 0) {
      mLeft = 0
      offsetLeft.value = width! / 2 - contentWidth / 2
    }
    if (mLeft < contentWidth - width!) {
      mLeft = contentWidth - width!
      offsetLeft.value = contentWidth / 2 - width! / 2
    }
  } else {
    offsetLeft.value = 0
  }
  if (height! > contentHeight) {
    mTop = mTop + offsetTop.value
    if (mTop > 0) {
      mTop = 0
      offsetTop.value = height! / 2 - contentHeight / 2
    }
    if (mTop < contentHeight - height!) {
      mTop = contentHeight - height!
      offsetTop.value = contentHeight / 2 - height! / 2
    }
  } else {
    offsetTop.value = 0
  }

  left.value = mLeft
  top.value = mTop
}

const drag_down = (e) => {
  dragStartX.value = e.clientX
  dragStartY.value = e.clientY
  dragCurrentX.value = offsetLeft.value
  dragCurrentY.value = offsetTop.value
}

const drag = (e) => {
  e.preventDefault()
  if (dragStartX.value === null || dragStartY.value === null) return
  offsetLeft.value = dragCurrentX.value + e.clientX - dragStartX.value
  offsetTop.value = dragCurrentY.value + e.clientY - dragStartY.value
  calcCorrectLeftTop()
}

const drag_up = () => {
  dragStartX.value = null
  dragStartY.value = null
}

const scaleListener = (e) => {
  if (!props.img) return
  // console.log(e.deltaY)
  const width = imgView.value.getBoundingClientRect().width
  const height = imgView.value.getBoundingClientRect().height
  const contentWidth = content.value.getBoundingClientRect().width
  const contentHeight = content.value.getBoundingClientRect().height
  let aspect = width! / height!
  let fitWidth
  if (contentWidth / aspect <= contentHeight) {
    fitWidth = contentWidth
  } else {
    fitWidth = contentHeight * aspect
  }
  const fitScale = fitWidth / width * scale.value
  const s = scale.value
  scale.value -= e.deltaY * scale.value * 0.0005
  if (scale.value < fitScale) scale.value = fitScale

  offsetLeft.value = offsetLeft.value * scale.value / s
  offsetTop.value = offsetTop.value * scale.value / s

  if (scale.value < 0) scale.value = 0
  calcCorrectLeftTop(width * scale.value / s, height * scale.value / s)
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

const doneImg = () => {
  calcCorrectLeftTop()
  emit('load')
}

defineExpose({
  initScale
})

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
  height: 100%;
  background: #000;
  overflow: hidden;
  img {
    transform-origin: top left;
    position: relative;
    cursor: pointer;
  }
}
</style>
