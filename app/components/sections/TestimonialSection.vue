<script setup lang="ts">
const { cmsRequest, currentLocaleString } = useStrapi();

const { data, pending, error } =
  await useLazyAsyncData<TestimonialSectionResponse>(
    `testimonials-${currentLocaleString.value}`,
    () =>
      cmsRequest<TestimonialSectionResponse>(
        "testimonial-section",
        ["title", "text", "jumpmark", "recommendationCards"],
        false,
        ["recommendationCards.avatar"]
      )
  );

const page = ref(1);
const showAlternativeLanguage = ref(false);

const headerText = computed<RichTextNodes>(() => data.value?.text ?? []);
const testimonials = computed(() => data.value?.recommendationCards || []);

const leftColumnItems = computed(() => {
  const items = testimonials.value;
  return items.filter((_, cardIndex) => cardIndex % 2 === 0);
});

const rightColumnItems = computed(() => {
  const items = testimonials.value;
  return items.filter((_, cardIndex) => cardIndex % 2 === 1);
});

const activeIndex = computed(() =>
  Math.max(
    0,
    Math.min(page.value - 1, Math.max(0, testimonials.value.length - 1))
  )
);

const currentTestimonial = computed(
  () => testimonials.value[activeIndex.value]
);

const handleCardClick = (cardIndex: number) => {
  const newPage = cardIndex + 1;
  if (newPage !== page.value) {
    page.value = newPage;
    showAlternativeLanguage.value = false;
  }
};

const handleLanguageToggle = () => {
  showAlternativeLanguage.value = !showAlternativeLanguage.value;
};

onMounted(() => {
  if (testimonials.value.length > 0) page.value = 1;
});

watch(page, () => {
  showAlternativeLanguage.value = false;
});
</script>

<template>
  <template v-if="pending">
    <section class="testimonial-section">
      Loading testimonial-section...
    </section>
  </template>

  <template v-else-if="error">
    <section class="testimonial-section">
      Failed to load testimonial-section.
    </section>
  </template>

  <SectionWrapper
    v-else-if="data"
    :jumpmark="data.jumpmark || 'testimonials'"
    variant="h2"
    :header-title="data.title || ''"
    :header-text="headerText"
  >
    <template #content>
      <div class="testimonial-section">
        <!-- Left column: Alternating items (even indices) -->
        <div class="testimonial-section__left-column">
          <TestimonialCardCompact
            v-for="(card, index) in leftColumnItems"
            :key="card.id"
            :data="card"
            :is-active="index * 2 === activeIndex"
            @click="handleCardClick(index * 2)"
          />
        </div>

        <!-- Center column: Large card with pagination -->
        <div class="testimonial-section__center-column">
          <TestimonialCardLarge
            v-if="currentTestimonial"
            :key="currentTestimonial.id || activeIndex"
            :data="currentTestimonial"
            :show-alternative="showAlternativeLanguage"
            @toggle-language="handleLanguageToggle"
          />

          <!-- Pagination -->
          <div
            v-if="testimonials.length > 1"
            class="testimonial-section__pagination"
          >
            <UPagination
              v-model:page="page"
              :total="testimonials.length"
              :items-per-page="1"
              size="md"
              active-color="primary"
            />
          </div>
        </div>

        <!-- Right column: Alternating items (odd indices) -->
        <div class="testimonial-section__right-column">
          <TestimonialCardCompact
            v-for="(card, index) in rightColumnItems"
            :key="card.id"
            :data="card"
            :is-active="index * 2 + 1 === activeIndex"
            @click="handleCardClick(index * 2 + 1)"
          />
        </div>
      </div>
    </template>
  </SectionWrapper>
</template>

<style scoped lang="scss">
$block: "testimonial-section";

.#{$block} {
  display: grid;
  grid-template-columns: 1fr;
  gap: 2rem;
  align-items: stretch;

  // Large screens: three-column layout
  @media (min-width: 1024px) {
    grid-template-columns: 1fr 2fr 1fr;
    gap: 2rem;
  }

  &__left-column,
  &__right-column {
    display: none;

    @media (min-width: 1024px) {
      display: flex;
      flex-direction: column;
      gap: 1rem;
      height: 100%;
      min-height: 0;
    }
  }

  &__center-column {
    display: flex;
    flex-direction: column;
    gap: 1.5rem;
  }

  &__pagination {
    display: flex;
    justify-content: center;
    margin-top: auto;

    :deep(.bg-primary) {
      background-color: var(--color-primary) !important;
    }

    :deep([data-state="active"]) {
      background-color: var(--color-primary) !important;
      border-color: var(--color-primary) !important;
    }
  }
}
</style>
