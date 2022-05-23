<script setup lang="ts">
import { ref } from 'vue';

const count = ref(0);

function toggleTheme() {
  const currentTheme = document.documentElement.getAttribute('data-theme');
  let targetTheme = 'light';

  if (currentTheme === 'light') {
    targetTheme = 'dark';
  }

  document.documentElement.setAttribute('data-theme', targetTheme)
  localStorage.setItem('theme', targetTheme);
}

</script>

<template>
  <div>
    <nav class="navbar navbar-expand-sm bg-light navbar-light">
      <a class="navbar-brand btn contrast-color" href="#">ISH/learn</a>
      <ul class="navbar-nav">
        <li class="nav-item active">
          <router-link :to="{ name: 'Home' }" class="nav-link">Home</router-link>
        </li>
        <li class="nav-item">
          <router-link :to="{ name: 'About' }" class="nav-link">About</router-link>
        </li>
        <li class="nav-item">
          <a class="nav-link disabled" href="#">Projekte</a>
        </li>
        <li class="nav-item">
          <button class="btn btn-primary" @click="toggleTheme">darkmode</button>
        </li>
        <li class="nav-item">
          <button @click="count++" class="btn btn-secondary">
            You clicked me {{ count }} times.
          </button>
        </li>
      </ul>
      <div class="nav-item dropdown">
        <a class="nav-link dropdown-toggle btn contrast-color bigger" href="#"
             id="navbarDropdownUser" role="button" data-toggle="dropdown" aria-haspopup="true"
             aria-expanded="false">

              User
            <svg width="1em" height="1em" viewBox="0 0 16 16" class="bi bi-person-circle"
              fill="currentColor" xmlns="http://www.w3.org/2000/svg">
              <path d="M13.468 12.37C12.758 11.226 11.195 10 8 10s-4.757 1.225-5.468
               2.37A6.987 6.987 0 0 0 8 15a6.987 6.987 0 0 0 5.468-2.63z"/>
              <path fill-rule="evenodd" d="M8 9a3 3 0 1 0 0-6 3 3 0 0 0 0 6z"/>
              <path fill-rule="evenodd" d="M8 1a7 7 0 1 0 0 14A7 7 0 0 0 8 1zM0
               8a8 8 0 1 1 16 0A8 8 0 0 1 0 8z"/>
            </svg>
        </a>
        <div class="dropdown-menu dropdown-menu-right"
           aria-labelledby="navbarDropdownUser">
            <a class=""
                href="/accounts/login/">Login</a>
            <a class=""
                href="/accounts/signup/">Sign up</a>
        </div>
      </div>
    </nav>
  </div>
</template>

<style scoped>
nav {
  padding: 30px;
}

nav a {
  font-weight: bold;
  color: #2c3e50;
}

nav a.router-link-exact-active {
  color: var(--orange) !important;
}

.bigger {
  font-size: larger;
}
</style>
