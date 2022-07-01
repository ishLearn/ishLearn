<template>
  <component :is="tag" class="file-preview" @click.prevent="downloadFile">
    <FileDisplay :filename="filename" :filetype="filetype" :fileurl="fileurl" />
  </component>
</template>

<script setup lang="ts">
import axios from 'axios'
import { UploadableFile } from '@/util/file-list'
import FileDisplay from '@/components/FileDisplayIcon.vue'

const props = defineProps({
  filename: { type: String, required: true },
  fileurl: { type: String, required: true },
  filetype: { type: String, required: false, default: 'nothing' },
  tag: { type: String, default: 'li' },
})

function downloadFile() {
  axios({
    url: '/api/files/download/',
    method: 'POST',
    responseType: 'blob',
    data: { filename: props.fileurl },
  }).then((res) => {
    console.log(res.data)
    const fileURL = window.URL.createObjectURL(new Blob([res.data]))
    const fileLink = document.createElement('a')

    fileLink.href = fileURL
    fileLink.setAttribute('download', props.filename)
    document.body.appendChild(fileLink)

    fileLink.click()
  })
}
</script>

<style scoped>
.file-preview {
  position: relative;
  width: 100px;
  margin: 1rem 2.5%;
  position: relative;
  aspect-ratio: 1/1;
  overflow: hidden;
}
</style>
