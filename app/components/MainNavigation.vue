<script setup lang="ts">
import type { NavigationResponse } from "~/types/types";

const { cmsRequest } = useStrapi();

const { data, pending, error } = await useLazyAsyncData<NavigationResponse>(
  "nav",
  () =>
    cmsRequest<NavigationResponse>("navigation", [
      "brandName",
      "navigationElements",
      "specialButton",
      "specialLink",
      "brandLink",
    ])
);
</script>

<template>
  <div v-if="pending" class="main-navigation">Loading navigation...</div>
  <div v-else-if="error" class="main-navigation">
    Failed to load navigation.
  </div>
  <nav v-else-if="data" class="main-navigation" aria-label="Main">
    <small>
      <pre>{{ data }}</pre>
    </small>
  </nav>
</template>
