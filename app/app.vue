<template>
  <div class="app">
    <div class="app-header">
      <h1>Steinhorst Dev</h1>
    </div>
    <NuxtRouteAnnouncer />
    <NuxtWelcome />
  </div>
</template>

<style scoped lang="scss">
$block: "app";

.#{$block} {
  background-color: $primary;
}
</style>
