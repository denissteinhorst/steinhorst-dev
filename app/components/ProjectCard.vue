<script setup lang="ts">
defineProps<{ data: ProjectCard }>();

const { buildImageUrl } = useStrapi();

// Helper function to extract text content from RichTextBlock
const extractTextFromRichText = (block: RichTextBlock): string => {
  if (block.text) {
    return block.text;
  }
  if (block.children?.length) {
    return block.children
      .map((child) => extractTextFromRichText(child))
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
          <img
            v-if="data.logo && buildImageUrl(data.logo)"
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
  border: 1px solid rgb(229 231 235 / 0.7);
  box-shadow: 0 1px 2px 0 rgb(0 0 0 / 0.05);
  transition: box-shadow 0.3s ease;

  &:hover {
    box-shadow: 0 4px 6px -1px rgb(0 0 0 / 0.1), 0 2px 4px -2px rgb(0 0 0 / 0.1);

    .#{$block}__image-container {
      transform: scale(1.05);
    }

    .#{$block}__gradient {
      opacity: 1;
    }
  }

  @at-root .dark #{&} {
    border-color: rgb(55 65 81 / 0.6);
  }

  &__body {
    flex: 1;
    display: flex;
    flex-direction: column;
    gap: 1rem;
  }

  &__header {
    display: flex;
    align-items: flex-start;
    gap: 1rem;
  }

  &__image-container {
    display: flex;
    width: 6rem;
    height: 5rem;
    flex-shrink: 0;
    align-items: center;
    justify-content: center;
    border-radius: 0.75rem;
    overflow: hidden;
    border: 1px solid rgb(229 231 235 / 0.7);
    background-color: white;
    box-shadow: 0 1px 2px 0 rgb(0 0 0 / 0.05);
    transition: transform 0.3s ease;

    @at-root .dark #{&} {
      border-color: rgb(55 65 81 / 0.6);
      background-color: rgb(255 255 255 / 0.9);
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
    padding: 0.5rem;
  }

  &__content {
    flex: 1;
    min-width: 0;
  }

  &__title {
    font-size: 1.25rem;
    font-weight: 600;
    line-height: 1.25;
    letter-spacing: -0.025em;
    color: #101828;
    margin: 0;

    @at-root .dark #{&} {
      color: #ffffff;
    }
  }

  &__text {
    margin-top: 0.5rem;
    font-size: 1rem;
    color: #4d5868;
    margin-bottom: 0;

    @at-root .dark #{&} {
      color: #cfd2d9;
    }
  }

  &__footer {
    margin-top: auto;
    display: flex;
    flex-direction: column;
    gap: 1.5rem;
  }

  &__tags {
    display: flex;
    flex-wrap: wrap;
    gap: 0.5rem;
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
    gap: 0.75rem;
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
    gap: 0.25rem;
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
