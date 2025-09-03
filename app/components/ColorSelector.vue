<script setup lang="ts">
const colorMode = useColorMode();

const setPreference = (preference: string) => {
  colorMode.preference = preference;
};
</script>

<template>
  <div class="color-selector">
    <UTooltip
      v-if="colorMode.value === 'light'"
      :text="'In den Dunkel-Modus wechseln'"
      :delay-duration="0"
      :content="{ side: 'top', sideOffset: 12 }"
    >
      <UIcon
        name="i-lucide-moon"
        class="color-selector__icon"
        style="--color-secondary: var(--color-secondary, #8b5cf6)"
        aria-label="In den Dunkel-Modus wechseln"
        @click="setPreference('dark')"
      />
    </UTooltip>
    <UTooltip
      v-else
      :text="'In den Hell-Modus wechseln'"
      :delay-duration="0"
      :content="{ side: 'top', sideOffset: 12 }"
    >
      <UIcon
        name="i-lucide-sun"
        class="color-selector__icon"
        style="--color-secondary: var(--color-secondary, #8b5cf6)"
        aria-label="In den Hell-Modus wechseln"
        @click="setPreference('light')"
      />
    </UTooltip>
  </div>
</template>

<style lang="scss" scoped>
$block: "color-selector";

.#{$block} {
  display: flex;
  align-items: center;
  justify-content: center;
  height: 100%; // Ensures it takes full height of parent container

  &__icon {
    color: #111827;
    cursor: pointer;
    font-size: var(--font-size-xl);
    transition: color 0.2s ease;

    &:hover {
      color: var(--color-primary) !important;
    }
  }
}
</style>
