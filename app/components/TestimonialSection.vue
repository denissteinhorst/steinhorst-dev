<script setup lang="ts">
const { cmsRequest } = useStrapi();

const { data, pending, error } =
  await useLazyAsyncData<TestimonialSectionResponse>("testimonials", () =>
    cmsRequest<TestimonialSectionResponse>(
      "testimonial-section",
      ["title", "text", "jumpmark", "recommendationCards"],
      undefined,
      false,
      ["recommendationCards.avatar"]
    )
  );

const headerText = computed<BlockNode[]>(
  () => (data.value?.text ?? []) as BlockNode[]
);
</script>

<template>
  <section v-if="pending" class="testimonial-section">
    Loading testimonial-section...
  </section>

  <section v-else-if="error" class="testimonial-section">
    Failed to load testimonial-section.
  </section>

  <section-wrapper
    v-else-if="data"
    :jumpmark="data.jumpmark || 'testimonials'"
    variant="h2"
    :header-title="data.title || ''"
    :header-text="headerText"
  >
    <template #content>
      <div class="testimonial-section" aria-label="Main">
        <testimonial-card-compact
          v-for="card in data.recommendationCards"
          :key="card.id"
          :data="{
            id: card.id,
            summary: card.summary,
            author: card.author,
            company: card.company,
            position: card.position,
          }"
        />

        <testimonial-card-large
          v-for="card in data.recommendationCards"
          :key="card.id"
          :data="card"
        />

        <small>
          <pre>{{ data }}</pre>
        </small>
      </div>
    </template>
  </section-wrapper>
</template>

<style scoped lang="scss">
$block: "testimonial-section";

.#{$block} {
}
</style>
