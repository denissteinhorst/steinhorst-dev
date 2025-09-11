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
      <button
        type="button"
        class="color-selector__button"
        :aria-label="String($t('ui.switch_to_dark_mode'))"
        @click="setPreference('dark')"
        @keydown.enter="setPreference('dark')"
        @keydown.space.prevent="setPreference('dark')"
      >
        <UIcon
          name="i-lucide-moon"
          class="color-selector__icon"
          style="--color-secondary: var(--color-secondary, #8b5cf6)"
        />
      </button>
    </UTooltip>
    <UTooltip
      v-else
      :text="String($t('ui.switch_to_light_mode'))"
      :delay-duration="0"
      :content="{ side: 'top', sideOffset: 12 }"
    >
      <button
        type="button"
        class="color-selector__button"
        :aria-label="String($t('ui.switch_to_light_mode'))"
        @click="setPreference('light')"
        @keydown.enter="setPreference('light')"
        @keydown.space.prevent="setPreference('light')"
      >
        <UIcon
          name="i-lucide-sun"
          class="color-selector__icon"
          style="--color-secondary: var(--color-secondary, #8b5cf6)"
        />
      </button>
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

  &__button {
    background: none;
    border: none;
    padding: 0;
    cursor: pointer;
    display: inline-flex;
    align-items: center;
    justify-content: center;
    border-radius: 50%;
    transition: all 0.3s ease-out;
    outline: none;
    width: 34px;
    height: 34px;

    &:hover {
      .#{$block}__icon {
        color: var(--color-primary) !important;
      }
    }

    &:focus-visible {
      box-shadow: 0 0 0 2px var(--color-primary);
      border-radius: 50%;
    }
  }

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
