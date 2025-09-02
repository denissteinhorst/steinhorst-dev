<script setup lang="ts">
import "~/assets/scss/app.scss";
</script>

<template>
  <UApp>
    <NuxtRouteAnnouncer />
    <div class="layout-root">
      <main-navigation />
      <main id="main-content" tabindex="-1">
        <NuxtPage />
      </main>
      <scroll-companion />
      <footer-section />
    </div>
  </UApp>
</template>

<style>
@import "tailwindcss";
@import "@nuxt/ui";

/* Sticky footer layout */
.layout-root {
  min-height: 100vh;
  min-height: 100dvh; /* modern viewport units for mobile */
  display: flex;
  flex-direction: column;
}

.layout-root > main {
  flex: 1 0 auto; /* take remaining space so footer sits at bottom */
}
</style>
