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

// Active testimonial state management
// Use `page` (1-based) as single source of truth for UPagination
const page = ref(1);
const showAlternativeLanguage = ref(false);

// Computed properties for layout
const testimonials = computed(() => data.value?.recommendationCards || []);

// Alternate testimonials between left and right columns
const leftColumnItems = computed(() => {
  const items = testimonials.value;
  return items.filter((_, index) => index % 2 === 0);
});

const rightColumnItems = computed(() => {
  const items = testimonials.value;
  return items.filter((_, index) => index % 2 === 1);
});

// Active index derived from current page (keep UI 0-based internally)
const activeIndex = computed(() =>
  Math.max(
    0,
    Math.min(page.value - 1, Math.max(0, testimonials.value.length - 1))
  )
);

const currentTestimonial = computed(
  () => testimonials.value[activeIndex.value]
);

// Event handlers for child component communication
const handleCardClick = (index: number) => {
  // Cards provide 0-based index; convert to 1-based page
  const newPage = index + 1;
  if (newPage !== page.value) {
    page.value = newPage;
    showAlternativeLanguage.value = false; // Reset language toggle
  }
};

const handleLanguageToggle = () => {
  showAlternativeLanguage.value = !showAlternativeLanguage.value;
};

// Desktop height alignment: cap center column to min(left, right) height
const leftColRef = ref<HTMLElement | null>(null);
const rightColRef = ref<HTMLElement | null>(null);
const centerMaxHeight = ref<number | null>(null);

const updateCenterMaxHeight = () => {
  if (typeof window === "undefined") return;
  // Only constrain on ≥ 1024px (lg)
  if (window.innerWidth < 1024) {
    centerMaxHeight.value = null;
    return;
  }

  nextTick(() => {
    const lh = leftColRef.value?.offsetHeight || 0;
    const rh = rightColRef.value?.offsetHeight || 0;
    if (lh && rh) centerMaxHeight.value = Math.min(lh, rh);
    else centerMaxHeight.value = lh || rh || null;
  });
};

let resizeRaf: number | null = null;
const onResize = () => {
  if (resizeRaf) cancelAnimationFrame(resizeRaf);
  resizeRaf = requestAnimationFrame(updateCenterMaxHeight);
};

onMounted(() => {
  // Ensure we start on first item if available
  if (testimonials.value.length > 0) page.value = 1;
  nextTick(() => {
    updateCenterMaxHeight();
    // Minor delay to account for image/font layout shifts
    setTimeout(updateCenterMaxHeight, 250);
  });
  if (typeof window !== "undefined")
    window.addEventListener("resize", onResize);
});

onUnmounted(() => {
  if (typeof window !== "undefined")
    window.removeEventListener("resize", onResize);
});

// Recompute heights when page or language changes
watch(page, () => {
  showAlternativeLanguage.value = false;
  nextTick(updateCenterMaxHeight);
});
watch(showAlternativeLanguage, () => nextTick(updateCenterMaxHeight));
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
      <div class="testimonial-section">
        <!-- Left column: Alternating items (even indices) -->
        <div ref="leftColRef" class="testimonial-section__left-column">
          <testimonial-card-compact
            v-for="(card, index) in leftColumnItems"
            :key="card.id"
            :data="card"
            :is-active="index * 2 === activeIndex"
            @click="handleCardClick(index * 2)"
          />
        </div>

        <!-- Center column: Large card with pagination -->
        <div
          class="testimonial-section__center-column"
          :style="
            centerMaxHeight ? { maxHeight: centerMaxHeight + 'px' } : undefined
          "
        >
          <div class="testimonial-section__center-card">
            <testimonial-card-large
              v-if="currentTestimonial"
              :key="currentTestimonial.id || activeIndex"
              :data="currentTestimonial"
              :show-alternative="showAlternativeLanguage"
              @toggle-language="handleLanguageToggle"
            />
          </div>

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
        <div ref="rightColRef" class="testimonial-section__right-column">
          <testimonial-card-compact
            v-for="(card, index) in rightColumnItems"
            :key="card.id"
            :data="card"
            :is-active="index * 2 + 1 === activeIndex"
            @click="handleCardClick(index * 2 + 1)"
          />
        </div>
      </div>
    </template>
  </section-wrapper>
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
    display: none; // Hidden on mobile

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
    height: 100%;
    min-height: 0;

    @media (min-width: 1024px) {
      height: 100%; // Use full available height from grid container
    }
  }

  &__center-card {
    // Let the large card consume remaining space so its body can scroll
    flex: 1;
    min-height: 0; // required to allow inner scroll areas to shrink
    display: flex; // so child 100% height can apply
    overflow: hidden; // Ensure container doesn't grow beyond bounds
  }
  &__pagination {
    display: flex;
    justify-content: center;
    margin-top: auto;
  }
}
</style>
