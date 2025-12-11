<script setup lang="ts">
const { cmsRequest, currentLocaleString } = useStrapi()

const { data, pending, error } = await useLazyAsyncData<FeaturedProjectsSectionResponse>(
  `featured-projects-${currentLocaleString.value}`,
  () =>
    cmsRequest<FeaturedProjectsSectionResponse>(
      'featured-section',
      ['jumpmark', 'title', 'text', 'featureCards'],
      false,
      ['featureCards.image'],
    ),
)

const toRichTextNodes = (value: unknown): RichTextNodes => {
  if (Array.isArray(value)) return value as unknown as RichTextNodes
  if (typeof value === 'string' && value.trim().length > 0) {
    return [
      {
        type: 'paragraph',
        children: [{ type: 'text', text: value }],
      },
    ] as unknown as RichTextNodes
  }
  return [] as unknown as RichTextNodes
}

const headerText = computed<RichTextNodes>(() => toRichTextNodes(data.value?.text))
</script>

<template>
  <template v-if="pending">
    <section class="featured-section">Loading featured-section...</section>
  </template>

  <template v-else-if="error">
    <section class="featured-section">Failed to load featured-section.</section>
  </template>

  <SectionWrapper
    v-else-if="data"
    :jumpmark="data.jumpmark || 'featured-projects'"
    variant="h2"
    :header-title="data.title || ''"
    :header-text="headerText"
    :next-section="'experiences'"
  >
    <template #content>
      <div class="featured-section" aria-label="Featured projects">
        <div class="featured-section__grid" role="list" aria-label="Featured project cards">
          <div
            v-for="(card, index) in data.featureCards || []"
            :key="card?.id || index"
            class="featured-section__card-wrapper"
            role="listitem"
            data-aos="fade-up"
            :data-aos-delay="Math.min(index, 5) * 100"
          >
            <FeaturedProjectCard :data="card" />
          </div>
        </div>
      </div>
    </template>
  </SectionWrapper>
</template>

<style scoped lang="scss">
$block: 'featured-section';

.#{$block} {
  &__grid {
    display: grid;
    gap: var(--spacing-xl);
    grid-template-columns: repeat(1, minmax(0, 1fr));

    @media (min-width: 640px) {
      grid-template-columns: repeat(2, minmax(0, 1fr));
    }

    @media (min-width: 1024px) {
      grid-template-columns: repeat(3, minmax(0, 1fr));
    }
  }

  &__card-wrapper {
    height: 100%;
    display: flex;
  }
}
</style>
