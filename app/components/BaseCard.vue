<script setup lang="ts">
type UCardVariant = "soft" | "outline" | "solid" | "subtle";

const props = withDefaults(
  defineProps<{
    variant?: UCardVariant;
  }>(),
  { variant: "soft" }
);
</script>

<template>
  <UCard class="base-card" :variant="props.variant" v-bind="$attrs">
    <slot></slot>
  </UCard>
</template>

<style scoped lang="scss">
$block: "base-card";

.#{"#{$block}"} {
  height: 100%;
  display: flex;
  flex-direction: column;
  position: relative;
  overflow: hidden;
  border: 1px solid rgba(229, 231, 235, 0.7);
  box-shadow: 0 1px 2px 0 rgba(0, 0, 0, 0.05);
  transition: box-shadow 0.3s ease, border-color 0.3s ease,
    background-color 0.3s ease;

  &:hover {
    box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1),
      0 2px 4px -2px rgba(0, 0, 0, 0.1);
  }

  @at-root .dark #{&} {
    border-color: rgba(55, 65, 81, 0.6);
  }
}
</style>
