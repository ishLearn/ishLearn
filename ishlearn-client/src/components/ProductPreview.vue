<!-- ProductPreview.vue -->
<script setup lang="ts">
import { defineProps } from 'vue'

defineProps(['project'])
</script>

<template>
  <div class="media border p-3 m-2">
    {{ project.title }}
    <p>
      <router-link :to="{ name: 'ViewProject', params: { id: project.id } }"
        >Anschauen!</router-link
      >
    </p>
  </div>
</template>
