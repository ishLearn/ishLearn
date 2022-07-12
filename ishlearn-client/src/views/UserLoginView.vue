<script setup lang="ts">
// Node Modules
import { onMounted, ref } from 'vue'
import { useRoute } from 'vue-router'
import { Store } from 'pinia'
// Utilities
import AuthService from '@/services/auth.service'
import useUser, { UserStoreState } from '@/store/auth.module'
import router from '@/router'
import { validateEmail, validatePasswort, validateMandatory } from '@/util/inputValidation'
import { GenericInputs } from '@/types/GenericInputData'
import SmallForm from '@/components/SmallForm.vue'

const user: Store<'user', UserStoreState> = useUser()

const inputs: GenericInputs<string> = {
  email: {
    value: ref(''),
    type: 'email',
    label: 'Deine Email',
    id: 'email',
    name: 'email',
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

const redirectPath: string = useRoute().query.redirect as string
const redirect = (standard: { name: string; params?: { [key: string]: string | undefined } }) => {

  try {
    router.push({ path: redirectPath || '/' })
  } catch (err) {
    console.log('Error during routing back.')
    console.log(err)
    router.push(standard)
  }
}
onMounted(() => {
  if (user.status.loggedIn) {
    redirect({ name: 'UserDetail', params: { id: user.user?.id } })
  }
})
const onSignup = async (e: Event) => {
  e.preventDefault()

  if (
    !Object.keys(inputs).reduce((result, k) => {
      if (inputs[k].mandatory) result = result && validateMandatory(inputs[k].value.value)
      if (inputs[k].type === 'email') result = result && validateEmail(inputs[k].value.value)
      if (inputs[k].type === 'password') result = result && validatePasswort(inputs[k].value.value)
      return result
    }, true)
  ) {
    alert('Das Format deiner Eingabedaten ist nicht korrekt!')
    return
  }

  try {
    await AuthService.login({
      email: inputs.email.value.value,
      password: inputs.passwort.value.value,
    })
  } catch (err) {
    alert('Login fehlgeschlagen.')
    console.log('Error while Login:')
    console.log(err)
    return
  }
  redirect({ name: 'Home' })
}
</script>

<template>
  <div>
    <SmallForm :title="`Login`" :inputs="inputs" :submitMessage="'Einloggen'" @onSubmit="onSignup">
      <template #subtitle>
        <p>Melde dich hier an!</p>
      </template>
      <template #footer>
        <p>
          Du hast noch keinen Account? Dann erstelle dir
          <router-link :to="{ name: 'UserSignup', query: useRoute().query }">hier</router-link>
          einen.
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
