<script setup lang="ts">
import { ref } from 'vue'
import AuthService from '@/services/auth.service'
import GenericInput from '@/components/GenericInput.vue'

const username = ref('')
const email = ref('')
const password = ref('')
const passwordwdh = ref('')
const isSchueler = ref(true)

let testV = ''
testV = 'a'
const test = {
  label: 'Dein Benutzername',
  id: 'username',
  name: 'Username',
  value: testV,
  mandatory: true,
  placeholder: '',
}

const onSignup = (e) => {
  e.preventDefault()

  console.log(testV)

  if (!username.value || !email.value || !password.value) {
    alert('Bitte Fülle alle Felder aus!')
    return
  }

  console.log(`${username.value} pwd: ${password.value}`)
  AuthService.register({
    username: username.value,
    email: email.value,
    password: password.value,
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
        <GenericInput :InputData="test" />
        <div class="form-control">
          <label for="username">Benutzername</label>
          <input
            type="text"
            id="username"
            v-model="username"
            name="username"
            placeholder="Dein Benutzername"
            class="textinput textInput form-control"
          />
        </div>
        <div class="form-control">
          <label for="email">Email</label>
          <input type="text" id="email" v-model="email" name="Email" />
        </div>
        <div class="form-control">
          <label for="password">Passwort</label>
          <input type="password" id="password" v-model="password" name="Passwort" />
        </div>
        <div class="form-control">
          <label for="password-wdh">Passwort wiederholen</label>
          <input type="password" id="password-wdh" v-model="passwordwdh" name="Passwort2" />
        </div>
        <div class="form-control">
          <label for="isSchueler">Bist du ein Schüler?</label>
          <input type="checkbox" id="schueler" v-model="isSchueler" name="schueler" />
        </div>

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
.form-control input {
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
