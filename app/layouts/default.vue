<script setup lang="ts">
import "~/assets/scss/app.scss";
</script>

<template>
  <UApp>
    <NuxtRouteAnnouncer />
    <div class="layout-root">
      <main id="main-content" tabindex="-1">
        <NuxtPage />
      </main>
    </div>
  </UApp>
</template>

<style>
@import "tailwindcss";
@import "@nuxt/ui";
</style>
