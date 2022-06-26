<!-- ProductDetail.vue -->
<script setup lang="ts">
import { onMounted, ref } from 'vue'
import { useRoute } from 'vue-router'
import axios from 'axios'
import { formatDate } from '@/util/dateUtils'
import MDPreview from '@/components/MDPreview.vue'
import { User } from '@/types/Users'
import { Product } from '@/types/Products'
import useUser from '@/store/auth.module'

const mdtext = ref(`# Die Überschrift für mein Projekt
## Kurze Zusammenfassung

Also in meinem Projekt ist das *Kursive* hier **fett** ++wichtig++!

## Erata

Das ist mir nachträglich aufgefallen, was falsch ist.

## Quellen

- Quelle 1
- Buch 2
`)

const user: User = useUser()

const pid = useRoute().params.id
const project: ref<Product> = ref({})
// const userCreated: ref<User> = ref({})
onMounted(() => {
  console.log(pid)
  axios.get(`/api/products/${pid}`).then((res) => {
    console.log('Aufruf des Projektes: ')
    console.log(res)
    const [p] = res.data
    project.value = p
    if (project.value.description) mdtext.value = project.value.description
  })
})
</script>

<template>
  <div class="row" v-if="project">
    <div class="col-8">
      <h1>TODO: Projekt {{ $route.params.id }} mit Titel {{ project.title }}</h1>

      <h2>Datein in dem Projekt</h2>
      <p>TODO</p>
      <p>{{ project }}</p>

      <MDPreview :text-to-display="mdtext"></MDPreview>
    </div>
    <div class="col-4">
      <div class="info-box m-2 p-2 border rounded">
        <p class="info-box-title info-box-heading">{{ project.title }}</p>
        <p class="info-box-heading">Erstellt am</p>
        <p class="info-box-content">
          {{ formatDate(project.createDate) }} (
          <!--<router-link
            :to="{ name: 'UserDetail', params: { id: project.createdBy } }"
            >{{ project.createdBy }}</router-link
          >-->
          {{ project.createdBy }})
        </p>
        <p class="info-box-heading">Letzte Änderung</p>
        <p class="info-box-content">{{ formatDate(project.updatedDate) }}</p>
      </div>
    </div>
  </div>
</template>

<style>
.info-box {
  align-content: left;
  text-align: left;
}
.info-box-title {
  font-size: 20px;
}
.info-box-heading {
  font-weight: bold;
  margin-bottom: 0px;
}
.info-box-content {
}
</style>
