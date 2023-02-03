<script setup lang="ts">
import { ref } from 'vue'
import AuthService from '@/services/auth.service'
import { GenericInputs } from '@/types/GenericInputData'
import SmallForm from '@/components/SmallForm.vue'
import router from '@/router'
import { validateEmail, validatePasswort, validateMandatory } from '@/util/inputValidation'
import { useRoute } from 'vue-router'

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
  birthday: {
    value: ref(''),
    type: 'date',
    label: 'Dein Geburtsdatum',
    id: 'birthday',
    name: 'birthday',
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

const query = useRoute().query
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
      birthday: inputs.birthday.value.value,
      email: inputs.email.value.value,
      password: inputs.passwort.value.value,
      rank: isSchuelerInput.isSchueler.value.value,
    })
  } catch (err) {
    alert('Etwas ist mit deiner Registrierung schiefgelaufen.')
    console.log('ERROR: Registration could not be completed.')
    console.error(err)
    return
  }
  try {
    router.push({ name: 'UserLogin', query: query })
  } catch (err) {
    console.log('ERROR: Could not redirect to login page.')
    console.error(err)
    router.push({ name: 'UserLogin' })
  }
}
</script>

<template>
  <div>
    <SmallForm :title="`Registrierung`" :inputs="{ ...inputs, ...isSchuelerInput }" :submitMessage="'Account erstellen'"
      @onSubmit="onSignup">
      <template #subtitle>
        <p>Erstelle dir hier einen Account</p>
      </template>
      <template #footer>
        <p>
          Du hast bereits einen Account? Dann logge dich
          <router-link :to="{ name: 'UserLogin', query: useRoute().query }">hier</router-link> ein.
        </p>
      </template>
    </SmallForm>
  </div>
</template>
