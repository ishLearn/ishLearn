<template>
  <component :is="tag" class="file-preview">
    <img
      v-if="file.file.type.startsWith('image')"
      :src="file.url"
      :alt="file.file.name"
      :title="file.file.name"
    />
    <div v-else>
      <IconFileEarmarkPdf v-if="file.file.name.endsWith('.pdf')" class="icon" />
      <IconFileEarmarkWord v-if="wordEndings.includes(fileEnding(file.file.name))" class="icon" />
      <IconFileEarmarkSpreadsheet
        v-if="excelEndings.includes(fileEnding(file.file.name))"
        class="icon"
      />
      <IconFileEarmarkSlides
        v-if="powerPointEndings.includes(fileEnding(file.file.name))"
        class="icon"
      />
      <IconFileEarmarkCode v-if="codeEndings.includes(fileEnding(file.file.name))" class="icon" />
      <IconFileEarmarkMusic v-else-if="file.file.type.startsWith('audio')" class="icon" />
      <IconFileEarmarkPlay v-else-if="file.file.type.startsWith('video')" class="icon" />
      <IconFileEarmarkText v-else-if="file.file.name.endsWith('.txt')" class="icon" />
      <IconEarmarkZip v-else-if="file.file.name.endsWith('.zip')" class="icon" />
      <IconFileEarmark v-else class="icon" />
      <p class="filename">{{ file.file.name }}</p>
    </div>

    <button
      v-if="deleteButton"
      @click.prevent="$emit('remove', file)"
      class="close-icon"
      aria-label="Entfernen"
    >
      X
    </button>

    <span class="status-indicator loading-indicator" v-show="file.status === 'loading'"
      >In Progress</span
    >
    <span class="status-indicator success-indicator" v-show="file.status === true">Uploaded</span>
    <span class="status-indicator failure-indicator" v-show="file.status === false">Error</span>
  </component>
</template>

<script setup lang="ts">
import IconFileEarmark from '@/icons/icon-file-earmark.vue'
import { UploadableFile } from '@/util/file-list'
import IconFileEarmarkMusic from '../icons/icon-file-earmark-music.vue'
import IconFileEarmarkPlay from '../icons/icon-file-earmark-play.vue'
import IconEarmarkZip from '../icons/icon-earmark-zip.vue'
import IconFileEarmarkPdf from '../icons/icon-file-earmark-pdf.vue'
import IconFileEarmarkWord from '../icons/icon-file-earmark-word.vue'
import IconFileEarmarkText from '../icons/icon-file-earmark-text.vue'
import IconFileEarmarkSpreadsheet from '../icons/icon-file-earmark-spreadsheet.vue'
import IconFileEarmarkSlides from '../icons/icon-file-earmark-slides.vue'
import IconFileEarmarkCode from '../icons/icon-file-earmark-code.vue'

defineEmits(['remove'])

const props = defineProps({
  file: { type: UploadableFile, required: true },
  tag: { type: String, default: 'li' },
  deleteButton: { type: Boolean, default: false },
})

const wordEndings: string[] = ['doc', 'docx', 'docm', 'dotm', 'odt', 'xps']
const powerPointEndings: string[] = ['ppt', 'pptx', 'pps']
const excelEndings: string[] = ['xlsx', 'xlsb', 'xls', 'csv', 'ods']
const codeEndings: string[] = ['py', 'cpp', 'java', 'ts', 'c', 'html', 'css', 'js', 'php']

const fileEnding = (filename: string) => filename.substring(filename.lastIndexOf('.') + 1)

console.log(props.file.file.type)
console.log(props.file.file.name)
console.log(fileEnding(props.file.file.name))
</script>

<style scoped>
.file-preview {
  position: relative;
  width: 20%;
  margin: 1rem 2.5%;
  position: relative;
  aspect-ratio: 1/1;
  overflow: hidden;
}
.file-preview img,
.file-preview .icon {
  width: 100%;
  height: 100%;
  display: block;
  object-fit: cover;
}
.file-preview .filename {
  border-radius: 2pt;
  word-break: break-all;
  font-size: 8pt;
  color: black;
  background: rgba(255, 255, 255, 0.475);
  position: absolute;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
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
}
.file-preview .status-indicator {
  font-size: calc(0.75 * var(--size));
  bottom: 0.25rem;
  padding: 0 10px;
}
.file-preview .loading-indicator {
  animation: pulse 1.5s linear 0s infinite;
  color: #000;
}
.file-preview .success-indicator {
  background: #6c6;
  color: #040;
}
.file-preview .failure-indicator {
  background: #933;
  color: #fff;
}

@keyframes pulse {
  0% {
    background: #fff;
  }
  50% {
    background: #ddd;
  }
  100% {
    background: #fff;
  }
}
</style>
