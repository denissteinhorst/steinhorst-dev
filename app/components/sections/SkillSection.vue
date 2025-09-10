<script setup lang="ts">
import type { SkillItem } from "~/types/types";

const { cmsRequest, currentLocaleString } = useStrapi();

const { data, pending, error } = await useLazyAsyncData<SkillSectionResponse>(
  `skills-${currentLocaleString.value}`,
  () =>
    cmsRequest<SkillSectionResponse>(
      "skill-section",
      ["title", "text", "jumpmark", "quickFilter", "skillCards"],
      false,
      ["quickFilter", "skillCards.skillItems"]
    )
);

const modalOpen = ref(false);

const headerText = computed<RichTextNodes>(() => data.value?.text ?? []);

const handleButtonClick = () => {
  modalOpen.value = true;
};

const toListItems = (items?: SkillItem[]): string[] =>
  items?.map((skillItem) => skillItem.title || "") ?? [];
</script>

<template>
  <template v-if="pending">
    <section class="skill-section">Loading skill-section...</section>
  </template>

  <template v-else-if="error">
    <section class="skill-section">Failed to load skill-section.</section>
  </template>

  <SectionWrapper
    v-else-if="data"
    variant="h2"
    :jumpmark="data.jumpmark || ''"
    :header-title="data.title || ''"
    :button-text="data.quickFilter?.toggle"
    :button-icon="data.quickFilter?.icon"
    :header-text="headerText"
    :next-section="'personality'"
    @button-click="handleButtonClick"
  >
    <template #content>
      <!-- QUICK FILTER -->
      <SkillQuickFilter
        v-model:open="modalOpen"
        :quick-filter="data.quickFilter"
        :skill-cards="data.skillCards"
        @close="modalOpen = false"
      />

      <!-- SKILL CARD GRID -->
      <div class="skill-section__grid">
        <SkillCard
          v-for="(card, index) in data.skillCards"
          :key="index"
          :title="card.title || ''"
          :list-items="toListItems(card.skillItems)"
          :index="index"
        />
      </div>
    </template>
  </SectionWrapper>
</template>

<style scoped lang="scss">
$block: "skill-section";

.#{$block} {
  // Grid styles
  &__grid {
    display: grid;
    gap: 1.5rem;
    grid-template-columns: repeat(1, minmax(0, 1fr));

    // sm
    @media (min-width: 640px) {
      gap: 1.75rem; // gap-7
      grid-template-columns: repeat(2, minmax(0, 1fr));
    }

    // md
    @media (min-width: 768px) {
      grid-template-columns: repeat(3, minmax(0, 1fr));
    }

    // lg
    @media (min-width: 1024px) {
      gap: 2rem; // gap-8
      grid-template-columns: repeat(2, minmax(0, 1fr));
    }

    // xl
    @media (min-width: 1280px) {
      grid-template-columns: repeat(3, minmax(0, 1fr));
    }
  }
}
</style>
