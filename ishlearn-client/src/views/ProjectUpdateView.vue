<script setup lang="ts">
import { onMounted, Ref, ref } from 'vue'
import useUser, { UserStoreState } from '@/store/auth.module'
import { GenericInputs } from '@/types/GenericInputData'
import { validateMandatory } from '@/util/inputValidation'
import GenericInput from '@/components/GenericInput.vue'
import { Store } from 'pinia'
import { useRoute } from 'vue-router'
import { setEditPermission } from '@/util/getUser'
import { Product } from '@/types/Products'
import router from '@/router'
import { productRepo } from '../../../server/services/RedisService'
import MDEditor from '../components/MDEditor.vue'
import api from '@/services/api'

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

      <div class="m-2 p-2">
        <h4>Dateien</h4>
      </div>

      <input type="submit" value="Bearbeitung abschließen" class="btn btn-success" />
    </form>

    <p class="tiny-font">(*) sind Pflichtfelder.</p>
  </div>
</template>
