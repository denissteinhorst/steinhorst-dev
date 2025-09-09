<script setup lang="ts">
const { $t } = useI18n();
const colorMode = useColorMode();

const setPreference = (preference: string): void => {
  colorMode.preference = preference;
};
</script>

<template>
  <div class="color-selector">
    <UTooltip
      v-if="colorMode.value === 'light'"
      :text="String($t('ui.switch_to_dark_mode'))"
      :delay-duration="0"
      :content="{ side: 'top', sideOffset: 12 }"
    >
      <UIcon
        name="i-lucide-moon"
        class="color-selector__icon"
        style="--color-secondary: var(--color-secondary, #8b5cf6)"
        :aria-label="String($t('ui.switch_to_dark_mode'))"
        @click="setPreference('dark')"
      />
    </UTooltip>
    <UTooltip
      v-else
      :text="String($t('ui.switch_to_light_mode'))"
      :delay-duration="0"
      :content="{ side: 'top', sideOffset: 12 }"
    >
      <UIcon
        name="i-lucide-sun"
        class="color-selector__icon"
        style="--color-secondary: var(--color-secondary, #8b5cf6)"
        :aria-label="String($t('ui.switch_to_light_mode'))"
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
