<script setup lang="ts">
// Node Modules
import { onMounted, onUpdated, ref } from 'vue'
// Own utilities
import api from '@/services/api'
import { GenericInputs } from '@/types/GenericInputData'
import router from '@/router'
import { validateMandatory } from '@/util/inputValidation'
import useUser from '@/store/auth.module'
import { toYYYYMMDD } from '@/util/dateUtils'
// Vue components
import SmallForm from '@/components/SmallForm.vue'

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
  // Wait for user to load
  await user.loading
  if (!user.status.loggedIn) {
    console.log('Not Logged in')
    router.push({ name: 'UserLogin', query: { redirect: router.currentRoute.value.path } })
    return false
  }

  if (!user.user || user.user.lastName === null || user.user.birthday === null || user.user.profileText === null) return false

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

const onSignup = async (e: Event) => {
  e.preventDefault()

  if (user.user === null) return router.push({ name: 'UserLogin', query: { redirect: router.currentRoute.value.path } })

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
      inputs.firstName.value.value !== user.user.firstName ||
      inputs.lastName.value.value !== user.user.lastName
    ) {
      console.log('Name was changed')
      api
        .put('/users/', {
          firstName: inputs.firstName.value.value,
          lastName: inputs.lastName.value.value,
        })
        .then(() => {
          if (user.user) {
            user.user.firstName = inputs.firstName.value.value
            user.user.lastName = inputs.lastName.value.value
          }
        }).catch((err: unknown) => {
          // TODO: Error handling
          console.log('TODO: Error Handling')
          console.log(err)
        })
    }
    if (user.user.birthday !== null && inputs.birthday.value.value !== toYYYYMMDD(new Date(user.user.birthday))) {
      console.log('Date has changed')
      api
        .put('/users/birthday', {
          birthday: inputs.birthday.value.value,
        })
        .then(() => {
          useUser().initUser()
        }).catch((err: unknown) => {
          // TODO: Error handling
          console.log('TODO: Error Handling')
          console.log(err)
        })
    }
    if (inputs.profileText.value.value !== user.user?.profileText) {
      console.log('Profile Text has changed')
      api.put('/users/profile/text/', { text: inputs.profileText.value.value }).then(() => {
        if (user.user) {
          user.user.profileText = inputs.profileText.value.value
        }
      }).catch((err: unknown) => {
        // TODO: Error handling
        console.log('TODO: Error Handling')
        console.log(err)
      })
    }
  } catch (err) {
    alert('Etwas ist mit deiner Registrierung schiefgelaufen.')
    console.log('Error while Registering:')
    console.log(err)
    return
  }
  try {
    router.push({ name: 'UserDetail', params: { id: user.user?.id || '404' } })
  } catch (err) {
    console.log('Fehler beim redirect.')
    console.log(err)
    router.push({ name: 'UserLogin' })
  }
}
</script>

<template>
  <div>
    <SmallForm :title="`Account bearbeiten`" :inputs="{ ...inputs }" :submitMessage="'Bearbeitung abschließen'"
      @onSubmit="onSignup">
      <template #subtitle>
        <p>Hier kannst du deinen Account Bearbeiten</p>
      </template>
      <template #footer>
        <p></p>
      </template>
    </SmallForm>
  </div>
</template>

<style scoped>
</style>
