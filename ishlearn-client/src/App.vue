<template>
  <div class="wrapper container">
    <NavBar />
    <router-view />
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue'
import NavBar from '@/components/NavBar.vue'

// TODO: Example, implement actual code and remove following two lines
const staticNr = ref(0)
console.log(staticNr)
</script>

<style scoped>

</style>
