<script setup lang="ts">
import { useRoute } from 'vue-router'
import AuthService from '@/services/auth.service'
import router from '@/router'

const redirect = useRoute().query.redirect

AuthService.logout()
try {
  router.push({ path: redirect || '/' })
} catch (err) {
  console.log('Error during routing back.')
  console.log(err)
  router.push({ name: 'Home' })
}
</script>

<template>
  <div>Login out...</div>
</template>
