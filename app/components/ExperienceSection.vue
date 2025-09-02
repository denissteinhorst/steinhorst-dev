<script setup lang="ts">
const { cmsRequest } = useStrapi();

const { data, pending, error } =
  await useLazyAsyncData<ExperienceSectionResponse>("experience", () =>
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
      undefined,
      false,
      ["experienceCards.logo"]
    )
  );

// State to manage the number of visible stations (default: 3 for desktop, 2 for mobile)
const visibleStationsBase = ref(3);
const isMobile = ref(false);

// Check if device is mobile
const checkMobile = () => {
  isMobile.value = window.innerWidth < 640;
};

onMounted(() => {
  checkMobile();
  // Initialize the visible items based on device on first mount
  visibleStationsBase.value = isMobile.value ? 2 : 3;
  window.addEventListener("resize", checkMobile);
});

onUnmounted(() => {
  window.removeEventListener("resize", checkMobile);
});

// Computed number of visible stations (device-agnostic; base is initialized per device)
const visibleStations = computed(() => visibleStationsBase.value);

// Live status string for assistive tech
const timelineStatus = computed(() => {
  const total = data.value?.experienceCards?.length || 0;
  return `Zeige ${visibleStations.value} von ${total} Stationen`;
});

// Focus last newly revealed station heading when expanding
watch(visibleStationsBase, (newVal, oldVal) => {
  if (newVal > oldVal && data.value?.experienceCards) {
    nextTick(() => {
      const lastCard = data.value?.experienceCards?.[newVal - 1];
      if (lastCard) {
        const lastId = `exp-${lastCard.id}`;
        const el = document.getElementById(lastId);
        el?.focus();
      }
    });
  }
});

// Function to toggle the number of visible stations
const toggleStations = () => {
  const totalCards = data.value?.experienceCards?.length || 0;
  if (visibleStationsBase.value < totalCards) {
    visibleStationsBase.value += 1;
  } else {
    // Reset to device-specific initial value
    visibleStationsBase.value = isMobile.value ? 2 : 3;
  }
};

const headerText = computed<BlockNode[]>(
  () => (data.value?.text ?? []) as BlockNode[]
);

// Map cards to Timeline items so UTimeline renders connected separators
const timelineItems = computed(() => {
  const cards = data.value?.experienceCards ?? [];
  return cards.map((card, idx) => ({
    date: "",
    title: "",
    description: "",
    icon: idx === 0 ? "i-lucide-rocket" : "i-lucide-code",
    card,
    isFirst: idx === 0,
  }));
});

const visibleTimelineItems = computed(() => {
  return timelineItems.value.slice(0, visibleStations.value);
});
</script>

<template>
  <small v-if="pending" class="experience-section">
    Loading experience-section...
  </small>
  <small v-else-if="error" class="experience-section">
    Failed to load experience-section.
  </small>
  <SectionWrapper
    v-else-if="data"
    :jumpmark="data.jumpmark || 'experience'"
    variant="h2"
    :header-title="data.title || ''"
    :header-text="headerText"
    class="experience-section__wrapper"
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
            <ExperienceCard :data="item.card" />
            <div v-if="item.isFirst" class="experience-section__contact-cta">
              <UButton
                to="/#contact"
                variant="outline"
                color="secondary"
                size="sm"
              >
                Kontakt aufnehmen
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

  &__wrapper {
    position: relative;

    &::before {
      content: "";
      position: absolute;
      top: -2rem;
      bottom: -2rem;
      left: 50%;
      right: 50%;
      margin-left: -50vw;
      margin-right: -50vw;
      width: 100vw;
      background-color: rgba(0, 0, 0, 0.05);
      pointer-events: none;
      z-index: -1;

      @at-root .dark #{&} {
        background-color: rgba(0, 0, 0, 0.2) !important;
      }

      @media (min-width: 640px) {
        top: -5rem;
        bottom: -5rem;
      }

      @media (min-width: 1024px) {
        top: 0;
        bottom: 0;
      }
    }
  }

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
