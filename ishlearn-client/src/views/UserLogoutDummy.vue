<script setup lang="ts">
import { useRoute } from 'vue-router'
import AuthService from '@/services/auth.service'
import router from '@/router'

const redirect = useRoute().query.redirect

await AuthService.logout()
try {
  if (redirect === null || (typeof redirect !== 'string' && redirect[0] === null)) return router.push({ name: 'Home' })
  if (typeof redirect === 'string')
    return router.push({ path: redirect || '/' })
  if (typeof redirect[0] === 'string') return router.push({ path: redirect[0] })
} catch (err) {
  console.log('Error during routing back.')
  console.log(err)
} finally {
  return router.push({ name: 'Home' })
}
</script>

<template>
  <div>Logging out...</div>
</template>
