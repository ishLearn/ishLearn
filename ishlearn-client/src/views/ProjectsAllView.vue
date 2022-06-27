<script setup lang="ts">
import { onMounted, ref } from 'vue'
import ShowAllProducts from '@/components/ShowAllProducts.vue'
import api from '@/services/api'

const allProjects = ref([])

onMounted(() => {
  console.log('Getting projects using the api service')
  api.get('/products/page/0').then((res: { data: [] }) => {
    console.log(res)
    allProjects.value = res.data
  })
})
</script>

<template>
  <div class="all-projects">
    <div class="jumbotron">
      <h1>Hier werden alle Projekte angezeigt</h1>
      <p>
        <router-link :to="{ name: 'AddProject' }">Füge ein Projekt hinzu.</router-link>
      </p>
    </div>
    <ShowAllProducts :projects="allProjects" />
  </div>
</template>
