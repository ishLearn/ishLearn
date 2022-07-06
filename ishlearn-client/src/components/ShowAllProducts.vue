<script setup lang="ts">
import { defineProps } from 'vue'
import ProductPreview from '@/components/ProductPreview.vue'

defineProps(['projects'])
</script>

<template>
  <div class="grid">
    <ProductPreview v-for="proj in projects" :key="proj.id" :project="proj" />
  </div>
</template>

<style scoped>
.grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(200px, 1fr));
  grid-gap: 20px;
  align-items: stretch;
}
</style>
