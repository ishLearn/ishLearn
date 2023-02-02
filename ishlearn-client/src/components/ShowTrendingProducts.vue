<script setup lang="ts">
import { Product } from '@/types/Products'
import { Ref, ref } from 'vue'
import ShowAllProducts from './ShowAllProducts.vue'

const project: Ref<Product[]> = ref([])

try {
  project.value = await Product.getTrendingProducts()
} catch (err) {
  console.log('Could not fetch trending products')
}
</script>

<template>
  <div class="container">
    <h3>Aktuell beliebte Produkte</h3>
    <ShowAllProducts projects="projects" />
  </div>
</template>

<style scoped>
h3 {
  margin: 1rem;
}
</style>