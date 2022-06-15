<script setup lang="ts">
import { ref } from 'vue'
import AuthService from '@/services/auth.service'
import { GenericInputs } from '@/types/GenericInputData'
import SmallForm from '@/components/SmallForm.vue'
import router from '@/router'
import { validateEmail, validatePasswort, validateMandatory } from '@/util/inputValidation'

const inputs: GenericInputs<string> = {
  firstName: {
    value: ref(''),
    type: 'text',
    label: 'Dein Vorname',
    id: 'firstName',
    name: 'firstName',
    mandatory: true,
    placeholder: '',
  },
  lastName: {
    value: ref(''),
    type: 'text',
    label: 'Dein Nachname',
    id: 'lastName',
    name: 'lastName',
    mandatory: true,
    placeholder: '',
  },
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
  passwort2: {
    value: ref(''),
    type: 'password',
    label: 'Dein Passwort wiederholen',
    id: 'pwd2',
    name: 'pwd2',
    mandatory: true,
    placeholder: '',
  },
}
const isSchuelerInput: GenericInputs<boolean> = {
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

  if (inputs.passwort.value.value !== inputs.passwort2.value.value) {
    alert('Deine Passwörter stimmen nicht überein!')
    return
  }

  try {
    await AuthService.register({
      firstName: inputs.firstName.value.value,
      lastName: inputs.lastName.value.value,
      email: inputs.email.value.value,
      password: inputs.passwort.value.value,
      rank: isSchuelerInput.isSchueler.value.value,
    })
    router.push({ name: 'UserLogin' })
  } catch (err) {
    alert('Etwas ist mit deiner Registrierung schiefgelaufen.')
    console.log('Error while Registering:')
    console.log(err)
  }
}
</script>

<template>
  <div>
    <SmallForm
      :title="`Registrierung`"
      :inputs="{ ...inputs, ...isSchuelerInput }"
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
