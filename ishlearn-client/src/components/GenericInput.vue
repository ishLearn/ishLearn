<!-- GenericInput.vue -->
<script setup lang="ts">
import { defineProps, defineEmits } from 'vue'

const props = defineProps(['modelValue', 'inputProps'])
defineEmits(['update:modelValue'])

console.log('in generic input')
console.log(props.modelValue)

const checkMandatory = (event) => {
  console.log('Here bin ich in der funtkion')
  console.log(props.modelValue)
  if (props.inputProps.mandatory) {
    console.log('Mand')
  }
}
</script>

<template>
  <div :class="`form-control ${inputProps.type === 'checkbox' ? 'form-control-check' : ''}`">
    <label :for="inputProps.id"
      >{{ inputProps.label }}<span v-show="inputProps.mandatory">*</span></label
    >
    <input
      :type="inputProps.type"
      :id="inputProps.id"
      :name="inputProps.name"
      :placeholder="inputProps.placeholder"
      :value="modelValue"
      @input="$emit('update:modelValue', $event.target.value)"
      :class="`textinput textInput ${
        inputProps.type === 'checkbox' ? 'form-control-check' : 'form-control'
      }`"
    />
  </div>
</template>

<style scoped>
.forms-small {
  max-width: 540px;
}
.form-input-group {
  margin-bottom: 40px;
}
.form-control {
  margin: 20px 0px;
}
.form-control label {
  display: block;
}
.form-control input [type='text'],
.form-control input [type='password'] {
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
.form-control-check label {
  flex: 1;
}
.form-control-check input {
  flex: 2;
  height: 20px;
}
</style>
