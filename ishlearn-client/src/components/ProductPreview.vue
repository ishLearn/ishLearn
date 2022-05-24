<!-- ProductPreview.vue -->
<script setup lang="ts">
import { defineProps } from 'vue'

defineProps(['project'])
</script>

<template>
  <div>
    <div class="media border p-3">
      {{ project.title }}
    </div>
  </div>
</template>
