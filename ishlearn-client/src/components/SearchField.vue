<script setup lang="ts">
import IconSearch from '@/icons/IconSearch.vue'
import { ref, Ref } from 'vue'

defineEmits(['submitSearch'])
const searchText: Ref<string> = ref('')
</script>

<template>
  <div class="search-container p-2">
    <form class="form-inline row" @submit="$emit('submitSearch', searchText)">
      <div class="col-10 p-0">
        <input
          class="col-10 form-control"
          type="search"
          placeholder="Suchen..."
          v-model="searchText"
        />
      </div>
      <div class="col-2 p-0">
        <button class="btn btn-outline-secondary" type="submit">
          <IconSearch />
        </button>
      </div>
    </form>
  </div>
</template>
<style scoped>
input {
  width: 100%;
}
button {
  float: left;
  width: 100%;
}
</style>
