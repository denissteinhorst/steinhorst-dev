<script setup lang="ts">
const { cmsRequest, currentLocaleString } = useStrapi();

const { data, pending, error } =
  await useLazyAsyncData<PersonalitySectionResponse>(
    `personality-${currentLocaleString.value}`,
    () =>
      cmsRequest<PersonalitySectionResponse>(
        "personality-section",
        ["title", "text", "jumpmark", "personalityCards"],
        false,
        [
          "personalityCards.polarChartTooltips",
          "personalityCards.barChartTooltips",
        ]
      )
  );

const headerText = computed<RichTextNodes>(() => data.value?.text ?? []);
</script>

<template>
  <template v-if="pending">
    <section class="personality-section">
      Loading personality-section...
    </section>
  </template>

  <template v-else-if="error">
    <section class="personality-section">
      Failed to load personality-section.
    </section>
  </template>

  <SectionWrapper
    v-else-if="data"
    variant="h2"
    :jumpmark="data.jumpmark || ''"
    :header-title="data.title || ''"
    :header-text="headerText"
    :is-wrapped="true"
    :next-section="'projects'"
  >
    <template #content>
      <div class="personality-section__grid">
        <div
          v-for="(personalityCard, cardIndex) in data.personalityCards"
          :key="cardIndex"
          data-aos="fade-up"
          :data-aos-delay="cardIndex * 100"
          class="personality-section__card-wrapper"
        >
          <BaseCard :is-in-wrapper="true" class="personality-section__card">
            <div class="personality-section__card-content">
              <template v-if="personalityCard.variant === 'polarChart'">
                <PolarchartCard
                  :title="personalityCard.title"
                  :subtitle="personalityCard.subtitle"
                  :text="personalityCard.text"
                  :tooltips="personalityCard.polarChartTooltips || []"
                />
                <div class="personality-section__button-container">
                  <UButton
                    :to="'https://persolog.com/de/persolog-persoenlichkeits-modell/'"
                    variant="ghost"
                    color="secondary"
                    size="xs"
                    class="personality-section__button"
                    target="_blank"
                    rel="noopener noreferrer"
                    :aria-label="`persolog.com (${$t('ui.opens_in_new_tab')})`"
                  >
                    <span class="personality-section__button-text">{{
                      $t("personality_section.more_info_persolog")
                    }}</span>
                    <span class="sr-only"
                      >({{ $t("ui.opens_in_new_tab") }})</span
                    >
                    <UIcon
                      name="i-heroicons-arrow-top-right-on-square"
                      class="personality-section__button-icon"
                      aria-hidden="true"
                    />
                  </UButton>
                </div>
              </template>
              <template v-else-if="personalityCard.variant === 'barChart'">
                <BarchartCard
                  :title="personalityCard.title"
                  :subtitle="personalityCard.subtitle"
                  :text="personalityCard.text"
                  :tooltips="personalityCard.barChartTooltips || []"
                />
                <div class="personality-section__button-container">
                  <UButton
                    :to="'https://ipmag.ch/de/'"
                    variant="ghost"
                    color="secondary"
                    size="xs"
                    class="personality-section__button"
                    target="_blank"
                    rel="noopener noreferrer"
                    :aria-label="`ipmag.ch (${$t('ui.opens_in_new_tab')})`"
                  >
                    <span class="personality-section__button-text">{{
                      $t("personality_section.more_info_ipm")
                    }}</span>
                    <span class="sr-only"
                      >({{ $t("ui.opens_in_new_tab") }})</span
                    >
                    <UIcon
                      name="i-heroicons-arrow-top-right-on-square"
                      class="personality-section__button-icon"
                      aria-hidden="true"
                    />
                  </UButton>
                </div>
              </template>
            </div>
          </BaseCard>
        </div>
      </div>
    </template>
  </SectionWrapper>
</template>

<style scoped lang="scss">
$block: "personality-section";

.#{$block} {
  &__grid {
    display: grid;
    gap: 1.5rem;
    grid-template-columns: repeat(1, minmax(0, 1fr));

    // lg
    @media (min-width: 1024px) {
      grid-template-columns: repeat(2, minmax(0, 1fr));
    }
  }

  &__card-wrapper {
    height: 100%;
    display: flex;
    flex-direction: column;
  }

  &__card {
    display: flex;
    flex-direction: column;
    height: 100%;
    position: relative;
    padding-bottom: 2rem;
  }

  &__card-content {
    flex: 1;
  }

  &__button-container {
    position: absolute;
    bottom: 1rem;
    right: 1rem;
  }

  &__button {
    gap: 0.25rem !important;

    // Force vertical alignment with line-height
    line-height: 1 !important;
    vertical-align: baseline !important;
  }

  &__button-icon {
    width: 1rem;
    height: 1rem;
    flex-shrink: 0;
    vertical-align: middle !important;
    transform: translateY(-1px); // Fine-tune vertical position
  }

  &__button-text {
    font-weight: 500;
    color: #4b5563;
    vertical-align: middle !important;
    line-height: 1 !important;

    @at-root .dark #{&} {
      color: #d1d5db;
    }
  }
}
</style>
