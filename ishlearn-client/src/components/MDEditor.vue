<!-- GenericInput.vue -->
<script setup lang="ts">
import { defineProps, defineEmits, ref, Ref, onMounted } from 'vue'

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

const props = defineProps(['modelValue'])
defineEmits(['update:modelValue'])
const mdtext: Ref<string> = ref('')

onMounted(() => {
  mdtext.value = props.modelValue
})
</script>

<template>
  <div>
    <mavon-editor
      v-model="mdtext"
      @input="$emit('update:modelValue', mdtext)"
      language="de"
      :toolbars="markdownOption"
    >
    </mavon-editor>
  </div>
</template>

<style scoped></style>
