<script setup lang="ts">
const { cmsRequest, currentLocaleString } = useStrapi();

const { data, pending, error } =
  await useLazyAsyncData<PersonalitySectionResponse>(
    () => `personality-${currentLocaleString.value}`,
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
  <section v-if="pending" class="personality-section">
    Loading personality-section...
  </section>

  <section v-else-if="error" class="personality-section">
    Failed to load personality-section.
  </section>

  <section-wrapper
    v-else-if="data"
    variant="h2"
    :jumpmark="data.jumpmark || ''"
    :header-title="data.title || ''"
    :header-text="headerText"
    class="personality-section__wrapper"
  >
    <template #content>
      <div class="personality-section__grid">
        <div
          v-for="(card, index) in data.personalityCards"
          :key="index"
          data-aos="fade-up"
          :data-aos-delay="index * 100"
          class="personality-section__card-wrapper"
        >
          <base-card :is-in-wrapper="true" class="personality-section__card">
            <template v-if="card.variant === 'polarChart'">
              <polar-chart
                :title="card.title"
                :subtitle="card.subtitle"
                :text="card.text"
                :tooltips="card.polarChartTooltips || []"
              />
            </template>
            <template v-else-if="card.variant === 'barChart'">
              <bar-chart
                :title="card.title"
                :subtitle="card.subtitle"
                :text="card.text"
                :tooltips="card.barChartTooltips || []"
              />
            </template>
          </base-card>
        </div>
      </div>
    </template>
  </section-wrapper>
</template>

<style scoped lang="scss">
$block: "personality-section";

.#{$block} {
  &__wrapper {
    position: relative;

    &::before {
      content: "";
      position: fixed;
      top: 0;
      bottom: 0;
      left: 0;
      right: 0;
      background-color: #fafafa;
      pointer-events: none;
      z-index: -1;

      @at-root .dark #{&} {
        background-color: rgba(0, 0, 0, 0.1) !important;
      }
    }
  }

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
