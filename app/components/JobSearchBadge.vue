<script setup lang="ts">
const { cmsRequest, currentLocaleString } = useStrapi();

const { data, pending, error } = await useLazyAsyncData<JobBadgeResponse>(
  () => `badge-${currentLocaleString.value}`,
  () => cmsRequest<JobBadgeResponse>("job-badge", [])
);
</script>

<template>
  <div v-if="pending" class="job-search-badge">Loading badge...</div>
  <div v-else-if="error" class="job-search-badge">Failed to load badge.</div>
  <div v-else-if="data" class="job-search-badge">
    <a :href="data.link" class="job-search-badge__link">
      <UIcon
        :name="data.icon || 'check-circle'"
        class="job-search-badge__icon"
        aria-hidden="true"
      />
      <span class="job-search-badge__text">{{ data.text }}</span>
    </a>
  </div>
</template>

<style scoped lang="scss">
$block: "job-search-badge";

.#{$block} {
  display: inline-flex;
  align-items: center;
  gap: 0.5rem;
  padding: 0.375rem 0.75rem;
  border-radius: 9999px;
  border: 1px solid color-mix(in srgb, var(--color-secondary) 40%, transparent);
  box-shadow: 0 0 0 1px
      color-mix(in srgb, var(--color-secondary) 30%, transparent),
    0 1px 2px 0 rgb(0 0 0 / 0.05);

  background-color: rgb(17 24 39 / 0.55);
  backdrop-filter: blur(8px);

  font-weight: 500;
  font-size: var(--font-size-xs);
  line-height: 1rem;
  color: var(--color-success);

  animation: #{$block}-pulse 2s cubic-bezier(0.4, 0, 0.6, 1) infinite;

  @media (min-width: 640px) {
    font-size: var(--font-size-sm);
    line-height: 1.25rem;
  }

  &__link {
    display: inline-flex;
    align-items: center;
    gap: 0.25rem;
    color: inherit;
    text-decoration: none;
  }

  &__icon {
    width: 1rem;
    height: 1rem;
    color: #ffffff;
    flex: 0 0 auto;
  }
}

:global(.dark) .#{$block} {
  color: color-mix(in srgb, var(--color-secondary) 70%, white);
}

@keyframes #{$block}-pulse {
  50% {
    opacity: 0.5;
  }
}
</style>
