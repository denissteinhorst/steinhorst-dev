<script setup lang="ts">
const { cmsRequest, currentLocaleString } = useStrapi();

const { data, pending, error } = await useLazyAsyncData<ProjectSectionResponse>(
  () => `project-${currentLocaleString.value}`,
  (): Promise<ProjectSectionResponse> =>
    cmsRequest<ProjectSectionResponse>(
      "project-section",
      [
        "title",
        "text",
        "jumpmark",
        "lastProjectCard",
        "projectCards",
        "footnote",
      ],
      false,
      ["projectCards.logo", "lastProjectCard"]
    )
);

const headerText = computed<RichTextNodes>(() => data.value?.text ?? []);

const footerText = computed<RichTextNodes>(() => data.value?.footnote ?? []);

// Filter state
const showCount = ref<number>(4);
const selectedTags = ref<string[]>([]);
const isFiltering = ref<boolean>(false);

// Extract all unique tags from project cards
const allTags = computed<string[]>(() => {
  if (!data.value?.projectCards) return [];

  const tags = new Set<string>();
  data.value.projectCards.forEach((card) => {
    card.tagList?.forEach((tag) => {
      const tagText = extractTextFromRichText(tag);
      if (tagText) tags.add(tagText);
    });
  });

  return Array.from(tags);
});

// Helper function to extract text content from RichTextBlock
const extractTextFromRichText = (block: RichTextBlock): string => {
  if (block.text) {
    return block.text;
  }
  if (block.children?.length) {
    return block.children
      .map((child: RichTextBlock): string => extractTextFromRichText(child))
      .join("");
  }
  return "";
};

// Filter projects by tags
const filteredProjects = computed((): ProjectCard[] => {
  if (!data.value?.projectCards) return [];
  if (selectedTags.value.length === 0) {
    return data.value.projectCards.slice(
      0,
      isFiltering.value ? undefined : showCount.value
    );
  }

  return data.value.projectCards.filter((card: ProjectCard): boolean => {
    const cardTags =
      card.tagList?.map((tag: RichTextBlock): string =>
        extractTextFromRichText(tag).toLowerCase()
      ) || [];
    return selectedTags.value.some((tag: string): boolean =>
      cardTags.some((cardTag: string): boolean =>
        cardTag.includes(tag.toLowerCase())
      )
    );
  });
});
</script>

<template>
  <section v-if="pending" class="project-section">
    Loading project-section...
  </section>

  <section v-else-if="error" class="project-section">
    Failed to load project-section.
  </section>

  <SectionWrapper
    v-else-if="data"
    variant="h2"
    :jumpmark="data.jumpmark || ''"
    :header-title="data.title || ''"
    :header-text="headerText"
    :footer-text="footerText"
  >
    <template #content>
      <!-- PROJECT FILTER -->
      <ProjectFilter
        :project-count="data.projectCards?.length || 0"
        :all-tags="allTags"
        :filtered-count="filteredProjects.length"
        @update:show-count="showCount = $event"
        @update:selected-tags="selectedTags = $event"
        @update:is-filtering="isFiltering = $event"
      />

      <!-- PROJECT CARD GRID -->
      <div class="project-section__grid">
        <div
          v-for="(card, index) in filteredProjects"
          :key="index"
          data-aos="none"
          :data-aos-delay="100"
          class="project-section__card-wrapper"
        >
          <ProjectCard :data="card" />
        </div>

        <div
          v-if="
            data.lastProjectCard &&
            !isFiltering &&
            showCount >= (data.projectCards?.length || 0)
          "
          data-aos="fade-up"
          :data-aos-delay="Math.min(filteredProjects.length, 5) * 100"
          class="project-section__card-wrapper"
        >
          <ProjectCardLast :data="data.lastProjectCard" />
        </div>
      </div>
    </template>
  </SectionWrapper>
</template>

<style scoped lang="scss">
$block: "project-section";

.#{$block} {
  // Grid styles
  &__grid {
    display: grid;
    gap: 1.5rem;
    grid-template-columns: repeat(1, minmax(0, 1fr));

    // md
    @media (min-width: 768px) {
      grid-template-columns: repeat(2, minmax(0, 1fr));
    }
  }

  &__card-wrapper {
    height: 100%;
    display: flex;
    flex-direction: column;
  }
}
</style>
