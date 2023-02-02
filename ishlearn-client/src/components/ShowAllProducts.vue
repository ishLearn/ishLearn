<script setup lang="ts">
import { defineProps } from 'vue'
import ProductPreview from '@/components/ProductPreview.vue'

const props = defineProps(['projects'])

// console.log(`Size of projects in ShowAllProducts: ${props.projects.length}`)
// console.log(props.projects)
</script>

<template>
  <div class="grid" v-if="projects.length > 0">
    <ProductPreview v-for="proj in projects" :key="proj.id" :project="proj" />
  </div>
  <div class="nothing-to-show" v-else>Noch keine Projekte.</div>
</template>

<style scoped>
.grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(300px, 1fr));
  grid-gap: 20px;
  align-items: stretch;
}
</style>
