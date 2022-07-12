<!-- GenericInput.vue -->
<script setup lang="ts">
// eslint-disable-next-line
import { defineProps, defineEmits, watch, ref, onMounted, onUpdated } from 'vue'
import { validateEmail, validatePasswort, validateMandatory } from '@/util/inputValidation'

const props = defineProps(['modelValue', 'inputProps'])
const emit = defineEmits(['update:modelValue'])

const mandWarn = ref(false)
if (props.inputProps.mandatory) {
  watch(props.inputProps.value, () => {
    mandWarn.value = !validateMandatory(props.inputProps.value.value)
  })
}
const pwdLengthWarn = ref(false)
if (props.inputProps.type === 'password') {
  watch(props.inputProps.value, () => {
    pwdLengthWarn.value = !validatePasswort(props.inputProps.value.value)
  })
}
const emailWarn = ref(false)
if (props.inputProps.type === 'email') {
  watch(props.inputProps.value, () => {
    emailWarn.value = !validateEmail(props.inputProps.value.value)
  })
}
onMounted(() => {
  const el: HTMLElement | null = document.getElementById(props.inputProps.id)
  if (props.inputProps.type === 'checkbox' && el !== null) {
    (el as HTMLInputElement).defaultChecked = props.modelValue
  }
})
onUpdated(() => {
  const el = document.getElementById(props.inputProps.id)
  if (props.inputProps.type === 'checkbox' && el !== null) {
    (el as HTMLInputElement).checked = props.modelValue
  }
})

const customEmit = (event: Event) => {
  if (props.inputProps.type === 'checkbox') {
    emit('update:modelValue', !props.inputProps.value.value)
  } else {
    emit('update:modelValue', (event.target as HTMLInputElement | null)?.value)
  }
}
</script>

<template>
  <div :class="`form-group p-2 input-box ${inputProps.type === 'checkbox' ? 'form control-check' : ''
  }`">
    <label :for="inputProps.id" :class="`${inputProps.type === 'checkbox'
    ? 'form-check-label form-label-check'
    : 'form-label-text'
    }`">{{ inputProps.label }}<span v-show="inputProps.mandatory">*</span>
    </label>
    <!-- Special input type: textarea -->
    <textarea v-if="inputProps.type == 'textarea'" :id="inputProps.id" :name="inputProps.name"
      :placeholder="inputProps.placeholder" :value="modelValue" rows="4"
      @input="$emit('update:modelValue', ($event.target as HTMLInputElement | null)?.value)"
      class="form-control text-input">
    </textarea>
    <!-- Normal inputs (text, password, email, date, checkbox ) -->
    <input v-else :type="inputProps.type" :id="inputProps.id" :name="inputProps.name"
      :placeholder="inputProps.placeholder" :value="modelValue" @input="customEmit($event)" :class="`${inputProps.type === 'checkbox'
      ? 'form-check-input input-control-check'
      : 'form-control text-input text-oneline-height'
      }`" />
    <span v-show="mandWarn" class="text-danger">Dieses Feld ist Pflicht!<br /></span>
    <span v-show="pwdLengthWarn" class="text-danger">Das Passwort muss mindestens 8 Zeichen lang sein.<br /></span>
    <span v-show="emailWarn" class="text-danger">Bitte gib eine korrekte Email ein.<br /></span>
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
  margin: 5px;
  padding: 3px 7px;
  font-size: 17px;
}

.text-oneline-height {
  height: 40px;
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
