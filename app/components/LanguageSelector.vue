<script setup lang="ts">
const { $t, $switchLocale, $getLocale } = useI18n()

// Locale switching logic
const currentLocale = computed<string>(() => $getLocale())
const targetLocale = computed<string>(() => (currentLocale.value === 'de' ? 'en' : 'de'))

const switchLocale = (): void => {
  $switchLocale(targetLocale.value)
}

const localeSwitchTooltip = computed<string>(
  () =>
    `${$t('language_switcher.label')} ${$t('language_switcher.to')} ${$t(
      `language_switcher.${targetLocale.value}`,
    )}`,
)
</script>

<template>
  <div class="language-selector">
    <span class="sr-only">{{ localeSwitchTooltip }}</span>

    <UTooltip
      :text="localeSwitchTooltip"
      :delay-duration="0"
      :content="{ side: 'top', sideOffset: 15 }"
    >
      <button
        class="language-selector__button"
        :aria-label="localeSwitchTooltip"
        @click="switchLocale()"
      >
        <UIcon name="i-heroicons-language-20-solid" class="language-selector__icon" />
      </button>
    </UTooltip>
  </div>
</template>

<style scoped lang="scss">
$block: 'language-selector';

.#{$block} {
  &__button {
    background: none;
    border: none;
    padding: 0;
    cursor: pointer;
    display: inline-flex;
    align-items: center;
    justify-content: center;
    border-radius: 0.375rem;
    transition: color 0.2s ease-in-out;
    color: #ffffff;
    font-size: 17px;
    text-shadow: 0 1px 4px rgba(0, 0, 0, 1);

    &:focus-visible {
      outline: 2px solid var(--color-primary, #a78bfa);
      outline-offset: 2px;
    }

    &:hover,
    &:focus {
      color: var(--color-secondary);

      .language-selector__icon {
        color: var(--color-secondary);
      }
    }
  }

  &__icon {
    margin-top: 6px;
    margin-left: 0;
    transition: color 0.2s ease-in-out;
  }

  :deep(.iconify) {
    cursor: pointer;
    transition: color 0.2s ease-in-out;
    margin-top: 6px;
    margin-left: 0;

    &:hover,
    &:focus {
      color: var(--color-secondary);
    }
  }

  .navigation-section__extra & :deep(.iconify) {
    margin-left: 12px;
  }
}
</style>
