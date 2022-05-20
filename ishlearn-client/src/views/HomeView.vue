<template>
  <div class="home">
    <h2>Hier h2 </h2>
    <img alt="Vue logo" src="../assets/logo.png">
    <HelloWorld msg="Welcome to Your FIRST Vue.js + TypeScript App"/>
  </div>
</template>

<script lang="ts">
import { defineComponent } from 'vue';
import HelloWorld from '@/components/HelloWorld.vue'; // @ is an alias to /src

export default defineComponent({
  name: 'HomeView',
  components: {
    HelloWorld,
  },
});
</script>
