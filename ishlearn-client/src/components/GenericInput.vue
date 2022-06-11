<!-- GenericInput.vue -->
<script setup lang="ts">
// eslint-disable-next-line
import { defineProps, defineEmits, watch, ref } from 'vue'

const props = defineProps(['modelValue', 'inputProps'])
defineEmits(['update:modelValue'])

const mandWarn = ref(false)
if (props.inputProps.mandatory) {
  watch(props.inputProps.value, (oldV, newV) => {
    if (!props.inputProps.value.value) {
      mandWarn.value = true
    } else {
      mandWarn.value = false
    }
  })
}
</script>

<template>
  <div
    :class="`form-group p-2 input-box ${
      inputProps.type === 'checkbox' ? 'form control-check' : ''
    }`"
  >
    <label
      :for="inputProps.id"
      :class="`${
        inputProps.type === 'checkbox' ? 'form-check-label form-label-check' : 'form-label-text'
      }`"
      >{{ inputProps.label }}<span v-show="inputProps.mandatory">*</span></label
    >
    <input
      :type="inputProps.type"
      :id="inputProps.id"
      :name="inputProps.name"
      :placeholder="inputProps.placeholder"
      :value="modelValue"
      @input="$emit('update:modelValue', $event.target.value)"
      :class="`${
        inputProps.type === 'checkbox'
          ? 'form-check-input input-control-check'
          : 'form-control text-input'
      }`"
    />
    <span v-show="mandWarn" class="text-danger">Dieses Feld ist Pflicht!</span>
  </div>
</template>

<style scoped>
.input-box {
  margin: 10px 0px;
}
.form-control {
  margin: 20px 0px;
}
[data-theme='dark'] .text-input {
  background-color: rgba(0, 0, 0, 0.6);
  border-color: rgba(0, 0, 0, 0.6);
  color: var(--text-color);
}
[data-theme='dark'] .text-input:-webkit-autofill {
  background-color: rgba(0, 0, 0, 0.6) !important;
  border-color: var(--hansenberg-blau);
  color: var(--text-color) !important;
}
.input-control {
  background-color: rgba(0, 0, 0, 0.5);
  margin: 20px 0px;
  width: 100%;
}

.form-label-text {
  display: block;
}
.text-input {
  width: 100%;
  height: 40px;
  margin: 5px;
  padding: 3px 7px;
  font-size: 17px;
}

.form-control-check {
  display: flex;
  align-items: center;
  justify-content: space-between;
}

.form-label-check {
  flex: 1;
  display: block;
}
.input-control-check {
  flex: 2;
  height: 20px;
  width: 20px;
}
</style>