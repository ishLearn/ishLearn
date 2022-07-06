<!-- ProductDetail.vue -->
<script setup lang="ts">
import { onMounted, Ref, ref, watch } from 'vue'
import { useRoute } from 'vue-router'
import { Store } from 'pinia'
// utils and functions
import useUser, { UserStoreState } from '@/store/auth.module'
import { getUser, setEditPermission } from '@/util/getUser'
import { User } from '@/types/Users'
import { Product } from '@/types/Products'
import { formatDate } from '@/util/dateUtils'
import useFileList from '@/util/file-list'
import { uploadFiles } from '@/util/file-uploader'
// Vue imports
import DropZone from '@/components/DropZone.vue'
import MDPreview from '@/components/MDPreview.vue'
import FilePreviewDownload from '@/components/FilePreviewDownload.vue'
import FilePreviewUpload from '@/components/FilePreviewUpload.vue'

const user: Store<'user', UserStoreState> = useUser()

const origin = window.origin

const project: Ref<Product | null> = ref(null)

const creator: Ref<User | null> = ref(null)
const updater: Ref<User | null> = ref(null)
const editPermission: Ref<boolean> = ref(false)
const unableToLoad: Ref<boolean> = ref(false)

const descriptionUpdate = ref(0)

onMounted(async () => {
  try {
    const pid = useRoute().params.id
    project.value = await Product.getProductById(
      typeof pid === 'string' ? pid : pid[0],
      descriptionUpdate,
    )
    await user.loading

    setEditPermission(editPermission, user, project)
    getUser(creator, project.value.createdBy)
    getUser(updater, project.value.updatedBy)
    project.value.fetchDescription(descriptionUpdate)
    project.value.fetchMediaMeta()
  } catch (err) {
    console.log('Fehler beim Laden des Projektes')
    console.log(err)
    unableToLoad.value = true
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

        <h4>
          Dateien in dem Projekt
          <router-link
            v-if="editPermission"
            :to="{ name: 'UpdateProject', params: { id: project.id } }"
          >
            <button class="btn btn-sm btn-secondary button edit-button">Bearbeiten</button>
          </router-link>
        </h4>

        <div>
          <ul class="image-list">
            <li v-for="mediaObject of project.media" :key="mediaObject.url">
              <FilePreviewDownload
                :filename="mediaObject.filename"
                :filetype="mediaObject.fileType || 'notworking/nothing'"
                :fileurl="`${
                  mediaObject.fileType ? `${origin}/api/files/download/` : ''
                }${mediaObject.url}`"
                :show-delete="false"
              />
            </li>
          </ul>
        </div>

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
            v-if="creator"
            :to="{ name: 'UserDetail', params: { id: creator.id } }"
            >{{ creator.firstName }}</router-link
          >)
        </p>
        <p class="info-box-heading">Letzte Änderung</p>
        <p class="info-box-content">
          {{ formatDate(project.updatedDate) }} (<router-link
            v-if="updater"
            :to="{ name: 'UserDetail', params: { id: updater.id } }"
            >{{ updater.firstName }}</router-link
          >)
        </p>
      </div>
      <div class="box-background info-box m-1 p-2">
        <h4 class="info-box-title info-box-heading">Tags</h4>
        Coming soon...
      </div>

      <div class="box-background info-box m-1 p-2">
        <h4 class="info-box-title info-box-heading">
          Projekte, die dich interessieren könnten
        </h4>
        <p>Coming soon...</p>
      </div>
    </div>
  </div>
  <div v-else-if="unableToLoad" class="m-2 p-3 alert alert-danger">
    <h2>Dieses Projekt scheint nicht zu existieren</h2>
    <p>
      Entweder ist die URL falsch und das Projekt existiert nicht, oder es ist
      inzwischen vom Besitzer auf privat gestellt worden.
    </p>
  </div>
</template>

<style scoped>
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

h4 {
  position: relative;
}
.edit-button {
  position: absolute;
  right: 0px;
}

.image-list {
  display: flex;
  list-style: none;
  flex-wrap: wrap;
  padding: 0;
}
</style>
