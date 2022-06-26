<!-- ProductDetail.vue -->
<script setup lang="ts">
import { onMounted, ref } from 'vue'
import { useRoute } from 'vue-router'
import axios from 'axios'
import { formatDate } from '@/util/dateUtils'
import MDPreview from '@/components/MDPreview.vue'

const mdtext = ref(`# Die Überschrift für mein Projekt
## Kurze Zusammenfassung

Also in meinem Projekt ist das *Kursive* hier **fett** ++wichtig++!

## Erata

Das ist mir nachträglich aufgefallen, was falsch ist.

## Quellen

- Quelle 1
- Buch 2
`)

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

    <MDPreview :text-to-display="mdtext"></MDPreview>
  </div>
</template>
