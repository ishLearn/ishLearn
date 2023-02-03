<script setup lang="ts">
import { ref } from 'vue'
import api from '@/services/api'
import { validateMandatory } from '@/util/inputValidation'
import { GenericInputs } from '@/types/GenericInputData'
import useUser, { UserStoreState } from '@/store/auth.module'
import router from '@/router'
import MDEditor from '@/components/MDEditor.vue'
import GenericInput from '@/components/GenericInput.vue'
import { AxiosResponse } from 'axios'
import { Store } from 'pinia'

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

const mdtext = ref(`# Die Überschrift für mein Projekt
## Kurze Zusammenfassung

Also in meinem Projekt ist das *Kursive* hier **fett** ++wichtig++!

## Erata

Das ist mir nachträglich aufgefallen, was falsch ist.

## Quellen

- Quelle 1
- Buch 2
`)

const onSubmit = () => {
  if (!user.status.loggedIn) {
    alert('Du musst eingeloggt sein, um ein Projekt zu erstellen!')
    return
  }

  if (
    !Object.keys(inputs).reduce((result, k) => {
      if (inputs[k].mandatory) result = result && validateMandatory(inputs[k].value.value)
      return result
    }, true) ||
    !validateMandatory(mdtext.value)
  ) {
    alert('Das Format deiner Eingabedaten ist nicht korrekt!')
    return
  }

  try {
    api
      .post('/products/', {
        title: inputs.title.value.value,
        visibility: inputs.visibility.value.value,
        collaborators: [],
        description: mdtext.value,
      })
      .then((res: AxiosResponse) => {
        router.push({ name: 'ViewProject', params: { id: res.data.id } })
      })
  } catch (err) {
    console.log('ERROR: Something went wrong adding the project:')
    console.error(err)
  }
}
</script>

<template>
  <div>
    <div class="container p-3">
      <h2>Hier kannst du dein Projekt hinzufügen.</h2>

      <p v-show="!user.status.loggedIn" class="text-danger">
        Du musst dich erst einloggen, um ein Projekt zu erstellen!
      </p>

      <p>Fülle bitte alle notwendigen Felder aus.</p>

      <form @submit.prevent="onSubmit" class="form-input-group">
        <GenericInput v-for="input in inputs" :key="input.id" v-model="input.value.value" :inputProps="input" />

        <div class="form-group p-2 input-box">
          <label for="md" class="form-label-text">Projektbeschreibung<span v-show="true">*</span></label>
          <MDEditor v-model="mdtext" />
          <span v-show="!validateMandatory(mdtext)" class="text-danger">Dieses Feld ist Pflicht!<br /></span>
        </div>

        <div class="m-2 p-2">
          Dateien kannst du später zu deinem Projekt hinzufügen, wenn du es erstellt hast.
        </div>

        <input type="submit" value="Projekt erstellen" class="btn btn-success" />
      </form>

      <p class="tiny-font">(*) sind Pflichtfelder.</p>
    </div>
  </div>
</template>

<style>
.input-box {
  margin: 30px 0px;
}

.form-label-text {
  display: block;
  margin: 10px 0px;
}
</style>
