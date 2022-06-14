<template>
  <div class="usual-color">
    <NavBar />
    <div class="wrapper container">
      <router-view />
    </div>
  </div>
</template>

<script setup lang="ts">
import NavBar from '@/components/NavBar.vue'

// Code
const storedTheme = localStorage.getItem('theme') || (window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light')
if (storedTheme) {
  document.documentElement.setAttribute('data-theme', storedTheme)
}
</script>

<style scoped></style>
