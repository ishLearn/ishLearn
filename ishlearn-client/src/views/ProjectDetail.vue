<!-- ProductDetail.vue -->
<script setup lang="ts">
import { onMounted, ref } from 'vue'
import { useRoute } from 'vue-router'
import axios from 'axios'
import { formatDate } from '@/util/dateUtils'

const pid = useRoute().params.id
const project = ref({})
onMounted(() => {
  console.log(pid)
  axios.get(`/api/products/${pid}`).then((res) => {
    console.log('Aufruf des Projektes: ')
    console.log(res)
    const [p] = res.data
    project.value = p
  })
})
</script>

<template>
  <div class="jumbotron" v-if="project">
    <h1>TODO: Projekt {{ $route.params.id }} mit Titel {{ project.title }}</h1>
    <p>Erstellt: {{ formatDate(project.createDate) }}</p>
    <p>letzte Änderung: {{ formatDate(project.updatedDate) }}</p>

    <p></p>
    <p>{{ project }}</p>
  </div>
</template>
