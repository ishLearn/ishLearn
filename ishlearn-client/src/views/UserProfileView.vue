<script setup lang="ts">
import axios, { AxiosResponse } from 'axios'
import { ref, Ref } from 'vue'
import { onMounted, onUpdated } from '@vue/runtime-core'
import { useRoute } from 'vue-router'
import useUser from '@/store/auth.module'
import api from '@/services/api'
import { User } from '@/types/Users'

const uid = useRoute().params.id

const user = useUser()
const isHimself: Ref<boolean> = ref(false)

const user2display: Ref<User | null> = ref(null)
const imageUrl: Ref<string> = ref('')
onMounted(() => {
  api.get(`/users/${uid}/`).then(async (res: AxiosResponse<{
    id: string,
    rank: string,
    firstName: string,
    lastName: string | null,
    emailTmp: string | null,
    email: string | null,
    birthday: Date | null
  }>) => {
    user2display.value = { ...res.data, profileText: null, profilePicture: null }
    const { data } = await api.get(`/users/${uid}/text`)

    if (user2display.value !== null)
      user2display.value.profileText = data
  })
  axios.get('https://randomuser.me/api/').then((res) => {
    imageUrl.value = res.data.results[0].picture.large
  })
})
onUpdated(() => {
  isHimself.value = user.status.loggedIn && user.user?.id === uid ? true : false
})
</script>

<template>
  <div class="container d-flex justify-content-center">
    <div v-if="user2display" class="box-background small-width m-2 p-4">
      <img :src="imageUrl" class="rounded-circle" alt="" />
      <h3 class="name">
        {{ user2display.firstName }} {{ user2display.lastName }}
      </h3>

      <p>{{ user2display.rank == 'student' ? 'Schüler' : 'Lehrer' }}</p>

      <p>
        {{ user2display.profileText || 'Ich benutze jetzt auch ISH/Learn' }}
      </p>

      <button class="btn btn-primary m-2">
        Alle Projekte von {{ user2display.firstName }}
      </button>
      <router-link v-if="isHimself" :to="{ name: 'UserUpdate' }"
        ><button class="btn btn-secondary m-2">
          Edit Profile settings
        </button></router-link
      >
    </div>
  </div>
</template>

<style scoped>
.name {
  margin: 20px 0px 0px 0px;
  width: 100%;
}
</style>
