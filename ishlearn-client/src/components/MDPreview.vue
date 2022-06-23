<!-- GenericInput.vue -->
<script setup lang="ts">
import { defineProps, ref, watch } from 'vue'

const markdownOption = {
  bold: true,
  italic: true,
  header: true,
  underline: true,
  strikethrough: true,
  mark: true,
  superscript: true,
  subscript: true,
  quote: true,
  ol: true,
  ul: true,
  link: true,
  imagelink: false, // changed
  code: true,
  table: true,
  fullscreen: true,
  readmodel: true,
  htmlcode: false, // changed
  help: true,
  /* 1.3.5 */
  undo: true,
  redo: true,
  trash: false, // changed
  save: false, // changed
  /* 1.4.2 */
  navigation: true,
  /* 2.1.8 */
  alignleft: true,
  aligncenter: true,
  alignright: true,
  /* 2.2.1 */
  subfield: true,
  preview: true,
}

const props = defineProps(['textToDisplay'])
// props.textToDisplay verändert sich, falls das Attribut im Eltern Component verändert wird.
// mdtext ist jedoch Konstant!
const mdtext = ref(props.textToDisplay)
</script>

<template>
  <div>
    <mavon-editor
      v-model="mdtext"
      language="de"
      :toolbars="markdownOption"
      v-bind:subfield="false"
      defaultOpen="preview"
      v-bind:toolbarsFlag="false"
    ></mavon-editor>
  </div>
</template>

<style scoped></style>
