<script setup lang="ts">
import { defineEmits, defineProps } from 'vue'
import GenericInput from '@/components/GenericInput.vue'

const props = defineProps(['title', 'inputs', 'submitMessage'])
defineEmits(['onSubmit'])
</script>

<template>
  <div class="container d-flex justify-content-center">
    <div class="box-background small-width p-3">
      <h2>{{ title }}</h2>

      <slot name="subtitle"></slot>

      <form
        @submit.prevent="$emit('onSubmit', $event)"
        class="form-input-group"
      >
        <GenericInput
          v-for="input in props.inputs"
          :key="input.id"
          v-model="input.value.value"
          :inputProps="input"
        />

        <input
          type="submit"
          :value="props.submitMessage"
          class="btn btn-success"
        />
      </form>

      <slot name="footer"></slot>

      <p class="tiny-font">(*) sind Pflichtfelder.</p>
    </div>
  </div>
</template>

<style scoped>
.form-input-group {
  margin-bottom: 40px;
}

.tiny-font {
  margin-top: 1rem;
  font-size: 10px;
}
</style>
