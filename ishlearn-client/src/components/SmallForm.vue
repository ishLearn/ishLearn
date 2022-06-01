<script setup lang="ts">
import { defineEmits, defineProps } from 'vue'
import { GenericInputs } from '@/types/GenericInputData'
import GenericInput from '@/components/GenericInput.vue'

const props = defineProps(['title', 'inputs', 'submitMessage'])
const emit = defineEmits(['onSubmit'])
</script>

<template>
  <div>
    <div class="container forms-small p-3">
      <h2>{{ title }}</h2>

      <slot name="subtitle"></slot>

      <form @submit="$emit('onSubmit', $event)" class="form-input-group">
        <GenericInput
          v-for="input in props.inputs"
          :key="input.id"
          v-model="input.value.value"
          :inputProps="input"
        />

        <input type="submit" :value="props.submitMessage" class="btn btn-success" />
      </form>

      <slot name="footer"></slot>

      <p class="tiny-font">(*) sind Pflichtfelder.</p>
    </div>
  </div>
</template>

<style scoped>
.forms-small {
  max-width: 540px;
}
[data-theme='light'] .forms-small {
  background-color: white;
  border: 1px solid lightgrey;
  border-radius: 5px;
}
[data-theme='dark'] .forms-small {
  background-color: rgba(0, 0, 0, 0.4);
  border: 1px solid rgba(0, 0, 0, 0.6);
  border-radius: 5px;
}

.form-input-group {
  margin-bottom: 40px;
}

.tiny-font {
  margin-top: 1rem;
  font-size: 10px;
}
</style>
