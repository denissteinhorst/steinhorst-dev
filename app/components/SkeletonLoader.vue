<script setup lang="ts">
/**
 * SkeletonLoader component
 * A thin wrapper around NuxtUI's USkeleton with predefined variants for common content types.
 * Uses theme colors and supports dark mode automatically through NuxtUI.
 */

interface Props {
  variant?:
    | "text"
    | "headline"
    | "subheadline"
    | "avatar"
    | "button"
    | "card"
    | "input";
  size?: "xs" | "sm" | "md" | "lg" | "xl";
  lines?: number;
}

const props = withDefaults(defineProps<Props>(), {
  variant: "text",
  size: "md",
  lines: 1,
});

const skeletonClasses = computed(() => {
  const baseClasses = "skeleton-loader";
  const variantClass = `skeleton-loader--${props.variant}`;
  const sizeClass = props.size !== "md" ? `skeleton-loader--${props.size}` : "";

  return [baseClasses, variantClass, sizeClass].filter(Boolean).join(" ");
});

// Generate multiple skeleton lines for list/text variants
const skeletonLines = computed(() => {
  if (props.variant === "text" && props.lines > 1) {
    return Array.from({ length: props.lines }, (_, i) => ({
      key: i,
      width: i === props.lines - 1 ? "75%" : "100%", // Last line shorter
    }));
  }
  return [{ key: 0, width: "100%" }];
});
</script>

<template>
  <div v-if="props.variant === 'text' && props.lines > 1" class="space-y-2">
    <USkeleton
      v-for="line in skeletonLines"
      :key="line.key"
      :class="skeletonClasses"
      :style="{ width: line.width }"
    />
  </div>
  <USkeleton v-else :class="skeletonClasses" />
</template>

<style scoped lang="scss">
// Minimal variants extending NuxtUI's USkeleton
.skeleton-loader {
  // Headline variants
  &--headline {
    height: var(--font-size-3xl);

    &.skeleton-loader--xs {
      height: var(--font-size-lg);
    }
    &.skeleton-loader--sm {
      height: var(--font-size-xl);
    }
    &.skeleton-loader--lg {
      height: var(--font-size-4xl);
    }
    &.skeleton-loader--xl {
      height: var(--font-size-5xl);
    }
  }

  // Subheadline variants
  &--subheadline {
    height: var(--font-size-xl);
    width: 75%;

    &.skeleton-loader--xs {
      height: var(--font-size-base);
      width: 60%;
    }
    &.skeleton-loader--sm {
      height: var(--font-size-lg);
      width: 70%;
    }
    &.skeleton-loader--lg {
      height: var(--font-size-2xl);
      width: 80%;
    }
    &.skeleton-loader--xl {
      height: var(--font-size-3xl);
      width: 85%;
    }
  }

  // Text variants
  &--text {
    height: var(--font-size-base);
    width: 100%;

    &.skeleton-loader--xs {
      height: calc(var(--font-size-sm) * 1.2);
    }
    &.skeleton-loader--sm {
      height: calc(var(--font-size-base) * 1.1);
    }
    &.skeleton-loader--lg {
      height: calc(var(--font-size-lg) * 1.2);
    }
    &.skeleton-loader--xl {
      height: calc(var(--font-size-xl) * 1.2);
    }
  }
  &--avatar {
    width: 2.5rem;
    height: 2.5rem;
    border-radius: 50%;

    &.skeleton-loader--xs {
      width: 1.5rem;
      height: 1.5rem;
    }
    &.skeleton-loader--sm {
      width: 2rem;
      height: 2rem;
    }
    &.skeleton-loader--lg {
      width: 3.5rem;
      height: 3.5rem;
    }
    &.skeleton-loader--xl {
      width: 4.5rem;
      height: 4.5rem;
    }
  }

  // Button variants
  &--button {
    height: 2.5rem;
    width: 6rem;

    &.skeleton-loader--xs {
      height: 2rem;
      width: 4rem;
    }
    &.skeleton-loader--sm {
      height: 2.25rem;
      width: 5rem;
    }
    &.skeleton-loader--lg {
      height: 3rem;
      width: 8rem;
    }
    &.skeleton-loader--xl {
      height: 3.5rem;
      width: 10rem;
    }
  }

  // Card variants
  &--card {
    height: 12rem;
    width: 100%;

    &.skeleton-loader--xs {
      height: 6rem;
    }
    &.skeleton-loader--sm {
      height: 8rem;
    }
    &.skeleton-loader--lg {
      height: 16rem;
    }
    &.skeleton-loader--xl {
      height: 20rem;
    }
  }

  // Input variants
  &--input {
    height: 2.5rem;
    width: 100%;

    &.skeleton-loader--xs {
      height: 2rem;
    }
    &.skeleton-loader--sm {
      height: 2.25rem;
    }
    &.skeleton-loader--lg {
      height: 3rem;
    }
    &.skeleton-loader--xl {
      height: 3.5rem;
    }
  }
}
</style>
