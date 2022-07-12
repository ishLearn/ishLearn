<template>
  <component :is="tag" class="file-preview" @click.prevent="downloadFile">
    <FileDisplayIcon
      :filename="filename"
      :filetype="filetype"
      :fileurl="fileurl"
    />
    <button
      v-show="showDelete"
      @click.stop="$emit('delete', { filename })"
      class="close-icon"
      aria-label="Entfernen"
    >
      X
    </button>
  </component>
</template>

<script setup lang="ts">
import FileDisplayIcon from '@/components/FileDisplayIcon.vue'
import api from '@/services/api';
import { AxiosResponse } from 'axios';

const props = defineProps({
  filename: { type: String, required: true },
  fileurl: { type: String, required: true },
  filetype: { type: String, required: false, default: 'notworking/nothing' },
  showDelete: { type: Boolean, default: false },
  tag: { type: String, default: 'li' },
})
defineEmits(['delete'])

function downloadFile() {
  const isHttp = props.fileurl.substring(0, 7) === 'http://' || props.fileurl.substring(0, 8) === 'https://'
  const url = isHttp ? props.fileurl : '/api/files/download/'

  if (isHttp) return window.open(url, '_blank')?.focus();

  api({
    url,
    method: isHttp ? 'GET' : 'POST',
    responseType: 'blob',
    data: !isHttp ? { filename: props.fileurl } : {},
  }).then((res: AxiosResponse<any, any>) => {
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
  cursor: pointer;
}
.file-preview .close-icon,
.file-preview .status-indicator {
  --size: 20px;
  position: absolute;
  line-height: var(--size);
  height: var(--size);
  border-radius: var(--size);
  box-shadow: 0 0 5px currentColor;
  right: 0.25rem;
  appearance: none;
  border: 0;
  padding: 0;
}
.file-preview .close-icon {
  width: var(--size);
  font-size: var(--size);
  background: #933;
  color: #fff;
  top: 0.25rem;
  cursor: pointer;
  z-index: 5;
}
</style>
