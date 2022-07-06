<!-- ProductPreview.vue -->
<script setup lang="ts">
import { defineProps, ref, Ref } from 'vue'
import { formatDate } from '@/util/dateUtils'
import { User } from '@/types/Users'
import { getUser } from '@/util/getUser'

const props = defineProps(['project'])
const creator: Ref<User | null> = ref(null)

getUser(creator, props.project.createdBy)
</script>

<template>
  <div class="media box-background rounded shadow m-2">
    <div class="heading">
      <h3>{{ project.title }}</h3>
    </div>
    <div class="trenner">ein Projekt von</div>
    <div class="content">
      <div class="creator">
        <router-link
          v-if="creator"
          class="creator"
          :to="{ name: 'UserDetail', params: { id: creator.id } }"
          >{{ creator.firstName }}</router-link
        >
      </div>
      <small class="text-muted"
        >Erstellt am <br />
        {{ formatDate(project.updatedDate) }}</small
      >

      <div style="visibility: hidden">
        <router-link :to="{ name: 'ViewProject', params: { id: project.id } }">
          <button class="btn btn-secondary">Ansehen</button></router-link
        >
        <small>Bearbeitet: {{ formatDate(project.updatedDate) }}</small>
      </div>

      <div class="bottom-note text-muted p-2">
        <router-link :to="{ name: 'ViewProject', params: { id: project.id } }">
          <button class="btn btn-secondary">Ansehen</button></router-link
        >
        <small>Bearbeitet: {{ formatDate(project.updatedDate) }}</small>
      </div>
    </div>
  </div>
</template>

<style scoped>
.media {
  position: relative;
}
.creator {
  text-decoration: none;
}
.trenner {
  width: 100%;
  min-height: 1rem;
  background-color: rgba(0, 0, 0, 0.2);
}
.content {
  padding: 0rem 1rem 1rem 1rem;
}
button {
  padding: 10px;
  width: 100%;
  border: 0px;
  background-color: var(--orange);
}
.bottom-note {
  position: absolute;
  bottom: 0;
  left: 0;
  vertical-align: bottom;
  width: 100%;
  text-align: center;
}
</style>
