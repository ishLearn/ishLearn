<template>
  <div class="usual-color">
    <NavBar />
    <div class="wrapper container">
      <router-view />
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue'
import NavBar from '@/components/NavBar.vue'

// TODO: Example, implement actual code and remove following two lines
const staticNr = ref(0)
console.log(staticNr)

// Code
const storedTheme = localStorage.getItem('theme') || (window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light')
if (storedTheme) {
  document.documentElement.setAttribute('data-theme', storedTheme)
}
</script>

<style scoped></style>
