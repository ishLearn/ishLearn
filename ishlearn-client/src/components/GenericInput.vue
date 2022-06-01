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
  <div class="form-group p-2 input-box">
    <label
      :for="inputProps.id"
      :class="`${inputProps.type === 'checkbox' ? 'form-check-label' : ''}`"
      >{{ inputProps.label }}<span v-show="inputProps.mandatory">*</span></label
    >
    <input
      :type="inputProps.type"
      :id="inputProps.id"
      :name="inputProps.name"
      :placeholder="inputProps.placeholder"
      :value="modelValue"
      @input="$emit('update:modelValue', $event.target.value)"
      :class="`${inputProps.type === 'checkbox' ? 'form-check-input' : 'form-control text-input'}`"
    />
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

.input-control {
  background-color: rgba(0, 0, 0, 0.5);
  margin: 20px 0px;
  width: 100%;
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
.input-control-check {
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
