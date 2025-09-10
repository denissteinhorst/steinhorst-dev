<script setup lang="ts">
const { cmsRequest, currentLocaleString } = useStrapi();

const { data, pending, error } =
  await useLazyAsyncData<ExperienceSectionResponse>(
    `experience-${currentLocaleString.value}`,
    () =>
      cmsRequest<ExperienceSectionResponse>(
        "experience-section",
        [
          "title",
          "text",
          "contactToggle",
          "expandToggle",
          "collapseToggle",
          "jumpmark",
          "experienceCards",
        ],
        false,
        ["experienceCards.logo"]
      )
  );

// Fetch job badge data server-first (non-lazy) so SSR & client markup stay identical
const { data: jobSearchData } = await useAsyncData<JobBadgeResponse>(
  () => `job-badge-${currentLocaleString.value}`,
  () => cmsRequest<JobBadgeResponse>("job-badge", ["isEnabled"], false, [])
);

const visibleStationsBase = ref(3);
const isMobile = ref(false);

const headerText = computed<RichTextNodes>(() => data.value?.text ?? []);
const visibleStations = computed(() => visibleStationsBase.value);
const timelineStatus = computed(() => {
  const total = data.value?.experienceCards?.length || 0;
  return `Zeige ${visibleStations.value} von ${total} Stationen`;
});

const timelineItems = computed(() => {
  const cards = data.value?.experienceCards ?? [];
  let filteredCards = cards;

  // Skip first card if it's jobsearch-only and badge is disabled
  if (
    jobSearchData.value?.isEnabled === false &&
    cards.length > 0 &&
    cards[0]?.isJobsearch === true
  ) {
    filteredCards = cards.slice(1);
  }

  return filteredCards.map((card, cardIndex) => ({
    date: "",
    title: "",
    description: "",
    icon: cardIndex === 0 ? "i-lucide-rocket" : "i-lucide-code",
    card,
    isFirst: cardIndex === 0,
    index: cardIndex,
  }));
});

const visibleTimelineItems = computed(() => {
  return timelineItems.value.slice(0, visibleStations.value);
});

const checkMobile = () => {
  isMobile.value = window.innerWidth < 640;
};

const toggleStations = () => {
  const totalCards = data.value?.experienceCards?.length || 0;
  if (visibleStationsBase.value < totalCards) {
    visibleStationsBase.value += 1;
  } else {
    visibleStationsBase.value = isMobile.value ? 2 : 3;
  }
};

onMounted(() => {
  checkMobile();
  visibleStationsBase.value = isMobile.value ? 2 : 3;
  window.addEventListener("resize", checkMobile);
});

onUnmounted(() => {
  window.removeEventListener("resize", checkMobile);
});

watch(visibleStationsBase, (newValue, oldValue) => {
  if (newValue > oldValue && data.value?.experienceCards) {
    nextTick(() => {
      const lastCard = data.value?.experienceCards?.[newValue - 1];
      if (lastCard) {
        const lastId = `exp-${lastCard.id}`;
        const element = document.getElementById(lastId);
        element?.focus();
      }
    });
  }
});
</script>

<template>
  <template v-if="pending">
    <section class="experience-section">Loading experience-section...</section>
  </template>

  <template v-else-if="error">
    <section class="experience-section">
      Failed to load experience-section.
    </section>
  </template>

  <SectionWrapper
    v-else-if="data"
    :jumpmark="data.jumpmark || 'experiences'"
    variant="h2"
    :header-title="data.title || ''"
    :header-text="headerText"
    :is-wrapped="true"
    :next-section="'certifications'"
  >
    <template #content>
      <div class="experience-section">
        <!-- Vertical accent line -->
        <div class="experience-section__background" aria-hidden="true">
          <div class="experience-section__accent-line"></div>
        </div>

        <!-- Live status for screen reader users -->
        <p
          id="experience-status"
          class="experience-section__sr-only"
          aria-live="polite"
        >
          {{ timelineStatus }}
        </p>

        <!-- Timeline using Nuxt UI for proper connectors -->
        <UTimeline
          id="experience-timeline"
          :items="visibleTimelineItems"
          size="sm"
          color="secondary"
          class="experience-section__timeline"
        >
          <template #description="{ item }">
            <ExperienceCard
              :data="item.card"
              :index="item.index"
              :show-jobsearch-badge="!!jobSearchData?.isEnabled"
            />
            <div
              v-if="item.index === 0 && jobSearchData?.isEnabled"
              class="experience-section__contact-cta"
            >
              <UButton
                to="#contact"
                variant="outline"
                color="secondary"
                size="sm"
              >
                {{ $t("ui.contact_me") }}
              </UButton>
            </div>
          </template>
        </UTimeline>

        <!-- Toggle button -->
        <div
          v-if="data.experienceCards && data.experienceCards.length > 1"
          class="experience-section__toggle"
        >
          <UButton
            id="experience-toggle"
            class="experience-section__toggle-btn"
            variant="outline"
            color="secondary"
            size="lg"
            :aria-controls="'experience-timeline'"
            :aria-expanded="
              (
                visibleStations >= (data.experienceCards?.length || 0)
              ).toString()
            "
            aria-describedby="experience-status experience-instructions"
            @click="toggleStations"
          >
            {{
              visibleStations < (data.experienceCards?.length || 0)
                ? data.expandToggle || "Eine weitere Station anzeigen"
                : data.collapseToggle || "Berufserfahrungen einklappen"
            }}
          </UButton>
          <p id="experience-instructions" class="experience-section__sr-only">
            Schaltfläche zeigt nacheinander weitere Stationen an oder klappt zur
            Ausgangsansicht zurück.
          </p>
        </div>
      </div>
    </template>
  </SectionWrapper>
</template>

<style scoped lang="scss">
$block: "experience-section";

.#{$block} {
  position: relative;

  &__background {
    position: absolute;
    inset: 0;
    pointer-events: none;
  }

  &__accent-line {
    position: absolute;
    top: 0;
    left: calc(50% - 40rem);
    width: 1px;
    height: 100%;
    background: linear-gradient(
      to bottom,
      transparent,
      var(--color-secondary-500) 50%,
      transparent
    );
    opacity: 0.7;

    @media (max-width: 1023px) {
      display: none;
    }
  }

  &__sr-only {
    position: absolute;
    width: 1px;
    height: 1px;
    padding: 0;
    margin: -1px;
    overflow: hidden;
    clip: rect(0, 0, 0, 0);
    white-space: nowrap;
    border: 0;
  }

  &__timeline {
    width: 100%;

    /* Remove any hover effects that might enlarge cards - target all possible elements */
    :deep(*) {
      &:hover {
        transform: none !important;
        scale: none !important;
        transition: none !important;
      }
    }

    /* Specifically target timeline elements */
    :deep(.utimeline-item),
    :deep(.utimeline-item-content),
    :deep(.utimeline-description),
    :deep([class*="timeline"]),
    :deep([class*="utimeline"]) {
      transform: none !important;
      scale: none !important;
      transition: none !important;

      &:hover {
        transform: none !important;
        scale: none !important;
        transition: none !important;
      }
    }
  }

  &__contact-cta {
    margin-top: 0.5rem;
    margin-bottom: 1rem;
  }

  &__toggle {
    text-align: center;
    margin-top: 1.5rem;
    cursor: pointer;
  }

  /* Ensure pointer cursor on the actual button element as some UI libs override it */
  &__toggle-btn {
    cursor: pointer !important;
  }
}
</style>
