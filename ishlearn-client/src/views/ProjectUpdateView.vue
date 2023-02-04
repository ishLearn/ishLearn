<script setup lang="ts">
// NPM imports
import { onMounted, Ref, ref } from 'vue'
import { useRoute } from 'vue-router'

import useUser, { UserStoreState } from '@/store/auth.module'
import api from '@/services/api'
import { Store } from 'pinia'
import router from '@/router'
import useFileList, { UploadableFile } from '@/util/file-list'
import { uploadFiles } from '@/util/file-uploader'
import { setEditPermission } from '@/util/getUser'
import { Product, Visibility } from '@/types/Products'

import useProductsStore from '@/store/products.module'

import { GenericInputData, GenericInputs } from '@/types/GenericInputData'

import { validateMandatory } from '@/util/inputValidation'
// Vue components
import GenericInput from '@/components/GenericInput.vue'
import MDEditor from '@/components/MDEditor.vue'
import FilePreviewDownload from '@/components/FilePreviewDownload.vue'
import FilePreviewUpload from '@/components/FilePreviewUpload.vue'
import DropZone from '@/components/DropZone.vue'
import { isAxiosError } from '@/util/typeguards'

const { files, addFiles, removeFile } = useFileList()

const user: Store<'user', UserStoreState> = useUser()
const products = useProductsStore()

const origin = window.origin

const inputs: GenericInputs<string | boolean> = {
  title: {
    value: ref(''),
    type: 'text',
    label: 'Wähle einen Titel für dein Project',
    id: 'title',
    name: 'title',
    mandatory: true,
    placeholder: '',
  },
  visibility: {
    value: ref(true),
    type: 'checkbox',
    label: 'Soll das Projekt öffentlich sein?',
    id: 'visibility',
    name: 'visibility',
    mandatory: false,
    placeholder: 'true',
  },
}

const pid = useRoute().params.id
const project: Ref<Product | null> = ref(null)

const mdText: Ref<string> = ref('')
const editPermission: Ref<boolean> = ref(false)

const forceUpload: GenericInputData<boolean> = {
  value: ref(false),
  type: 'checkbox',
  label: `Eine Datei mit dem oder einem ähnlichen Namen existiert bereits. 
    Soll es überschrieben werden?`,
  id: 'forceupload',
  name: 'forceupload',
  mandatory: false,
  placeholder: 'false',
}
const showForceUpload = ref(false)

const loadProduct = async () => {
  project.value = await Product.getProductById(typeof pid === 'string' ? pid : pid[0], products)
  inputs.title.value.value = project.value.title
  inputs.visibility.value.value = project.value.visibility === Visibility.PUBLIC ? true : false
  project.value.fetchDescription().then(() => {
    if (project.value?.description) mdText.value = project.value?.description
  })
}
const loadUser = async () => {
  while (user.loading == null) { }
  await user.loading
  if (!user.status.loggedIn) {
    router.push({ name: 'UserLogin', query: { redirect: router.currentRoute.value.path } })
  }
}

const deleteProject = async () => {
  if (project.value?.id == null || typeof project.value?.id === 'undefined') return false
  try {
    await project.value.delete()
    router.push({ name: 'AllProjects' })
  }
  catch (err) {
    console.error(err)

    return false
  }
}

const clickUploadFiles = async () => {
  // Filter already uploaded files
  const filesToUpload = files.value.filter((f: UploadableFile) => f.status !== 'loading' && f.status !== true)

  // Try uploading 
  try {
    if (!project.value?.id) {
      return 'New Files or Project not defined'
    }
    await uploadFiles(filesToUpload, project.value.id, forceUpload.value.value)
    forceUpload.value.value = false

    showForceUpload.value = false
  } catch (err: unknown) {
    if (!isAxiosError(err)) return 'Error code could not be found.'

    if (String(err.status || err.response?.status) === String(413)) {
      showForceUpload.value = false
      return 'File too large to be uploaded'
    }
    if (String(err.status || err.response?.status) === String(400)) {
      showForceUpload.value = true
      return 'Could not upload files, force?'
    } else return `Error with code > 400: ${err.status}`
  }
}

const deleteFile = ({ filename }: { filename: string }) => {
  if (!filename || !project.value) return false
  api.post(`/products/${project.value.id}/media/delete`, {
    filename,
  })
}

onMounted(async () => {
  try {
    await Promise.all([loadProduct(), loadUser()])
    setEditPermission(editPermission, user, project).then(() => {
      if (!editPermission.value) {
        router.push({ name: 'ViewProject', params: { id: project.value?.id } })
      }
    })
  } catch (err) {
    console.log('ERROR: Could not fetch the project')
    console.error(err)
  }
})

const onSubmit = () => {
  if (
    inputs.title.value.value !== project.value?.title ||
    inputs.visibility.value.value !== project.value.visibility
  ) {
    if (!validateMandatory) {
      alert('Das Format deiner Eingabe passt nicht.')
      return
    }
    api.put(`/products/${pid}/`, {
      title: inputs.title.value.value,
      visibility: inputs.visibility.value.value ? Visibility.PUBLIC : Visibility.PRIVATE,
    })
  }

  if (mdText.value !== project.value?.description) {
    if (!validateMandatory(mdText.value)) {
      alert('Das Format deiner Eingabe passt nicht.')
      return
    }

    api.put(`/products/${pid}/description`, {
      description: mdText.value,
    })
  }

  router.push({ name: 'ViewProject', params: { id: project.value?.id } })
}

function onInputChange(e: Event) {
  if (e.target === null) throw new Error('Event wrongly dispatched')

  addFiles((e.target as EventTarget & { files: File[], value: unknown }).files);
  (e.target as EventTarget & { files: File[], value: unknown }).value = null
}
</script>

<template>
  <div v-if="editPermission" class="box-background p-2">
    <h2>Bearbeite dein Projekt:</h2>

    <div class="position-relative">
      <button class="btn btn-lg btn-danger delete-button" @click="deleteProject">
        Projekt löschen
      </button>
    </div>

    <p>Fülle bitte alle notwendigen Felder aus.</p>

    <form @submit.prevent="onSubmit" class="form-input-group" v-if="project">
      <GenericInput v-for="input in inputs" :key="input.id" v-model="input.value.value" :inputProps="input" />
      <div :key="project.description" class="form-group p-2 input-box">
        <label for="md" class="form-label-text">Projektbeschreibung<span v-show="true">*</span></label>
        <MDEditor v-model="mdText" />
        <span v-show="!validateMandatory(mdText)" class="text-danger">Dieses Feld ist Pflicht!<br /></span>
      </div>

      <div class="files p-2">
        <h3>Dateien</h3>
        <ul class="image-list p-2">
          <li v-for="mediaObject of project.media" :key="mediaObject.url">
            <FilePreviewDownload :filename="mediaObject.filename"
              :filetype="mediaObject.fileType || 'notworking/nothing'" :fileurl="`${mediaObject.fileType ? `${origin}/api/files/download/` : ''
              }${mediaObject.url}`" :show-delete="true" @delete="deleteFile" />
          </li>
        </ul>

        <div class="m-4" v-show="project">
          <DropZone class="drop-area" @files-dropped="addFiles" #default="{ dropZoneActive }">
            <label for="file-input">
              <ul v-show="files.length" class="image-list">
                <FilePreviewUpload v-for="file of files" :key="file.id" :file="file" :delete-button="true" tag="li"
                  @remove="removeFile" />
              </ul>

              <span v-if="dropZoneActive">
                <span>Lasse die Dateien los</span>
                <span class="smaller">um sie hinzuzufügen</span>
              </span>
              <span v-else>
                <span>Ziehe hier deine Dateien rein</span>
                <span class="smaller">oder <strong>klicke hier</strong> um Dateien
                  auszuwählen</span>
              </span>

              <input type="file" id="file-input" multiple @change="onInputChange" />
            </label>
          </DropZone>

          <GenericInput :inputProps="forceUpload" v-model="forceUpload.value.value" v-show="showForceUpload" />
          <button class="upload-button" @click.prevent="clickUploadFiles()">
            Hochladen
          </button>
        </div>
      </div>

      <input type="submit" value="Bearbeitung abschließen" class="btn btn-success btn-lg" />
    </form>

    <p class="tiny-font">(*) sind Pflichtfelder.</p>
  </div>
</template>

<style scope>
.files {
  width: 100%;
  max-width: 800px;
  margin: 50px auto;
}

.image-list {
  display: flex;
  list-style: none;
  flex-wrap: wrap;
  padding: 0;
  max-width: 80%;
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

.drop-area label {
  font-size: 36px;
  cursor: pointer;
  display: block;
}

.drop-area label span {
  display: block;
}

.drop-area label input[type='file']:not(:focus-visible) {
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

.drop-area label .smaller {
  font-size: 16px;
}

.upload-button {
  display: block;
  appearance: none;
  border: 0;
  border-radius: 50px;
  padding: 0.75rem 3rem;
  margin: 1rem auto;
  font-size: 1rem;
  font-weight: bold;
  background: #369;
  color: #fff;
  text-transform: uppercase;
}

button {
  cursor: pointer;
}

.delete-button {
  position: absolute;
  right: 0px;
}

.position-relative {
  position: relative;
}
</style>
