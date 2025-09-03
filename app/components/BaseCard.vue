<script setup lang="ts">
const props = defineProps<{
  isActive?: boolean;
  isDark?: boolean;
  aosDelay?: number;
  isInWrapper?: boolean;
}>();
</script>

<template>
  <div
    class="base-card"
    :class="{
      'base-card--active': props.isActive,
      'base-card--dark': props.isDark,
      'base-card--in-wrapper': props.isInWrapper,
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
  border: 1px solid var(--color-border-light);
  border-radius: var(--radius-default);
  box-shadow: var(--shadow-sm);
  transition: box-shadow 0.3s ease, border-color 0.3s ease,
    background-color 0.3s ease;

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

  :deep(> div) {
    height: 100%;
    display: flex;
    flex-direction: column;
    border-radius: var(--radius-default);
  }

  &--active {
    border: 1px solid var(--color-primary) !important;
  }

  &--in-wrapper {
    background-color: var(--color-surface-elevated) !important;

    :deep(> div) {
      background-color: var(--color-surface-elevated) !important;
      border-radius: var(--radius-default);
    }
  }

  &--dark,
  &.is-dark {
    border-color: var(--color-border-dark) !important;
    background-color: rgba(17, 24, 39, 0.6) !important;
    box-shadow: var(--shadow-dark-sm);

    :deep(*) {
      &[class*="body"],
      &[class*="card-body"] {
        background-color: transparent !important;
      }
    }

    :deep(> div) {
      background-color: rgba(17, 24, 39, 0.6) !important;
      border-color: var(--color-border-dark) !important;
      border-radius: var(--radius-default);
    }
  }

  &:hover {
    box-shadow: var(--shadow-md);
  }

  @at-root .dark #{&} {
    border-color: var(--color-border-light);
  }

  @at-root .dark .#{$block}--in-wrapper {
    background-color: var(--color-surface-elevated) !important;

    :deep(> div) {
      background-color: var(--color-surface-dark) !important;
      border-radius: var(--radius-default);
    }
  }
}
</style>
