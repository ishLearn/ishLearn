<script setup lang="ts">
import { ref } from 'vue'

const count = ref(0)
</script>

<template>
  <div>
    <nav class="navbar navbar-expand-sm bg-light">
      <ul class="navbar-nav">
        <li class="nav-item">
          <button @click="count++" class="btn btn-secondary">
            You clicked me {{ count }} times.
          </button>
        </li>
        <li class="nav-item"><router-link :to="{ name: 'Home' }">Home</router-link></li>
        <li class="nav-item"><router-link :to="{ name: 'About' }">About</router-link></li>
      </ul>
    </nav>
  </div>
</template>

<style scoped>

</style>
