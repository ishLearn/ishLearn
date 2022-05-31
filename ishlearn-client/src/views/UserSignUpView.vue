<script setup lang="ts">
import { ref } from 'vue'
import AuthService from '@/services/auth.service'
import { GenericInputs } from '@/types/GenericInputData'
import GenericInput from '@/components/GenericInput.vue'

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
    value: ref('@gmail.com'),
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
    type: 'password2',
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
  console.log(inputs.isSchueler)

  if (
    Object.keys(inputs).reduce((result, k) => {
      const input = inputs[k]
      if (input.mandatory && !input.value.value) {
        result = true
      }
      return result
    }, false)
  ) {
    alert('Bitte Fülle alle Felder aus!')
    return
  }

  console.log(`${inputs.username.value.value} pwd: ${inputs.username.value.value}`)
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
    <div class="container forms-small">
      <h2>Sign up</h2>

      <p>Trage dich hier ein</p>

      <form @submit="onSignup" class="form-input-group">
        <GenericInput
          v-for="input in inputs"
          :key="input.id"
          v-model="input.value.value"
          :inputProps="input"
        />

        <input type="submit" value="Sign Up" class="btn btn-primary" />
      </form>

      Du has bereits einen account, dann logge dich
      <router-link :to="{ name: 'UserLogin' }">hier</router-link> ein
    </div>
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
  margin: 20px 0;
}
.form-control label {
  display: block;
}
.form-control input[type='text'],
.form-control input[type='passwort'] {
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
