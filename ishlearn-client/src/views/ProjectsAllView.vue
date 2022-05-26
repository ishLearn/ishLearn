<script setup lang="ts">
import { onMounted, ref } from 'vue'
import axios from 'axios'
import ShowAllProducts from '@/components/ShowAllProducts.vue'

const allProjects = ref([])
onMounted(() => {
  console.log('foo')
  axios.get('/api/products/').then((res) => {
    console.log(res)
    allProjects.value = res.data
  })
})
</script>

<template>
  <div class="usual-color all-projects">
    <div class="jumbotron">
      <h1>Hier werden alle Projekte angezeigt</h1>
      <p>{{ allProjects }}</p>
      <p><router-link :to="{ name: 'AddProject' }">Füge ein Projekt hinzu.</router-link></p>
    </div>
    <ShowAllProducts :projects="allProjects" />
  </div>
</template>
