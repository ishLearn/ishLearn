<!-- ProductDetail.vue -->
<script setup lang="ts">
import { onMounted, Ref, ref, watch } from 'vue'
import { useRoute } from 'vue-router'
import { Store } from 'pinia'
// utils and functions
import useUser, { UserStoreState } from '@/store/auth.module'
import { getUser, setEditPermission } from '@/util/getUser'
import { User } from '@/types/Users'
import { Product, Visibility } from '@/types/Products'
import { formatDate } from '@/util/dateUtils'

import useProductsStore from '@/store/products.module'

// Vue imports
import MDPreview from '@/components/MDPreview.vue'
import FilePreviewDownload from '@/components/FilePreviewDownload.vue'
import IconEye from '@/icons/IconEye.vue'
import IconEyeSlash from '../icons/IconEyeSlash.vue'

const user: Store<'user', UserStoreState> = useUser()
const productsStore = useProductsStore()

const origin = window.origin

const project: Ref<Product | null> = ref(null)

const creator: Ref<User | null> = ref(null)
const updater: Ref<User | null> = ref(null)
const editPermission: Ref<boolean> = ref(false)
const unableToLoad: Ref<boolean> = ref(false)

const descriptionUpdate = ref(0)

const descriptionFetchingFinished: Ref<boolean> = ref(false)
const mediaMetaFetchingFinished: Ref<boolean> = ref(false)

onMounted(async () => {
  try {
    const pid = useRoute().params.id
    await user.loading
    project.value = await Product.getProductById(
      typeof pid === 'string' ? pid : pid[0],
      productsStore,
      descriptionUpdate,
    )

    if (!project.value) throw new Error(`Project has not loaded in ProjectDetail; ${pid}`)

    if (user.loading !== null) await user.loading

    setEditPermission(editPermission, user, project)
    getUser(creator, project.value.createdBy)
    getUser(updater, project.value.updatedBy)

    project.value.fetchDescription(descriptionUpdate).then((worked: boolean) => descriptionFetchingFinished.value = worked)
    project.value.fetchMediaMeta().then((worked: boolean) => mediaMetaFetchingFinished.value = worked)

  } catch (err) {
    console.log('ERROR: Fehler beim Laden des Projektes')
    console.error(err)
    unableToLoad.value = true
  }
})

watch(project, () => descriptionUpdate.value++)
</script>

<template>
  <div class="row p-1" v-if="
    project &&
    'title' in project &&
    'createDate' in project &&
    typeof project.createDate !== 'undefined' &&
    'updatedDate' in project &&
    typeof project.updatedDate !== 'undefined'
  ">
    <div class="col-lg-9">
      <div class="box-background m-1 p-3">
        <h2 class="pos-rel">
          {{ project.title }}
          <span v-if="editPermission" class="put-right">
            <IconEye v-if="project.visibility === Visibility.PUBLIC" class="icon" />
            <IconEyeSlash v-else class="icon" />
          </span>
        </h2>

        <h4 class="pos-rel">
          Dateien in dem Projekt
          <router-link v-if="editPermission" :to="{ name: 'UpdateProject', params: { id: project.id } }">
            <!-- <button class="btn btn-sm btn-secondary edit-button">
              Bearbeiten
            </button> -->
            <button class="btn btn-sm btn-secondary put-right">
              Bearbeiten
            </button>
          </router-link>
        </h4>

        <div>
          <ul class="image-list" v-if="
            mediaMetaFetchingFinished &&
            project.media &&
            project.media.length > 0
          ">
            <li v-for="mediaObject of project.media" :key="mediaObject.url">
              <FilePreviewDownload :filename="mediaObject.filename"
                :filetype="mediaObject.fileType || 'notworking/nothing'" :fileurl="`${mediaObject.fileType ? `${origin}/api/files/download/` : ''
                }${mediaObject.url}`" :show-delete="false" />
            </li>
          </ul>
          <h6 v-else>Es gibt in diesem Projekt keine Dateien.</h6>
        </div>

        <span v-if="descriptionFetchingFinished && project.description" :key="descriptionUpdate">
          <MDPreview :text-to-display="project.description"></MDPreview>
        </span>
      </div>
    </div>

    <div class="col-lg-3">
      <div class="box-background info-box m-1 p-2">
        <h4 class="info-box-title info-box-heading">{{ project.title }}</h4>
        <p class="info-box-heading">Erstellt am</p>
        <p class="info-box-content">
          {{ formatDate(project.createDate) }} (<router-link v-if="creator"
            :to="{ name: 'UserDetail', params: { id: creator.id } }">{{ creator.firstName }}</router-link>)
        </p>
        <p class="info-box-heading">Letzte Änderung</p>
        <p class="info-box-content">
          {{ formatDate(project.updatedDate) }} (<router-link v-if="updater"
            :to="{ name: 'UserDetail', params: { id: updater.id } }">{{ updater.firstName }}</router-link>)
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

.image-list {
  display: flex;
  list-style: none;
  flex-wrap: wrap;
  padding: 0;
}

.icon {
  height: 2rem;
  width: 2rem;
}
</style>
