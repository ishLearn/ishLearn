<script setup lang="ts">
import { User } from '@/types/Users'
import { ref } from 'vue'
import api from '@/services/api'
import { onMounted } from '@vue/runtime-core'
import { useRoute } from 'vue-router'
import axios from 'axios'
import useUser from '@/store/auth.module'

const uid = useRoute().params.id

const user = useUser()
const isHimself = user.status.loggedIn && user.user?.id === uid ? true : false

const user2display: ref<User> = ref()
const imageUrl = ref('')
onMounted(() => {
  api.get(`/users/${uid}/`).then((res) => {
    user2display.value = res.data
  })
  axios.get('https://randomuser.me/api/').then((res) => {
    imageUrl.value = res.data.results[0].picture.large
  })
})
</script>

<template>
  <div class="container d-flex justify-content-center">
    <div v-if="user2display" class="box-background small-width m-2 p-4">
      <img :src="imageUrl" class="rounded-circle" alt="" />
      <h3 class="name">{{ user2display.firstName }} {{ user2display.lastName }}</h3>

      <p>{{ user2display.rank == 'student' ? 'Schüler' : 'Lehrer' }}</p>

      <p>{{ user2display.profileText || 'Ich benutze jetzt auch ISH/Learn' }}</p>

      <button class="btn btn-primary m-2">Alle Projekte von {{ user2display.firstName }}</button>
      <button v-if="isHimself" class="btn btn-secondary m-2">Edit Profile settings</button>
    </div>
  </div>
</template>

<style scoped>
.name {
  margin: 20px 0px 0px 0px;
  width: 100%;
}
</style>
