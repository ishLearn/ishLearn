<script setup lang="ts">
import { ref } from 'vue'
import AuthService from '@/services/auth.service'
import { GenericInputs } from '@/types/GenericInputData'
import SmallForm from '@/components/SmallForm.vue'
import router from '@/router';

const inputs: GenericInputs<string> = {
  email: {
    value: ref(''),
    type: 'text',
    label: 'Deine Email',
    id: 'email',
    name: 'Email',
    mandatory: true,
    placeholder: '',
  },
  passwort: {
    value: ref(''),
    type: 'password',
    label: 'Dein Passwort',
    id: 'pwd',
    name: 'pwd',
    mandatory: true,
    placeholder: '',
  },
}

const onSignup = async (e: Event) => {
  e.preventDefault()

  console.log('Signup Pressed')
  console.log(inputs.email)
  console.log(inputs.passwort.value)

  if (
    Object.keys(inputs).reduce((result, k) => {
      const input = inputs[k]
      if (input.mandatory && !input.value.value) {
        result = true
      }
      return result
    }, false)
  ) {
    alert('Bitte fülle alle Pflichtfelder aus!')
    return
  }

  console.log('Send Data to /api/auth/')
  console.log(`email: ${inputs.email.value.value}`)
  console.log(`pwd: ${inputs.passwort.value.value}`)
  console.log('Login tried!')
  await AuthService.login({
    email: inputs.email.value.value,
    password: inputs.passwort.value.value,
  })
  router.push({ name: 'Home' })
}
</script>

<template>
  <div>
    <SmallForm
      :title="`Login`"
      :inputs="inputs"
      :submitMessage="'Einloggen'"
      @onSubmit="onSignup"
    >
      <template #subtitle>
        <p>Melde dich hier an!</p>
      </template>
      <template #footer>
        <p>
          Du hast noch keinen Account? Dann erstelle dir
          <router-link :to="{ name: 'UserSignup' }">hier</router-link> einen.
        </p>
      </template>
    </SmallForm>
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
