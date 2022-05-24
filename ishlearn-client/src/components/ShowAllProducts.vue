<script setup lang="ts">
import { defineProps } from 'vue'
import ProductPreview from './ProductPreview.vue'

defineProps(['projects'])
</script>

<template>
  <div>
    <ProductPreview v-for="proj in projects" :key="proj.id" :project="proj" />
  </div>
</template>
