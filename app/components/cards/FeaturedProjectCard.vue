<script setup lang="ts">
const props = defineProps<{ data: FeaturedProjectCard }>()

const { buildImageUrl } = useStrapi()
const { generateComponentId } = useIdGenerator()

const cardId = computed(() =>
  generateComponentId(
    'featured-project',
    props.data.name || props.data.title || 'project',
    props.data.id || 0,
  ),
)

const logoUrl = computed<string | undefined>(() => {
  const url = buildImageUrl(props.data.image, 'medium')
  return url === null ? undefined : url
})

const linkTarget = computed(() => props.data.target || '_blank')
const altText = computed(
  () => props.data.image?.alternativeText || props.data.title || props.data.name || 'Projekt Logo',
)
</script>

<template>
  <BaseCard class="featured-card" :aria-labelledby="cardId">
    <div class="featured-card__content">
      <div class="featured-card__media" aria-hidden="true">
        <NuxtImg
          v-if="props.data.image && logoUrl"
          format="webp"
          quality="80"
          :src="logoUrl"
          :alt="altText"
          class="featured-card__image"
          loading="lazy"
          decoding="async"
        />
        <div v-else class="featured-card__placeholder">
          <UIcon name="i-lucide-image" class="featured-card__placeholder-icon" />
        </div>
      </div>

      <div class="featured-card__body">
        <h3 :id="cardId" class="featured-card__title">{{ props.data.name }}</h3>
        <p v-if="props.data.subtitle" class="featured-card__subtitle">{{ props.data.subtitle }}</p>
        <p v-if="props.data.description" class="featured-card__description">
          {{ props.data.description }}
        </p>

        <div v-if="props.data.link" class="featured-card__actions">
          <UButton
            :to="props.data.link"
            variant="soft"
            color="primary"
            size="sm"
            trailing-icon="i-lucide-arrow-up-right"
            :target="linkTarget"
            rel="noopener noreferrer"
            :aria-label="`Projektlink öffnen: ${props.data.title || props.data.name}`"
          >
            {{ props.data.title || $t('ui.view') || 'View' }}
          </UButton>
        </div>
      </div>
    </div>

    <span aria-hidden="true" class="featured-card__glow"></span>
  </BaseCard>
</template>

<style scoped lang="scss">
$block: 'featured-card';

.#{$block} {
  position: relative;
  display: flex;
  flex-direction: column;
  height: 100%;
  overflow: hidden;
  transition:
    transform 0.25s ease,
    box-shadow 0.25s ease;

  &__content {
    display: flex;
    flex-direction: column;
    gap: var(--spacing-lg);
    height: 100%;
    padding: var(--spacing-md);
  }

  &__media {
    display: flex;
    align-items: center;
    justify-content: center;
    width: 100%;
    aspect-ratio: 16 / 9;
    border-radius: var(--radius-default);
    background: linear-gradient(
      145deg,
      rgba(59, 130, 246, 0.06) 0%,
      rgba(99, 102, 241, 0.04) 50%,
      rgba(139, 92, 246, 0.03) 100%
    );
    border: 1px solid var(--color-border-light);
    overflow: hidden;
    transition:
      transform 0.25s ease,
      box-shadow 0.25s ease;

    @at-root .dark #{&} {
      background: linear-gradient(
        145deg,
        rgba(59, 130, 246, 0.1) 0%,
        rgba(99, 102, 241, 0.08) 50%,
        rgba(139, 92, 246, 0.06) 100%
      );
      border-color: var(--color-border-dark);
    }
  }

  &__image {
    max-width: 70%;
    max-height: 70%;
    width: auto;
    height: auto;
    object-fit: contain;
    filter: drop-shadow(0 4px 12px rgba(0, 0, 0, 0.06));
    transition: transform 0.25s ease;
  }

  &__placeholder {
    display: grid;
    place-items: center;
    width: 100%;
    height: 100%;
    color: var(--color-text-muted);
  }

  &__placeholder-icon {
    width: 2.5rem;
    height: 2.5rem;
    opacity: 0.5;
  }

  &__body {
    display: flex;
    flex-direction: column;
    align-items: center;
    text-align: center;
    gap: var(--spacing-xs);
    flex: 1;
    min-height: 0;
  }

  &__title {
    margin: 0;
    font-size: var(--font-size-lg);
    font-weight: 600;
    letter-spacing: -0.01em;
    color: var(--color-heading);
    line-height: 1.3;
  }

  &__subtitle {
    margin: 0;
    font-size: var(--font-size-sm);
    font-weight: 500;
    color: var(--color-primary, #3b82f6);
    opacity: 0.9;
  }

  &__description {
    margin: 0;
    color: var(--color-text-secondary);
    line-height: 1.5;
    font-size: var(--font-size-sm);
    padding-bottom: calc(var(--spacing-xl) * 1.5);
  }

  &__actions {
    display: flex;
    align-items: center;
    justify-content: center;
    flex-shrink: 0;
    position: absolute;
    bottom: var(--spacing-xl);
  }

  &__glow {
    position: absolute;
    inset: 0;
    pointer-events: none;
    background: radial-gradient(
      ellipse 80% 50% at 50% 0%,
      rgba(59, 130, 246, 0.08),
      transparent 50%
    );
    opacity: 0;
    transition: opacity 0.3s ease;
  }

  &:hover {
    .#{$block}__glow {
      opacity: 1;
    }

    .#{$block}__media {
      transform: translateY(-2px);
      box-shadow: 0 8px 24px rgba(0, 0, 0, 0.08);
    }

    .#{$block}__image {
      transform: scale(1.03);
    }
  }
}
</style>
