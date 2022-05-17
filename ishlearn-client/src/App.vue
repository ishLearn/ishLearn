<template>
  <div class="wrapper container">
    <nav>
      <router-link :to="{ name: 'Home' }">Home</router-link> |
      <router-link :to="{ name: 'About' }">About</router-link>
    </nav>
    <router-view />
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue'

// TODO: Example, implement actual code and remove following two lines
const staticNr = ref(0)
console.log(staticNr)
</script>

<style>
@import url('https://fonts.googleapis.com/css2?family=Roboto:wght@100&display=swap');

#app {
  font-family: 'Roboto', Helvetica, Arial, sans-serif;
  -webkit-font-smoothing: antialiased;
  -moz-osx-font-smoothing: grayscale;
  text-align: center;
  color: #2c3e50;
}

nav {
  padding: 30px;
}

nav a {
  font-weight: bold;
  color: #2c3e50;
}

nav a.router-link-exact-active {
  color: #42b983;
}
</style>
