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
        class="color-selector--icon"
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
        class="color-selector--icon"
        aria-label="In den Hell-Modus wechseln"
        @click="setPreference('light')"
      />
    </UTooltip>
  </div>
</template>

<style lang="scss" scoped>
$block: "color-selector";

.#{$block} {
  &--icon {
    cursor: pointer;

    &:hover {
      color: var(--color-primary);
      transition: color 0.33s ease;
    }
  }
}
</style>
