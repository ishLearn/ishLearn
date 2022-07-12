<template>
  <div class="">
    <img v-if="urlExists" :src="fileurl" :alt="filename" :title="filename" />
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
        v-else-if="
          filetype.startsWith('audio') ||
          audioEndings.includes(fileEnding(filename))
        "
        class="icon"
      />
      <IconFileEarmarkPlay
        v-else-if="
          filetype.startsWith('video') ||
          videoEndings.includes(fileEnding(filename))
        "
        class="icon"
      />
      <IconFileEarmarkImage
        v-else-if="
          filetype.startsWith('image') ||
          imageEndings.includes(fileEnding(filename))
        "
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
import axios from 'axios'
import { ref, Ref } from 'vue'
import IconEarmarkZip from '@/icons/IconEarmarkZip.vue'
import IconFileEarmark from '@/icons/IconFileEarmark.vue'
import IconFileEarmarkCode from '@/icons/IconFileEarmarkCode.vue'
import IconFileEarmarkImage from '@/icons/IconFileEarmarkImage.vue'
import IconFileEarmarkPdf from '@/icons/IconFileEarmarkPdf.vue'
import IconFileEarmarkMusic from '@/icons/IconFileEarmarkMusic.vue'
import IconFileEarmarkPlay from '@/icons/IconFileEarmarkPlay.vue'
import IconFileEarmarkSlides from '@/icons/IconFileEarmarkSlides.vue'
import IconFileEarmarkSpreadsheet from '@/icons/IconFileEarmarkSpreadsheet.vue'
import IconFileEarmarkText from '@/icons/IconFileEarmarkText.vue'
import IconFileEarmarkWord from '@/icons/IconFileEarmarkWord.vue'

const props = defineProps(['filename', 'filetype', 'fileurl'])

const wordEndings: string[] = ['doc', 'docx', 'docm', 'dotm', 'odt', 'xps']
const powerPointEndings: string[] = ['ppt', 'pptx', 'pps']
const audioEndings: string[] = ['mp3', 'wav', 'aac', 'flac', 'm4a']
const videoEndings: string[] = ['mp4', 'mov', 'avi', 'flv', 'webm']
const imageEndings: string[] = ['jpg', 'png', 'gif', 'jpeg', 'svg']
const excelEndings: string[] = ['xlsx', 'xlsb', 'xls', 'csv', 'ods']
const codeEndings: string[] = ['py', 'cpp', 'java', 'ts', 'c', 'html', 'css', 'js', 'php', 'tex']

const fileEnding = (filename: string) => filename.substring(filename.lastIndexOf('.') + 1)

const urlExists: Ref<boolean> = ref(false)
if (props.filetype.startsWith('image')) {
  try {
    axios.get(props.fileurl).then(() => {
      // solange bzw. falls das Bild nicht existiert, wird ein Icon angezeigt.
      urlExists.value = true
    })
  } catch (err) { }
}
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
