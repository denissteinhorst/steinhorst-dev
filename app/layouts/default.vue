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
    </div>
  </UApp>
</template>

<style>
@import "tailwindcss";
@import "@nuxt/ui";
</style>
