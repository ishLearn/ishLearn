<script setup lang="ts">
import { ref } from 'vue'

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
      class="navbar navbar-expand-sm p-2 navbar-dark nav-colors"
      style="display: flex; justify-content: space-between"
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
      <!-- right part navbar -->
      <div style="margin-right: 1rem">
        <ul class="navbar-nav no-scrollbar">
          <li class="nav-item">
            <router-link :to="{ name: 'UserSignup' }" class="nav-link">Sign Up</router-link>
            <!-- <router-link :to="{ name: 'UserDetail', params: { id: 0 } }" class="nav-link"
              >Sign Up</router-link
            > -->
          </li>
          <li class="nav-item">
            <button id="theme-toggle" class="nav-colors bigger" @click="toggleTheme">
              <span class="d-block-light d-none">
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  width="16"
                  height="16"
                  fill="currentColor"
                  class="bi bi-moon"
                  viewBox="0 0 16 16"
                >
                  <path
                    d="M6 .278a.768.768 0 0 1 .08.858 7.208 7.208 0 0 0-.878 3.46c0 4.021
                   3.278 7.277 7.318 7.277.527 0 1.04-.055 1.533-.16a.787.787 0 0 1
                    .81.316.733.733 0 0 1-.031.893A8.349 8.349 0 0 1 8.344 16C3.734 16 0
                     12.286 0 7.71 0 4.266 2.114 1.312 5.124.06A.752.752 0 0 1 6 .278zM4.858
                      1.311A7.269 7.269 0 0 0 1.025 7.71c0 4.02 3.279 7.276 7.319 7.276a7.316
                       7.316 0 0 0 5.205-2.162c-.337.042-.68.063-1.029.063-4.61
                        0-8.343-3.714-8.343-8.29 0-1.167.242-2.278.681-3.286z"
                  />
                </svg>
              </span>
              <span class="d-block-dark d-none">
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  width="16"
                  height="16"
                  fill="currentColor"
                  class="bi bi-moon-fill"
                  viewBox="0 0 16 16"
                >
                  <path
                    d="M6 .278a.768.768 0 0 1 .08.858 7.208 7.208 0 0 0-.878 3.46c0 4.021
                   3.278 7.277 7.318 7.277.527 0 1.04-.055 1.533-.16a.787.787 0 0 1
                    .81.316.733.733 0 0 1-.031.893A8.349 8.349 0 0 1 8.344 16C3.734 16 0
                     12.286 0 7.71 0 4.266 2.114 1.312 5.124.06A.752.752 0 0 1 6 .278z"
                  />
                </svg>
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
