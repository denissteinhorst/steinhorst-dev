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

// Calculate the number of grid rows needed for the compact cards
const gridRows = computed(() =>
  Math.max(1, Math.ceil(testimonials.value.length / 2))
);

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
    :next-section="'contact'"
  >
    <template #content>
      <div class="testimonial-section">
        <!-- Mobile/tablet: Show only center column -->
        <div class="testimonial-section__mobile-layout">
          <div
            class="testimonial-section__center-column"
            role="region"
            aria-label="Selected testimonial details"
          >
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
        </div>

        <!-- Desktop: Three-column layout with proper tab order -->
        <div
          class="testimonial-section__desktop-layout"
          :style="{
            '--grid-rows': gridRows,
          }"
          role="region"
          aria-label="Testimonial navigation and details"
        >
          <!-- All compact cards in tab order (DOM order determines tab order) -->
          <div
            v-for="(card, index) in testimonials"
            :key="card.id"
            :class="`testimonial-section__compact-card testimonial-section__compact-card--${
              index % 2 === 0 ? 'left' : 'right'
            }`"
          >
            <TestimonialCardCompact
              :data="card"
              :is-active="index === activeIndex"
              @click="handleCardClick(index)"
            />
          </div>

          <!-- Selected testimonial details -->
          <div
            class="testimonial-section__center-column"
            aria-label="Selected testimonial details"
          >
            <TestimonialCardLarge
              v-if="currentTestimonial"
              :key="currentTestimonial.id || activeIndex"
              :data="currentTestimonial"
              :show-alternative="showAlternativeLanguage"
              @toggle-language="handleLanguageToggle"
            />

            <!-- Pagination navigation -->
            <nav
              v-if="testimonials.length > 1"
              class="testimonial-section__pagination"
              aria-label="Testimonial pagination"
            >
              <UPagination
                v-model:page="page"
                :total="testimonials.length"
                :items-per-page="1"
                size="md"
                active-color="primary"
              />
            </nav>
          </div>
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

  &__mobile-layout {
    display: block;

    @media (min-width: 1024px) {
      display: none;
    }
  }

  &__desktop-layout {
    display: none;

    @media (min-width: 1024px) {
      display: grid;
      grid-template-columns: 1fr 2fr 1fr;
      grid-template-rows: repeat(var(--grid-rows, 1), min-content);
      gap: 2rem;
      align-items: start;
    }
  }

  &__compact-card {
    @media (min-width: 1024px) {
      &--left {
        // Left column: even indices (0, 2, 4...)
        grid-column: 1;
      }

      &--right {
        // Right column: odd indices (1, 3, 5...)
        grid-column: 3;
      }
    }
  }

  &__center-column {
    @media (min-width: 1024px) {
      grid-column: 2;
      grid-row: 1 / -1; // Span all available rows
      display: flex;
      flex-direction: column;
      gap: 1.5rem;
    }

    @media (max-width: 1023px) {
      display: flex;
      flex-direction: column;
      gap: 1.5rem;
    }
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
