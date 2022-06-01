<script setup lang="ts">
import { ref } from 'vue'
import AuthService from '@/services/auth.service'
import { GenericInputs } from '@/types/GenericInputData'
import SmallForm from '@/components/SmallForm.vue'

const inputs: GenericInputs = {
  username: {
    value: ref(''),
    type: 'text',
    label: 'Dein Benutzername',
    id: 'username',
    name: 'Username',
    mandatory: true,
    placeholder: '',
  },
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
  passwort2: {
    value: ref(''),
    type: 'password',
    label: 'Dein Passwort wiederholen',
    id: 'pwd2',
    name: 'pwd2',
    mandatory: true,
    placeholder: '',
  },
  isSchueler: {
    value: ref(true),
    type: 'checkbox',
    label: 'Bist du Schüler?',
    id: 'issus',
    name: 'issus',
    mandatory: false,
    placeholder: '',
  },
}

const onSignup = (e) => {
  e.preventDefault()

  console.log('Signup Pressed')
  console.log(inputs.username)
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

  if (inputs.passwort.value.value !== inputs.passwort2.value.value) {
    alert('Deine Passwörter sind verschieden!')
    return
  }

  console.log('Send Data to /api/auth/')
  console.log(`username: ${inputs.username.value.value}`)
  console.log(`password: ${inputs.passwort.value.value}`)
  AuthService.register({
    username: inputs.username.value.value,
    email: inputs.email.value.value,
    password: inputs.passwort.value.value,
  })
  console.log('Register successful!')
}
</script>

<template>
  <div>
    <SmallForm
      :title="`Registrierung`"
      :inputs="inputs"
      :submitMessage="'Account erstellen'"
      @onSubmit="onSignup"
    >
      <template #subtitle>
        <p>Erstelle dir hier einen Account</p>
      </template>
      <template #footer>
        <p>
          Du hast bereits einen Account? Dann logge dich
          <router-link :to="{ name: 'UserLogin' }">hier</router-link> ein.
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
