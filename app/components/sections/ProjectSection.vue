<script setup lang="ts">
const { cmsRequest, currentLocaleString } = useStrapi()

const { data, pending, error } = await useLazyAsyncData<ProjectSectionResponse>(
  `project-${currentLocaleString.value}`,
  (): Promise<ProjectSectionResponse> =>
    cmsRequest<ProjectSectionResponse>(
      'project-section',
      ['title', 'text', 'jumpmark', 'lastProjectCard', 'projectCards', 'footnote'],
      false,
      ['projectCards.logo', 'lastProjectCard'],
    ),
)

const showCount = ref<number>(4)
const selectedTags = ref<string[]>([])
const isFiltering = ref<boolean>(false)

const headerText = computed<RichTextNodes>(() => data.value?.text ?? [])
const footerText = computed<RichTextNodes>(() => data.value?.footnote ?? [])

const allTags = computed<string[]>(() => {
  if (!data.value?.projectCards) return []

  const tags = new Set<string>()
  data.value.projectCards.forEach((projectCard) => {
    projectCard.tagList?.forEach((tag) => {
      const tagText = extractTextFromRichText(tag)
      if (tagText) tags.add(tagText)
    })
  })

  return Array.from(tags)
})

const extractTextFromRichText = (block: RichTextBlock): string => {
  if (block.text) {
    return block.text
  }
  if (block.children?.length) {
    return block.children
      .map((child: RichTextBlock): string => extractTextFromRichText(child))
      .join('')
  }
  return ''
}

// Filter projects by tags
const filteredProjects = computed((): ProjectCard[] => {
  if (!data.value?.projectCards) return []
  if (selectedTags.value.length === 0) {
    return data.value.projectCards.slice(0, isFiltering.value ? undefined : showCount.value)
  }

  return data.value.projectCards.filter((card: ProjectCard): boolean => {
    const cardTags =
      card.tagList?.map((tag: RichTextBlock): string =>
        extractTextFromRichText(tag).toLowerCase(),
      ) || []
    return selectedTags.value.some((tag: string): boolean =>
      cardTags.some((cardTag: string): boolean => cardTag.includes(tag.toLowerCase())),
    )
  })
})
</script>

<template>
  <template v-if="pending">
    <section class="project-section">Loading project-section...</section>
  </template>

  <template v-else-if="error">
    <section class="project-section">Failed to load project-section.</section>
  </template>

  <SectionWrapper
    v-else-if="data"
    variant="h2"
    :jumpmark="data.jumpmark || ''"
    :header-title="data.title || ''"
    :header-text="headerText"
    :footer-text="footerText"
    :next-section="'experiences'"
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
      <div class="project-section__grid" role="list" aria-label="Project cards">
        <div
          v-for="(card, index) in filteredProjects"
          :key="index"
          data-aos="none"
          :data-aos-delay="100"
          class="project-section__card-wrapper"
          role="listitem"
        >
          <ProjectCard :data="card" />
        </div>

        <div
          v-if="
            data.lastProjectCard && !isFiltering && showCount >= (data.projectCards?.length || 0)
          "
          class="project-section__card-wrapper"
          role="listitem"
        >
          <ProjectCardLast :data="data.lastProjectCard" />
        </div>
      </div>
    </template>
  </SectionWrapper>
</template>

<style scoped lang="scss">
$block: 'project-section';

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
