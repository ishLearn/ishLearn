<script setup lang="ts">
import { onMounted, Ref, ref } from 'vue'
import useUser, { UserStoreState } from '@/store/auth.module'
import api from '@/services/api'
import { Store } from 'pinia'
import { useRoute } from 'vue-router'
import router from '@/router'
import useFileList from '@/util/file-list'
import { uploadFiles } from '@/util/file-uploader'
import { setEditPermission } from '@/util/getUser'
import { Product } from '@/types/Products'
import { GenericInputs } from '@/types/GenericInputData'
import GenericInput from '@/components/GenericInput.vue'
import { validateMandatory } from '@/util/inputValidation'
import MDEditor from '@/components/MDEditor.vue'
import FilePreviewDownload from '@/components/FilePreviewDownload.vue'
import FilePreviewUpload from '@/components/FilePreviewUpload.vue'
import DropZone from '@/components/DropZone.vue'

const { files, addFiles, removeFile } = useFileList()

const user: Store<'user', UserStoreState> = useUser()

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

const mdtext: Ref<string> = ref('')
const editPermission: Ref<boolean> = ref(false)

const loadProduct = async () => {
  project.value = await Product.getProductById(typeof pid === 'string' ? pid : pid[0])
  inputs.title.value.value = project.value.title
  inputs.visibility.value.value = project.value.visibility
  project.value.fetchDescription().then(() => {
    if (project.value?.description) mdtext.value = project.value?.description
  })
}
const loadUser = async () => {
  while (user.loading == null) {}
  await user.loading
  if (!user.status.loggedIn) {
    router.push({ name: 'UserLogin', query: { redirect: router.currentRoute.value.path } })
  }
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
    console.log('Fehler beim Laden des Projektes')
    console.log(err)
  }
})

const onSubmit = (_event: Event) => {
  console.log('Submit Edit')
  console.log(_event)

  if (
    inputs.title.value.value !== project.value?.title ||
    inputs.visibility.value.value !== project.value.visibility
  ) {
    if (!validateMandatory) {
      alert('Das Format deiner Eingabe passt nicht.')
      return
    }
    console.log('Title changed')
    api.put(`/products/${pid}/`, {
      title: inputs.title.value.value,
      visibility: inputs.visibility.value.value || true,
    })
  }

  if (mdtext.value !== project.value?.description) {
    if (!validateMandatory(mdtext.value)) {
      alert('Das Format deiner Eingabe passt nicht.')
      return
    }
  }

  router.push({ name: 'ViewProject', params: { id: project.value.id } })
}

function onInputChange(e) {
  addFiles(e.target.files)
  e.target.value = null
}
</script>

<template>
  <div v-if="editPermission" class="box-background p-2">
    <h2>Bearbeite dein Projekt:</h2>

    <p>Fülle bitte alle notwendigen Felder aus.</p>

    <form @submit.prevent="onSubmit" class="form-input-group">
      <GenericInput
        v-for="input in inputs"
        :key="input.id"
        v-model="input.value.value"
        :inputProps="input"
      />

      <div class="form-group p-2 input-box">
        <label for="md" class="form-label-text"
          >Projektbeschreibung<span v-show="true">*</span></label
        >
        <MDEditor v-if="project.description" v-model="mdtext" />
        <span v-show="!validateMandatory(mdtext)" class="text-danger"
          >Dieses Feld ist Pflicht!<br
        /></span>
      </div>

      <div class="files p-2">
        <h4>Dateien</h4>
        <ul class="image-list p-2">
          <li v-for="mediaObject of project.media" :key="mediaObject.url">
            <FilePreviewDownload
              :filename="mediaObject.filename"
              :filetype="mediaObject.filename"
              :fileurl="mediaObject.url"
              :show-delete="true"
            />
          </li>
        </ul>

        <div class="m-4" v-show="project">
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
      </div>

      <input type="submit" value="Bearbeitung abschließen" class="btn btn-success" />
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
