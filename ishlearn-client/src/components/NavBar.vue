<script setup lang="ts">
import useUser from '@/store/auth.module'
import router from '@/router'
import IconMoon from '@/icons/IconMoon'
import IconMoonFill from '@/icons/IconMoonFill'
import IconBoxArrowRight from '@/icons/IconBoxArrowRight'

const user = useUser()

function toggleTheme() {
  const currentTheme = document.documentElement.getAttribute('data-theme')
  let targetTheme = 'light'

  if (currentTheme === 'light') {
    targetTheme = 'dark'
  }

  document.documentElement.setAttribute('data-theme', targetTheme)
  localStorage.setItem('theme', targetTheme)
}
</script>

<template>
  <div>
    <nav
      class="navbar navbar-expand-sm fixed-top p-3 navbar-dark nav-colors"
      style="display: flex; justify-content: space-between; z-index: 2500"
    >
      <div class="" id="" style="display: flex">
        <!-- Brand -->
        <router-link :to="{ name: 'Home' }" class="navbar-brand logo" id="definitely-white"
          >ISH/learn</router-link
        >

        <!-- Navbar links -->
        <ul class="navbar-nav no-scrollbar">
          <li class="nav-item">
            <router-link :to="{ name: 'About' }" class="nav-link">About</router-link>
          </li>
          <li class="nav-item">
            <router-link :to="{ name: 'AllProjects' }" class="nav-link">Projekte</router-link>
          </li>
        </ul>
      </div>

      <!-- Navbar rechts -->
      <div style="margin-right: 1rem">
        <ul class="navbar-nav no-scrollbar">
          <!-- User -->
          <li class="nav-item">
            <router-link
              :to="{ name: 'UserDetail', params: { id: user.user?.id } }"
              class="nav-link"
              v-if="user.status.loggedIn"
              >{{ user.user?.firstName }} {{ user.user?.lastName }}</router-link
            >
            <router-link
              :to="{ name: 'UserLogin', query: { redirect: router.currentRoute.value.path } }"
              class="nav-link"
              v-else
              >Login</router-link
            >
          </li>
          <!-- Logout Button -->
          <li class="nav-item" v-if="user.status.loggedIn">
            <router-link
              :to="{ name: 'UserLogout', query: { redirect: router.currentRoute.value.path } }"
            >
              <button id="logout" class="nav-colors bigger">
                <IconBoxArrowRight />
              </button>
            </router-link>
          </li>
          <!-- Dark moddle toggle -->
          <li class="nav-item">
            <button id="theme-toggle" class="nav-colors bigger" @click="toggleTheme">
              <span class="d-block-light d-none">
                <IconMoon />
              </span>
              <span class="d-block-dark d-none">
                <IconMoonFill />
              </span>
            </button>
          </li>
        </ul>
      </div>
    </nav>
  </div>
</template>

<style scoped>
.nav-colors {
  background-color: var(--nav-bg);
  color: var(--nav-fg);
}

nav a {
  font-weight: bold;
  color: var(--nav-fg);
  height: 100%;
}
nav a:hover {
  font-weight: bold;
  color: var(--orange-shade);
}

nav a.router-link-exact-active {
  color: var(--orange) !important;
}
.logo {
  font-family: monospace;
  margin-left: 1rem;
}
#definitely-white {
  color: var(--nav-fg) !important;
}

.bigger {
  font-size: 16pt;
}

button {
  border: none;
}
</style>
