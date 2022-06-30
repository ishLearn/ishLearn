<script setup lang="ts">
import { onMounted, onUpdated, ref } from 'vue'
import AuthService from '@/services/auth.service'
import api from '@/services/api'
import { GenericInputs } from '@/types/GenericInputData'
import SmallForm from '@/components/SmallForm.vue'
import router from '@/router'
import { validateEmail, validatePasswort, validateMandatory } from '@/util/inputValidation'
import { useRoute } from 'vue-router'
import useUser from '@/store/auth.module'
import { toYYYYMMDD } from '@/util/dateUtils'
import useCounterStore from '@/store/counter'

const user = useUser()

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
  profileText: {
    value: ref(''),
    type: 'textarea',
    label: 'Dein Profiltext',
    id: 'profileText',
    name: 'profileText',
    mandatory: false,
    placeholder: 'Diesen Text sehen alle, wenn sie auf dein Proifl klicken',
  },
}

const fillUser = async () => {
  if (user.user == null || !user.status.loggedIn || !user.user.email) {
    // der Benutzer war davor nicht eingeloggt, und das Laden von pinia dauert
    // da Pinia sich beim page reload zurücksetzt, wird hier init User nochmal ausgeführt
    await useUser().initUser()
    if (!user.status.loggedIn) {
      console.log('Not Loged in')
      router.push({ name: 'UserLogin', query: { redirect: router.currentRoute.value.path } })
      return
    }
  }
  inputs.firstName.value.value = user.user.firstName
  inputs.lastName.value.value = user.user.lastName
  const date = new Date(user.user.birthday)
  inputs.birthday.value.value = toYYYYMMDD(date)
  inputs.profileText.value.value = user.user.profileText
}
onMounted(() => {
  fillUser()
})
onUpdated(() => {
  fillUser()
})

const query = useRoute().query
const onSignup = async (e: Event) => {
  e.preventDefault()

  console.log('Textarea')
  console.log(inputs.profileText.value.value)

  if (
    !Object.keys(inputs).reduce((result, k) => {
      if (inputs[k].mandatory) result = result && validateMandatory(inputs[k].value.value)
      return result
    }, true)
  ) {
    alert('Das Format deiner Eingabedaten ist nicht korrekt!')
    return
  }

  try {
    if (
      inputs.firstName.value.value !== user.user?.firstName ||
      inputs.lastName.value.value !== user.user.lastName
    ) {
      console.log('Name was changed')
      api
        .put('/users/', {
          firstName: inputs.firstName.value.value,
          lastName: inputs.lastName.value.value,
        })
        .then((res) => {
          if (user.user) {
            user.user.firstName = inputs.firstName.value.value
            user.user.lastName = inputs.lastName.value.value
          }
        })
    }
    if (inputs.birthday.value.value !== toYYYYMMDD(new Date(user.user?.birthday))) {
      console.log('Date has changed')
      api
        .put('/users/birthday', {
          birthday: inputs.birthday.value.value,
        })
        .then((res) => {
          useUser().initUser()
        })
    }
    if (inputs.profileText.value.value !== user.user?.profileText) {
      console.log('Profile Text has changed')
      api.put('/users/profile/text/', { text: inputs.profileText.value.value }).then((res) => {
        if (user.user) {
          user.user.profileText = inputs.profileText.value.value
        }
      })
    }
  } catch (err) {
    alert('Etwas ist mit deiner Registrierung schiefgelaufen.')
    console.log('Error while Registering:')
    console.log(err)
    return
  }
  try {
    router.push({ name: 'UserDetail', params: { id: user.user.id } })
  } catch (err) {
    console.log('Fehler beim redirect.')
    console.log(err)
    router.push({ name: 'UserLogin' })
  }
}
</script>

<template>
  <div>
    <SmallForm
      :title="`Account bearbeiten`"
      :inputs="{ ...inputs }"
      :submitMessage="'Bearbeitung abschließen'"
      @onSubmit="onSignup"
    >
      <template #subtitle>
        <p>Hier kannst du deinen Account Bearbeiten</p>
      </template>
      <template #footer>
        <p></p>
      </template>
    </SmallForm>
  </div>
</template>

<style scoped></style>