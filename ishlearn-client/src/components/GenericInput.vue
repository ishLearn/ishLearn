<!-- GenericInput.vue -->
<script setup lang="ts">
import { defineProps } from 'vue'

const idda = defineProps(['InputData'])

const checkMandatory = (event) => {
  console.log('Here bin ich in der funtkion')
  console.log(idda.value)
  if (idda.mandatory) {
    console.log('Mand')
  }
}
</script>

<template>
  <div>
    <label :for="InputData.id"
      >{{ InputData.label }}<span v-show="InputData.mandatory">*</span></label
    >
    <input
      type="text"
      :id="InputData.id"
      :name="InputData.name"
      v-model="InputData.value"
      :placeholder="InputData.placeholder"
      @input="checkMandatory"
    />
  </div>
</template>
