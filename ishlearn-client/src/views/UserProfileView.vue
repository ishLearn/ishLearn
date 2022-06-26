<script setup lang="ts">
import { User } from '@/types/Users'
import { ref } from 'vue'
import getUserById from '@/util/getUser'
import { onMounted } from '@vue/runtime-core'
import { useRoute } from 'vue-router'

const uid = useRoute().params.id
console.log(uid)
const user = getUserById(uid)
</script>

<template>
  <div>
    <div class="jumbotron">
      <h1>Demobenutzer?? {{ $route.params.id }}</h1>

      <p>Lorem Ipsum id...</p>

      <p>{{ user }}</p>
    </div>
  </div>
</template>
