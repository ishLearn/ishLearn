<!-- ProductDetail.vue -->
<script setup lang="ts">
import { onMounted, Ref, ref, watch } from 'vue'
import { useRoute } from 'vue-router'
import axios from 'axios'
import { formatDate } from '@/util/dateUtils'
import MDPreview from '@/components/MDPreview.vue'
import { Product } from '@/types/Products'
import useUser from '@/store/auth.module'
import { Store } from 'pinia'

const mdtext = ref(`# Die Überschrift für mein Projekt
## Kurze Zusammenfassung

Also in meinem Projekt ist das *Kursive* hier **fett** ++wichtig++!

## Erata

Das ist mir nachträglich aufgefallen, was falsch ist.

## Quellen

- Quelle 1
- Buch 2
`)

const user: Store<'user'> = useUser()

const pid = useRoute().params.id
const project: Ref<Product | null> = ref(null)

const descriptionUpdate = ref(0)

onMounted(async () => {
  project.value = await Product.getProductById(
    typeof pid === 'string' ? pid : pid[0],
    descriptionUpdate,
  )
  if ('description' in project.value && typeof project.value.description !== 'undefined') {
  }
})

watch(project, () => descriptionUpdate.value++)
</script>

<template>
  <div
    class="row p-1"
    v-if="
      project &&
      'title' in project &&
      'createDate' in project &&
      typeof project.createDate !== 'undefined' &&
      'updatedDate' in project &&
      typeof project.updatedDate !== 'undefined'
    "
  >
    <div class="col-lg-9">
      <div class="box-background m-1 p-3">
        <h1>{{ project.title }}</h1>

        <h2>Dateien in dem Projekt</h2>
        <p>TODO</p>

        <span v-show="false">
          {{ descriptionUpdate }}
        </span>
        <span v-if="project.description" :key="descriptionUpdate">
          <MDPreview :text-to-display="project.description"></MDPreview>
        </span>
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
