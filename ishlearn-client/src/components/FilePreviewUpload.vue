<template>
  <component :is="tag" class="file-preview">
    <FileDisplay
      :filename="file.file.name"
      :filetype="file.file.type"
      :fileurl="file.url"
    />

    <button
      @click.prevent="$emit('remove', file)"
      class="close-icon"
      aria-label="Entfernen"
    >
      X
    </button>

    <span
      class="status-indicator loading-indicator"
      v-show="file.status === 'loading'"
      >In Progress</span
    >
    <span
      class="status-indicator success-indicator"
      v-show="file.status === true"
      >Uploaded</span
    >
    <span
      class="status-indicator failure-indicator"
      v-show="file.status === false"
      >Error</span
    >
  </component>
</template>

<script setup lang="ts">
import { UploadableFile } from '@/util/file-list'
import FileDisplay from '@/components/FileDisplayIcon.vue'

defineEmits(['remove'])

defineProps({
  file: { type: UploadableFile, required: true },
  tag: { type: String, default: 'li' },
})
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
