<script setup lang="ts">
import { ref } from 'vue'
import MDEditor from '@/components/MDEditor.vue'
import MDPreview from '@/components/MDPreview.vue'
import GenericInput from '@/components/GenericInput.vue'
import { GenericInputs } from '@/types/GenericInputData'

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
    value: ref(false),
    type: 'checkbox',
    label: 'Soll das Projekt öffentlich sein?',
    id: 'visibility',
    name: 'visibility',
    mandatory: true,
    placeholder: '',
  },
}

const mdtext = ref(`# Hier ist eine Test MD
Lorem Ipsum xx.xx
Datei von mir geschrieben, damit du was hast.

----
Hallo xD xD`)

const onSubmit = (event) => {
  console.log('Submitted')

  // alle Eingaben auf Richtigkeit überprüfen.

  console.log(event)
}
</script>

<template>
  <div>
    <div class="container forms-small p-3">
      <h1>Hier kannst du dein Projekt hinzufügen.</h1>

      <p>Fülle bitte alle notwendigen Felder aus.</p>

      <form @submit.prevent="onSubmit" class="form-input-group">
        <GenericInput
          v-for="input in inputs"
          :key="input.id"
          v-model="input.value.value"
          :inputProps="input"
        />
        <p>Projektbeschreibung</p>
        <MDEditor v-model="mdtext" />

        <input type="submit" value="Projekt erstellen" class="btn btn-success" />
      </form>

      <p class="tiny-font">(*) sind Pflichtfelder.</p>
    </div>

    <button class="btn btn-primary">Dieser Knopft Submitted nichts</button>

    <p>{{ mdtext }}</p>
    <MDPreview :text-to-display="mdtext"></MDPreview>
    <br />
  </div>
</template>
