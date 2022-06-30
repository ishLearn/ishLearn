<template>
  <div
    :data-active="active"
    @dragenter.prevent="setActive"
    @dragover.prevent="setActive"
    @dragleave.prevent="setInactive"
    @drop.prevent="onDrop"
  >
    <slot :dropZoneActive="active"></slot>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted, onUnmounted } from 'vue'
const emit = defineEmits(['files-dropped'])

const active = ref(false)
let inActiveTimeout = null
const setActive = () => {
  active.value = true
  clearTimeout(inActiveTimeout)
}
const setInactive = () => {
  inActiveTimeout = setTimeout(() => {
    active.value = false
  }, 50)
}

function onDrop(e) {
  setInactive()
  emit('files-dropped', [...e.dataTransfer.files])
}

function preventDefaults(e) {
  e.preventDefault()
}

const events = ['dragenter', 'dragover', 'dragleave', 'drop']

onMounted(() => {
  console.log('On Mounted')
  events.forEach((eventName) => {
    document.body.addEventListener(eventName, preventDefaults)
  })
})

onUnmounted(() => {
  events.forEach((eventName) => {
    document.body.removeEventListener(eventName, preventDefaults)
  })
})
</script>
