<script setup lang="ts">
const props = defineProps<{
  isActive?: boolean;
  isDark?: boolean;
}>();
</script>

<template>
  <UCard
    :class="[
      'base-card',
      {
        'base-card--active': props.isActive,
        'base-card--dark': props.isDark,
      },
    ]"
    variant="soft"
    v-bind="$attrs"
  >
    <slot></slot>
  </UCard>
</template>

<style scoped lang="scss">
$block: "base-card";

.#{$block} {
  height: 100%;
  display: flex !important;
  flex-direction: column !important;
  position: relative;
  border: 1px solid rgba(229, 231, 235, 0.7);
  box-shadow: 0 1px 2px 0 rgba(0, 0, 0, 0.05);
  transition: box-shadow 0.3s ease, border-color 0.3s ease,
    background-color 0.3s ease;

  // Override UCard's default styling - comprehensive approach
  :deep(*) {
    &[class*="body"],
    &[class*="card-body"] {
      padding: 0 !important;
      height: 100%;
      display: flex;
      flex-direction: column;
      min-height: 0;
    }
  }

  // Direct child override for UCard
  :deep(> div) {
    height: 100%;
    display: flex;
    flex-direction: column;
  }

  &--active {
    border: 1px solid var(--color-primary) !important;
  }

  &--dark {
    border-color: rgba(55, 65, 81, 0.7) !important;
    background-color: rgba(17, 24, 39, 0.6) !important;
    box-shadow: 0 1px 2px 0 rgba(0, 0, 0, 0.1);

    :deep(*) {
      &[class*="body"],
      &[class*="card-body"] {
        background-color: transparent !important;
      }
    }
  }

  &:hover {
    box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1),
      0 2px 4px -2px rgba(0, 0, 0, 0.1);
  }

  @at-root .dark #{&} {
    border-color: rgba(55, 65, 81, 0.6);
  }
}
</style>
