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
onMounted(() => {
  console.log(pid)
  axios.get(`/api/products/${pid}`).then((res) => {
    const [p] = res.data
    project.value = p
    console.log(project.value)
    if (project.value.description) mdtext.value = project.value.description
  })
})
</script>

<template>
  <div class="row p-1" v-if="project">
    <div class="col-lg-9">
      <div class="box-background m-1 p-3">
        <h1>{{ project.title }}</h1>

        <h2>Dateien in dem Projekt</h2>
        <p>TODO</p>
        <p>{{ project }}</p>

        <MDPreview :text-to-display="mdtext"></MDPreview>
      </div>
    </div>

    <div class="col-lg-3">
      <div class="box-background info-box m-1 p-2">
        <h4 class="info-box-title info-box-heading">{{ project.title }}</h4>
        <p class="info-box-heading">Erstellt am</p>
        <p class="info-box-content">
          {{ formatDate(project.createDate) }} (
          <!--<router-link :to="{ name: 'UserDetail', params: { id: userCreated } }">{{
            project.createdBy
          }}</router-link>-->
          {{ project.createdBy }})
        </p>
        <p class="info-box-heading">Letzte Änderung</p>
        <p class="info-box-content">{{ formatDate(project.updatedDate) }}</p>
      </div>
      <div class="box-background m-1 p-2">
        <h4>Projekte, die dich interessieren könnten</h4>
        <p>Coming soon...</p>
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
  font-size: 24px;
}
.info-box-heading {
  font-weight: bold;
  margin-bottom: 0px;
}
.info-box-content {
}
</style>
