<script setup lang="ts">
import { onMounted, ref, Ref } from 'vue'
import { Store } from 'pinia'
import api from '@/services/api'
import useUser, { UserStoreState } from '@/store/auth.module'
import ShowAllProducts from '@/components/ShowAllProducts.vue'
import SearchField from '@/components/SearchField.vue'
import IconSearch from '@/icons/IconSearch.vue'
import IconPlus from '@/icons/IconPlus.vue'

const user: Store<'user', UserStoreState> = useUser()

const allProjects = ref([])
const checkedTags: Ref<string[]> = ref([])
const checkedSubjects: Ref<string[]> = ref([])

onMounted(async () => {
  await user.loading
  api.get('/products/page/0').then((res: { data: [] }) => {
    allProjects.value = res.data
  })
})

const search = async (queryString: string) => {
  // Minimum query string length is 3 chars
  if (queryString.length < 3) return

  if (queryString.length == 0) return
  api.post('/products/filter/', { queryString: queryString }).then((res) => {
    allProjects.value = res.data.products
  })
}

const classes: string[] = [
  '5. Klasse',
  '6. Klasse',
  '7. Klasse',
  '8. Klasse',
  '9. Klasse',
  '10. Klasse',
  'E1',
  'E2',
  'Q1',
  'Q2',
  'Q3',
  'Q4',
]
const subjects: string[] = [
  'Mathematik',
  'Deutsch',
  'Englisch',
  'Physik',
  'Informatik',
  'Geschichte',
  'Politik und Wirtschaft',
  'Sport',
  'Musik',
  'Kunst',
  'Darstellendes Spiel',
]
</script>

<template>
  <div class="all-projects row p-1">
    <!-- Filter die Projekte -->
    <div class="col-md-3 p-1">
      <div class="box-background p-3">
        <div class="search">
          <h4>Suche</h4>
          <SearchField @submit-search="search"></SearchField>
        </div>
        <div class="tags">
          <h4>Tags</h4>
          <p>Diese Knöpfe bewirken inhaltlich noch nichts...</p>

          <div class="tag-space">
            <span class="tag tag-blue" v-for="tag in checkedTags" :key="tag">{{
              tag
            }}</span>
          </div>

          <div v-for="kl in classes" :key="kl" class="form-check">
            <input
              class="form-check-input"
              type="checkbox"
              :id="kl"
              :value="kl"
              v-model="checkedTags"
            />
            <label class="form-check-label" :for="kl">{{ kl }}</label>
          </div>
          <hr />

          <div class="tag-space">
            <span
              class="tag tag-red"
              v-for="tag in checkedSubjects"
              :key="tag"
              >{{ tag }}</span
            >
          </div>

          <div v-for="kl in subjects" :key="kl" class="form-check">
            <input
              class="form-check-input"
              type="checkbox"
              :id="kl"
              :value="kl"
              v-model="checkedSubjects"
            />
            <label class="form-check-label" :for="kl">{{ kl }}</label>
          </div>
        </div>
      </div>
    </div>
    <!-- Zeige die Projekte -->
    <div class="col-md-9">
      <div class="box-background p-3">
        <h1 style="position: relative">
          Alle Projekte
          <router-link :to="{ name: 'AddProject' }">
            <button class="btn btn-lg btn-primary add-button">
              <IconPlus class="icon" /> Hinzufügen
            </button></router-link
          >
        </h1>
        <ShowAllProducts :projects="allProjects" />
      </div>
    </div>
  </div>
</template>

<style scoped>
.tags .tag-space {
  overflow: scroll;
}
.tags .tag-space::-webkit-scrollbar {
  display: none;
}

/* Hide scrollbar for IE, Edge and Firefox */
.tags .tag-space {
  -ms-overflow-style: none; /* IE and Edge */
  scrollbar-width: none; /* Firefox */
}
.tags .tag {
  color: white;
  padding: 3px;
  border-radius: 3px;
  margin: 2px;
  white-space: nowrap;
  font-size: 1rem;
  font-weight: bold;
}
.tags .tag-blue {
  background-color: blue;
}
.tags .tag-red {
  background-color: red;
}
.tags {
  text-align: left;
}
.icon {
  width: 2rem;
  height: 2rem;
}
.add-button {
  position: absolute;
  right: 0px;
}
</style>
