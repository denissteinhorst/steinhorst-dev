<script setup lang="ts">
defineProps<{ data: ProjectCard }>();

const { buildImageUrl } = useStrapi();

// extract Tags from RichText (one tag per line)
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
</script>

<template>
  <BaseCard
    class="project-card"
    role="listitem"
    :aria-labelledby="`project-${data.id}`"
  >
    <div class="project-card__body">
      <div class="project-card__header">
        <div class="project-card__image-container">
          <NuxtImg
            v-if="data.logo && buildImageUrl(data.logo)"
            format="webp"
            quality="80"
            :src="buildImageUrl(data.logo)!"
            :alt="
              data.logo.alternativeText || `${data.title} – ${data.company}`
            "
            class="project-card__image"
            loading="lazy"
            decoding="async"
          />
          <div v-else class="project-card__image-placeholder">
            <UIcon
              name="i-lucide-image"
              class="project-card__placeholder-icon"
            />
          </div>
        </div>
        <div class="project-card__content">
          <h3 :id="`project-${data.id}`" class="project-card__title">
            {{ data.title }}
          </h3>
          <p class="project-card__text">
            {{ data.text }}
          </p>
        </div>
      </div>

      <div class="project-card__footer">
        <ul
          v-if="data.tagList?.length"
          class="project-card__tags"
          aria-label="Tech Stack"
        >
          <li
            v-for="(tag, index) in data.tagList"
            :key="index"
            class="project-card__tag"
          >
            <UBadge
              size="sm"
              color="neutral"
              variant="outline"
              class="project-card__badge"
            >
              {{ extractTextFromRichText(tag) }}
            </UBadge>
          </li>
        </ul>

        <div class="project-card__meta">
          <p class="project-card__company">
            {{ data.referral || "Im Rahmen meiner Tätigkeit bei" }}:&nbsp;
            <span class="project-card__company-name">{{ data.company }}</span>
          </p>
          <NuxtLink
            v-if="data.link"
            :href="data.link"
            :target="data.target || '_blank'"
            rel="noopener noreferrer"
            class="project-card__link"
            :aria-label="`Projektseite öffnen: ${data.title}`"
          >
            Website
            <UIcon
              name="i-lucide-external-link"
              class="project-card__link-icon"
              aria-hidden="true"
            />
          </NuxtLink>
        </div>
      </div>
    </div>

    <span aria-hidden="true" class="project-card__gradient"></span>
  </BaseCard>
</template>

<style scoped lang="scss">
$block: "project-card";

.#{$block} {
  height: 100%;
  display: flex;
  flex-direction: column;
  position: relative;
  overflow: hidden;
  border: 1px solid var(--color-border-light);
  box-shadow: var(--shadow-sm);
  transition: box-shadow 0.3s ease;

  &:hover {
    box-shadow: var(--shadow-md);

    .#{$block}__image-container {
      transform: scale(1.05);
    }

    .#{$block}__gradient {
      opacity: 1;
    }
  }

  @at-root .dark #{&} {
    border-color: var(--color-border-light);
  }

  &__body {
    flex: 1;
    display: flex;
    flex-direction: column;
    gap: var(--spacing-md);
  }

  &__header {
    display: flex;
    align-items: flex-start;
    gap: var(--spacing-md);
  }

  &__image-container {
    display: flex;
    width: 6rem;
    height: 5rem;
    flex-shrink: 0;
    align-items: center;
    justify-content: center;
    border-radius: var(--radius-small);
    overflow: hidden;
    border: 1px solid var(--color-border-light);
    background-color: var(--color-surface);
    box-shadow: var(--shadow-sm);
    transition: transform 0.3s ease;

    @at-root .dark #{&} {
      background-color: #fafafa;
    }
  }

  &__image-placeholder {
    display: flex;
    align-items: center;
    justify-content: center;
    width: 100%;
    height: 100%;
    background-color: rgb(249 250 251);

    @at-root .dark #{&} {
      background-color: rgb(31 41 55);
    }
  }

  &__placeholder-icon {
    width: 2rem;
    height: 2rem;
    color: rgb(156 163 175);

    @at-root .dark #{&} {
      color: rgb(107 114 128);
    }
  }

  &__image {
    height: 100%;
    width: 100%;
    object-fit: contain;
    padding: var(--spacing-xs);
  }

  &__content {
    flex: 1;
    min-width: 0;
  }

  &__title {
    font-size: var(--font-size-xl);
    font-weight: 600;
    line-height: 1.25;
    letter-spacing: -0.025em;
    color: var(--color-heading);
    margin: 0;
  }

  &__text {
    margin-top: var(--spacing-xs);
    font-size: var(--font-size-base);
    color: var(--color-text-secondary);
    margin-bottom: 0;
  }

  &__footer {
    margin-top: auto;
    display: flex;
    flex-direction: column;
    gap: var(--spacing-lg);
  }

  &__tags {
    display: flex;
    flex-wrap: wrap;
    gap: var(--spacing-xs);
    list-style: none;
    margin: 0;
    padding: 0;
  }

  &__tag {
    margin: 0;
  }

  &__badge {
    :deep() {
      background-color: #f5f5f7;
      border-color: #d4d4d4;
      color: #4c4c4c;

      @at-root .dark #{&} {
        background-color: #232935;
        border-color: #404040;
        color: #c1c1c1;
      }
    }
  }

  &__meta {
    display: flex;
    align-items: baseline;
    justify-content: space-between;
    gap: var(--spacing-sm);
    flex-wrap: wrap;
    font-size: 0.875rem;
    line-height: 1.25;
  }

  &__company {
    margin: 0;
    font-size: 0.875rem;
    line-height: 1.25;
    color: #6b7483;
    display: flex;
    align-items: baseline;

    @at-root .dark #{&} {
      color: #98a0ad;
    }
  }

  &__company-name {
    font-weight: 600;
    color: #101828;

    @at-root .dark #{&} {
      color: #e5e7eb;
    }
  }

  &__link {
    font-size: 0.875rem;
    line-height: 1.25;
    display: inline-flex;
    align-items: center;
    gap: var(--spacing-2xs);
    text-decoration: underline;
    text-underline-offset: 2px;
    text-decoration-style: dotted;
    color: #6b7483;
    border-radius: 0.125rem;

    &:focus-visible {
      outline: 2px solid var(--color-primary);
      outline-offset: 2px;
    }

    @at-root .dark #{&} {
      color: #e5e7eb;
    }
  }

  &__link-icon {
    width: 0.875rem;
    height: 0.875rem;
    color: var(--color-primary);
  }

  &__gradient {
    pointer-events: none;
    position: absolute;
    inset-inline: 0;
    bottom: 0;
    height: 1px;
    background: linear-gradient(
      to right,
      transparent,
      rgb(59 130 246 / 0.4),
      transparent
    );
    opacity: 0;
    transition: opacity 0.3s ease;
  }
}
</style>
