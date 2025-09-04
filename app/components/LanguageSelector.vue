<script setup lang="ts">
const { $t, $switchLocale, $getLocale } = useI18n();

// Locale switching logic
const currentLocale = computed<string>(() => $getLocale());
const targetLocale = computed<string>(() =>
  currentLocale.value === "de" ? "en" : "de"
);

const switchLocale = (): void => {
  $switchLocale(targetLocale.value);
};

// Locale helpers with fallbacks - ensure consistent rendering
const toWord = computed<string>(() => {
  const translatedValue = $t("language_switcher.to");
  if (typeof translatedValue === "string" && translatedValue) {
    return translatedValue;
  }
  return currentLocale.value === "de" ? "zu" : "to";
});

const localeSwitchTooltip = computed<string>(
  () =>
    `${$t("language_switcher.label")} ${toWord.value} ${$t(
      `language_switcher.${targetLocale.value}`
    )}`
);
</script>

<template>
  <div class="language-selector">
    <span class="sr-only">{{ localeSwitchTooltip }}</span>

    <UTooltip
      :text="localeSwitchTooltip"
      :delay-duration="0"
      :content="{ side: 'top', sideOffset: 15 }"
    >
      <UIcon
        name="i-heroicons-language-20-solid"
        class="language-selector__icon"
        @click="switchLocale()"
      />
    </UTooltip>
  </div>
</template>

<style scoped lang="scss">
$block: "language-selector";

.#{$block} {
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

  // Adjust spacing for desktop navigation context
  .main-navigation__extra & :deep(.iconify) {
    margin-left: 12px;
  }
}
</style>
