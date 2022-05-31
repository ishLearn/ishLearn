<script setup lang="ts">
import { ref } from 'vue'
import AuthService from '@/services/auth.service'

const email = ref('')
const password = ref('')

const onSignup = (e) => {
  e.preventDefault()

  if (!email.value || !password.value) {
    alert('Bitte Fülle alle Felder aus!')
    return
  }

  console.log(`${email.value} pwd: ${password.value}`)
  AuthService.login({
    email: email.value,
    password: password.value,
  })
  console.log('Login tried!')
}
</script>

<template>
  <div class="">
    <h2>Hier kannst du dich einloggen</h2>

    <form @submit="onLogin" class="login-form">
      <div class="form-control">
        <label for="email">Email</label>
        <input type="text" id="email" v-model="email" name="Email" />
      </div>
      <div class="form-control">
        <label for="password">Passwort</label>
        <input type="password" id="password" v-model="password" name="Passwort" />
      </div>

      <div class="form-control">test</div>

      <input type="submit" value="Sign Up" class="btn btn-primary" />
    </form>
  </div>
</template>
