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
import useAuthStore from '@/store/auth.module'
const store = useAuthStore()

// User Login
if (!store.status.loggedIn) store.initUser()

// Color Theme
const storedTheme =
  localStorage.getItem('theme') ||
  (window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light')
if (storedTheme) {
  document.documentElement.setAttribute('data-theme', storedTheme)
}
</script>

<style scoped></style>
