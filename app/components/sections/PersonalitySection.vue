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
            <template v-if="personalityCard.variant === 'polarChart'">
              <PolarchartCard
                :title="personalityCard.title"
                :subtitle="personalityCard.subtitle"
                :text="personalityCard.text"
                :tooltips="personalityCard.polarChartTooltips || []"
              />
            </template>
            <template v-else-if="personalityCard.variant === 'barChart'">
              <BarchartCard
                :title="personalityCard.title"
                :subtitle="personalityCard.subtitle"
                :text="personalityCard.text"
                :tooltips="personalityCard.barChartTooltips || []"
              />
            </template>
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
  }
}
</style>
