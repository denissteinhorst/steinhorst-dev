<script setup lang="ts">
const { cmsRequest } = useStrapi();

const { data, pending, error } =
  await useLazyAsyncData<PersonalitySectionResponse>("personality", () =>
    cmsRequest<PersonalitySectionResponse>(
      "personality-section",
      ["title", "text", "jumpmark", "personalityCards"],
      undefined,
      false,
      [
        "personalityCards.polarChartTooltips",
        "personalityCards.barChartTooltips",
      ]
    )
  );

const headerText = computed<BlockNode[]>(
  () => (data.value?.text ?? []) as BlockNode[]
);
</script>

<template>
  <section v-if="pending" class="personality-section">
    Loading skill-section...
  </section>

  <section v-else-if="error" class="personality-section">
    Failed to load skill-section.
  </section>

  <section-wrapper
    v-else-if="data"
    variant="h2"
    :jumpmark="data.jumpmark || ''"
    :header-title="data.title || ''"
    :header-text="headerText"
  >
    <template #content>
      <div class="personality-section__grid">
        <base-card
          v-for="(card, index) in data.personalityCards"
          :key="index"
          class="personality-section__card"
        >
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
    </template>
  </section-wrapper>
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

  &__card {
    display: flex;
    flex-direction: column;
  }
}
</style>
