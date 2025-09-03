<script setup lang="ts">
// Safe debug of runtime-config and selected envs (masked). Remove in production if undesired.
const config = useRuntimeConfig();

// Gate access behind IS_MAINTENANCE_MODE env; return 404 when disabled
const isMaint = import.meta.server
  ? ["1", "true", "on", "yes"].includes(
      String(process.env.IS_MAINTENANCE_MODE || "").toLowerCase()
    )
  : false;
if (!isMaint) {
  throw createError({ statusCode: 404, statusMessage: "Not found" });
}

const publicConfig = computed(() => ({
  api_base: config.public.api_base,
  api_url: config.public.api_url,
}));

const masked = (val: string | undefined | null) => {
  if (!val) return "(empty)";
  // Reveal first 3 chars only
  return `${val.slice(0, 3)}*** (${val.length} chars)`;
};

const serverTokenMasked = computed(() => {
  const token = (config as unknown as { api_token?: string }).api_token || "";
  return import.meta.server ? masked(token) : "(hidden on client)";
});

const envNuxtPublicBase = import.meta.server
  ? process.env.NUXT_PUBLIC_API_BASE
  : undefined;
const envNuxtPublicUrl = import.meta.server
  ? process.env.NUXT_PUBLIC_API_URL
  : undefined;
const envNuxtToken = import.meta.server
  ? process.env.NUXT_API_TOKEN
  : undefined;
</script>

<template>
  <section class="debug">
    <h1>Runtime Debug</h1>
    <h2>runtimeConfig.public</h2>
    <ul>
      <li><b>api_base</b>: {{ publicConfig.api_base }}</li>
      <li><b>api_url</b>: {{ publicConfig.api_url }}</li>
    </ul>
    <h2>runtimeConfig (server-only)</h2>
    <ul>
      <li><b>api_token</b>: {{ serverTokenMasked }}</li>
    </ul>
    <h2>Env presence (server)</h2>
    <ul>
      <li><b>NUXT_PUBLIC_API_BASE</b>: {{ envNuxtPublicBase || "(unset)" }}</li>
      <li><b>NUXT_PUBLIC_API_URL</b>: {{ envNuxtPublicUrl || "(unset)" }}</li>
      <li><b>NUXT_API_TOKEN</b>: {{ envNuxtToken ? "(set)" : "(unset)" }}</li>
    </ul>
    <p>
      Tip: Set runtime envs in your orchestrator (Coolify) using
      NUXT_PUBLIC_API_BASE, NUXT_PUBLIC_API_URL, and NUXT_API_TOKEN. Redeploy
      without rebuilding the image if possible to validate overrides.
    </p>
  </section>
</template>

<style scoped>
.debug {
  padding: 2rem;
}
.debug h1 {
  font-size: 1.5rem;
  margin-bottom: 1rem;
}
.debug h2 {
  margin-top: 1.25rem;
  font-size: 1.1rem;
}
.debug ul {
  list-style: none;
  padding: 0;
}
.debug li {
  margin: 0.25rem 0;
}
</style>
