<template>
  <div>
    <div class="home">
      <h2>Hier h2</h2>
      <img alt="Vue logo" src="../assets/logo.png" />
      <div class="one">Some text for your x.</div>
    </div>
  </div>
</template>

<script setup lang="ts">
import useAuthStore from '@/store/auth.module'
const store = useAuthStore()

if (!store.status.loggedIn) store.initUser().then(() => console.log('Now logged in: ' + store.status.loggedIn))
console.log(store.status.loggedIn)
</script>

<style scoped>
.one {
  background-color: var(--hansenberg-blau);
  color: white;
}
</style>
