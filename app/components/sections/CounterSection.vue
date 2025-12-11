<script setup lang="ts">
const { cmsRequest, currentLocaleString } = useStrapi()

const { data, pending, error } = await useLazyAsyncData<CounterSectionResponse>(
  `counters-${currentLocaleString.value}`,
  () =>
    cmsRequest<CounterSectionResponse>('counter-section', [
      'title',
      'text',
      'jumpmark',
      'counterCards',
    ]),
)

const headerText = computed<RichTextNodes>(() => {
  const textData = data.value?.text
  // Handle case where CMS returns a string instead of BlockNode[]
  if (!textData) return []
  if (Array.isArray(textData)) return textData
  // If it's a string, wrap it in a paragraph block node
  return [
    {
      type: 'paragraph',
      children: [{ type: 'text', text: textData }],
    },
  ] as RichTextNodes
})
</script>

<template>
  <template v-if="pending">
    <section class="counter-section">Loading counter-section...</section>
  </template>

  <template v-else-if="error">
    <section class="counter-section">Failed to load counter-section.</section>
  </template>

  <SectionWrapper
    v-else-if="data"
    :jumpmark="data.jumpmark || 'counters'"
    variant="h2"
    :header-title="data.title || ''"
    :header-text="headerText"
    :is-wrapped="true"
    :next-section="'skills'"
  >
    <template #content>
      <div class="counter-section" aria-label="Main">
        <div class="counter-section__grid" role="list" aria-label="Counter cards">
          <div
            v-for="(counterCard, cardIndex) in data.counterCards"
            :key="cardIndex"
            data-aos="fade-up"
            :data-aos-delay="Math.min(cardIndex, 5) * 100"
            class="counter-section__card-wrapper"
            role="listitem"
          >
            <CounterCard :data="counterCard" />
          </div>
        </div>
      </div>
    </template>
  </SectionWrapper>
</template>

<style scoped lang="scss">
$block: 'counter-section';

.#{$block} {
  &__grid {
    display: grid;
    gap: 1.5rem;
    grid-template-columns: repeat(1, minmax(0, 1fr));

    // sm
    @media (min-width: 640px) {
      gap: 1.75rem;
      grid-template-columns: repeat(2, minmax(0, 1fr));
    }

    // lg
    @media (min-width: 1024px) {
      gap: 2rem;
      grid-template-columns: repeat(3, minmax(0, 1fr));
    }
  }

  &__card-wrapper {
    position: relative;
    height: 100%;
    display: flex;
    flex-direction: column;
    z-index: 1;
  }
}
</style>

<style lang="scss">
$divider-light: #eceff1;
$divider-dark: #2b3442;

// Dividers - unscoped to allow dark mode selector
.counter-section__card-wrapper:not(:last-child)::after {
  content: '';
  position: absolute;
  bottom: -0.75rem;
  left: 50%;
  transform: translateX(-50%);
  width: 40%;
  height: 2px;
  background-color: $divider-light;
  opacity: 0.85;
  z-index: 1;
  pointer-events: none;
}

.dark .counter-section__card-wrapper:not(:last-child)::after {
  background-color: $divider-dark;
}

// sm: Vertical dividers between columns
@media (min-width: 640px) {
  .counter-section__card-wrapper:not(:last-child)::after {
    bottom: auto;
    left: auto;
    right: calc(-1.75rem / 2);
    top: 50%;
    transform: translateY(-50%);
    width: 2px;
    height: 70%;
  }

  // Hide divider on last item of each row (2 columns)
  .counter-section__card-wrapper:nth-child(2n)::after {
    display: none;
  }
}

// lg: Adjust for 3 columns
@media (min-width: 1024px) {
  .counter-section__card-wrapper:not(:last-child)::after {
    right: calc(-2rem / 2);
  }

  // Reset 2-column rule, hide on every 3rd item
  .counter-section__card-wrapper:nth-child(2n)::after {
    display: block;
  }

  .counter-section__card-wrapper:nth-child(3n)::after {
    display: none;
  }
}
</style>
