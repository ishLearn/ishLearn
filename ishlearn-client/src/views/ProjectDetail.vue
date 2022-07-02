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
import { uploadFiles } from '@/util/file-uploader'
import FilePreviewDownload from '@/components/FilePreviewDownload.vue'
import FilePreviewUpload from '@/components/FilePreviewUpload.vue'

const { files, addFiles, removeFile } = useFileList()

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

const creator: Ref<User | null> = ref(null)
const updater: Ref<User | null> = ref(null)
const editPermission: Ref<boolean> = ref(false)
const showEdit: Ref<boolean> = ref(false)

const projectCreator: Ref<User | null> = ref(null)

const descriptionUpdate = ref(0)

onMounted(async () => {
  project.value = await Product.getProductById(
    typeof pid === 'string' ? pid : pid[0],
    descriptionUpdate,
  )

  editPermission.value = user.user.id === project.value.createdBy
  api.get<User>(`/users/${project.value.createdBy}`).then((res) => {
    creator.value = res.data
  })
  api.get(`/users/${project.value.updatedBy}`).then((res) => {
    updater.value = res.data
  })
})

watch(project, () => descriptionUpdate.value++)

function onInputChange(e) {
  addFiles(e.target.files)
  e.target.value = null
}
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
          <button
            v-if="editPermission"
            class="btn btn-sm btn-secondary edit-button"
            @click.prevent="showEdit = !showEdit"
          >
            {{ showEdit ? 'Bearbeitung beenden' : 'Bearbeiten' }}
          </button>
        </h4>

        <div>
          <ul class="image-list">
            <li v-for="mediaObject of project.media" :key="mediaObject.url">
              <FilePreviewDownload
                :filename="mediaObject.filename"
                :filetype="mediaObject.filename"
                :fileurl="mediaObject.url"
                :show-delete="showEdit"
              />
            </li>
          </ul>
        </div>

        <div class="m-4" v-show="project && editPermission && showEdit">
          <DropZone class="drop-area" @files-dropped="addFiles" #default="{ dropZoneActive }">
            <label for="file-input">
              <ul v-show="files.length" class="image-list">
                <FilePreviewUpload
                  v-for="file of files"
                  :key="file.id"
                  :file="file"
                  :delete-button="true"
                  tag="li"
                  @remove="removeFile"
                />
              </ul>

              <span v-if="dropZoneActive">
                <span>Lasse die Dateien los</span>
                <span class="smaller">um sie hinzuzufügen</span>
              </span>
              <span v-else>
                <span>Ziehe hier deine Dateien rein</span>
                <span class="smaller"
                  >oder <strong>klicke hier</strong> um Dateien auszuwählen</span
                >
              </span>

              <input type="file" id="file-input" multiple @change="onInputChange" />
            </label>
          </DropZone>
          <button class="upload-button" @click.prevent="uploadFiles(files, project.id)">
            Hochladen
          </button>
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
        <h4 class="info-box-title info-box-heading">Projekte, die dich interessieren könnten</h4>
        <p>Coming soon...</p>
      </div>
    </div>
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

.drop-area {
  width: 100%;
  max-width: 800px;
  margin: 0 auto;
  padding: 50px;
  background: #ffffff55;
  box-shadow: 0 0 10px rgba(0, 0, 0, 0.3);
  transition: 0.2s ease;
}
.drop-area[data-active='true'] {
  box-shadow: 0 0 10px rgba(0, 0, 0, 0.5);
  background: #ffffffcc;
}

label {
  font-size: 36px;
  cursor: pointer;
  display: block;
}
label span {
  display: block;
}
label input[type='file']:not(:focus-visible) {
  position: absolute !important;
  width: 1px !important;
  height: 1px !important;
  padding: 0 !important;
  margin: -1px !important;
  overflow: hidden !important;
  clip: rect(0, 0, 0, 0) !important;
  white-space: nowrap !important;
  border: 0 !important;
}
label .smaller {
  font-size: 16px;
}

.image-list {
  display: flex;
  list-style: none;
  flex-wrap: wrap;
  padding: 0;
}
.upload-button {
  display: block;
  appearance: none;
  border: 0;
  border-radius: 50px;
  padding: 0.75rem 3rem;
  margin: 1rem auto;
  font-size: 1.25rem;
  font-weight: bold;
  background: #369;
  color: #fff;
  text-transform: uppercase;
}
button {
  cursor: pointer;
}
</style>
