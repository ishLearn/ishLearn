<template>
  <div class="">
    <img
      v-if="filetype.startsWith('image')"
      :src="fileurl"
      :alt="filename"
      :title="filename"
    />
    <div v-else>
      <IconFileEarmarkPdf v-if="filename.endsWith('.pdf')" class="icon" />
      <IconFileEarmarkWord
        v-if="wordEndings.includes(fileEnding(filename))"
        class="icon"
      />
      <IconFileEarmarkSpreadsheet
        v-if="excelEndings.includes(fileEnding(filename))"
        class="icon"
      />
      <IconFileEarmarkSlides
        v-if="powerPointEndings.includes(fileEnding(filename))"
        class="icon"
      />
      <IconFileEarmarkCode
        v-if="codeEndings.includes(fileEnding(filename))"
        class="icon"
      />
      <IconFileEarmarkMusic
        v-else-if="filetype.startsWith('audio')"
        class="icon"
      />
      <IconFileEarmarkPlay
        v-else-if="filetype.startsWith('video')"
        class="icon"
      />
      <IconFileEarmarkText v-else-if="filename.endsWith('.txt')" class="icon" />
      <IconEarmarkZip v-else-if="filename.endsWith('.zip')" class="icon" />
      <IconFileEarmark v-else class="icon" />
      <p class="filename">{{ filename }}</p>
    </div>
  </div>
</template>

<script setup lang="ts">
import IconFileEarmark from '@/icons/icon-file-earmark.vue'
import IconFileEarmarkMusic from '../icons/icon-file-earmark-music.vue'
import IconFileEarmarkPlay from '../icons/icon-file-earmark-play.vue'
import IconEarmarkZip from '../icons/icon-earmark-zip.vue'
import IconFileEarmarkPdf from '../icons/icon-file-earmark-pdf.vue'
import IconFileEarmarkWord from '../icons/icon-file-earmark-word.vue'
import IconFileEarmarkText from '../icons/icon-file-earmark-text.vue'
import IconFileEarmarkSpreadsheet from '../icons/icon-file-earmark-spreadsheet.vue'
import IconFileEarmarkSlides from '../icons/icon-file-earmark-slides.vue'
import IconFileEarmarkCode from '../icons/icon-file-earmark-code.vue'

defineProps(['filename', 'filetype', 'fileurl'])

const wordEndings: string[] = ['doc', 'docx', 'docm', 'dotm', 'odt', 'xps']
const powerPointEndings: string[] = ['ppt', 'pptx', 'pps']
const excelEndings: string[] = ['xlsx', 'xlsb', 'xls', 'csv', 'ods']
const codeEndings: string[] = ['py', 'cpp', 'java', 'ts', 'c', 'html', 'css', 'js', 'php', 'tex']

const fileEnding = (filename: string) => filename.substring(filename.lastIndexOf('.') + 1)
</script>

<style scoped>
.wrapper {
  position: relative;
  width: 20%;
  margin: 1rem 2.5%;
  position: relative;
  aspect-ratio: 1/1;
  overflow: hidden;
}
img,
.icon {
  width: 100%;
  height: 100%;
  display: block;
  object-fit: cover;
  position: absolute;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
  border-radius: 10pt;
}
.filename {
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
</style>
