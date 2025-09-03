<script setup lang="ts">
const props = defineProps<{
  isActive?: boolean;
  isDark?: boolean;
  aosDelay?: number;
}>();
</script>

<template>
  <div
    class="base-card"
    :class="{
      'base-card--active': props.isActive,
      'base-card--dark': props.isDark,
    }"
    v-bind="$attrs"
  >
    <UCard variant="soft">
      <slot></slot>
    </UCard>
  </div>
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

  &--dark,
  &.is-dark {
    border-color: rgba(55, 65, 81, 0.7) !important;
    background-color: rgba(17, 24, 39, 0.6) !important;
    box-shadow: 0 1px 2px 0 rgba(0, 0, 0, 0.1);

    :deep(*) {
      &[class*="body"],
      &[class*="card-body"] {
        background-color: transparent !important;
      }
    }

    // Force the inner UCard container (and similar wrappers) to use the
    // dark background so toggling the global color mode doesn't override
    // this card when `base-card--dark` or `is-dark` is set.
    :deep(> div) {
      background-color: rgba(17, 24, 39, 0.6) !important;
      border-color: rgba(55, 65, 81, 0.7) !important;
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
