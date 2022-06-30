<!-- ProductDetail.vue -->
<script setup lang="ts">
import { onMounted, Ref, ref, watch } from 'vue'
import { useRoute } from 'vue-router'
import axios from 'axios'
import api from '@/services/api'
import { formatDate } from '@/util/dateUtils'
import MDPreview from '@/components/MDPreview.vue'
import { Product } from '@/types/Products'
import useUser from '@/store/auth.module'
import { Store } from 'pinia'
import { User } from '@/types/Users'
import DropZone from '@/components/DropZone.vue'
import useFileList from '@/util/file-list'

const { files, addFiles, removeFiles } = useFileList()

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
const creator: Ref<User> = ref({})
const updater: Ref<User> = ref({})
const descriptionUpdate = ref(0)

onMounted(async () => {
  project.value = await Product.getProductById(
    typeof pid === 'string' ? pid : pid[0],
    descriptionUpdate,
  )
  if ('description' in project.value && typeof project.value.description !== 'undefined') {
  }
  api.get(`/users/${project.value.createdBy}`).then((res) => {
    creator.value = res.data
  })
  api.get(`/users/${project.value.createdBy}`).then((res) => {
    updater.value = res.data
  })
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

        <!-- -->
        <div class="m-4">
          <DropZone class="drop-area" @files-dropped="addFiles" #default="{ dropZoneActive }">
            <div v-if="dropZoneActive" class="border rounded">
              <div>Drop Them Here</div>
            </div>
            <div v-else class="border rounded">
              <div>Drag here</div>
            </div>
          </DropZone>
        </div>
        -->

        <p>Space</p>
        <div class="mb-3">
          <label for="formFile" class="form-label">Default file input example</label>
          <input class="form-control" type="file" id="formFile" />
          <button>Hochladen</button>
        </div>

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
          {{ formatDate(project.createDate) }} (<router-link
            v-if="creator.firstName"
            :to="{ name: 'UserDetail', params: { id: creator.id } }"
            >{{ creator.firstName }}</router-link
          >)
        </p>
        <p class="info-box-heading">Letzte Änderung</p>
        <p class="info-box-content">
          {{ formatDate(project.updatedDate) }} (<router-link
            v-if="updater.firstName"
            :to="{ name: 'UserDetail', params: { id: updater.id } }"
            >{{ updater.firstName }}</router-link
          >)
        </p>
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
