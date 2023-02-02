<template>
  <div>
    <div class="home">
      <h2>Willkommen bei ISH/Learn</h2>

      <div class="row">
        <div class="col-md-4">
          <img alt="Vue logo" style="width: 100%" src="../assets/logo.png" />
        </div>

        <div class="col-md-8" style="margin: auto; vertical-align: center">
          <p>
            ISHLearn ist die neue Plattform für Lehrer und Schüler, Abgaben und Projekte zu
            koordinieren. Neben der Abgabe verschiedenster Dateiformate und unterschiedlichen
            Sichtbarkeitsstufen ermöglicht ISHLearn es den Lehrern, bequem Feedback zu den Projekten
            zu geben. Anschließend können die Projekte für andere Schüler sichtbar gemacht werden,
            sodass die viele Arbeit, die in das Erstellen dieser Projekte gesteckt wird, nicht auf
            einem Dateienfriedhof landet, sondern auch zukünftig von anderen Schülern aus Interesse
            oder für das Lernen z.B. vor Klausuren genutzt werden kann.
          </p>
        </div>
      </div>

      <div class="trending-products-container">
        <Suspense>
          <template #default>
            <ShowTrendingProducts />
          </template>
          <template #fallback>
            Loading...
          </template>
        </Suspense>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import ShowTrendingProducts from '@/components/ShowTrendingProducts.vue';

</script>

<style scoped>
.trending-products-container {
  margin: 3rem 0;
}
</style>
