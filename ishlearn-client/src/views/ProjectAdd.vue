<script setup lang="ts">
import { ref } from 'vue'

const mdtext = ref('')
</script>

<template>
  <div>
    <h1>Hier kannst du dein Projekt hinzufügen.</h1>

    <p>
      <!--
      <form action="">
        <label for="title"> Titel <input type="text" v-model="title" id="title" /></label>
        <label for="thema">Thema</label><input type="text" name="thema" id="thema" />
      </form>
      -->
    </p>

    <button class="btn btn-primary">Dieser Knopft Submitted nichts</button>

    <p>TEST</p>

    <br /><br /><br />

    <mavon-editor v-model="mdtext" language="de" />
  </div>
</template>
