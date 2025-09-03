<script setup lang="ts">
const props = defineProps<{
  data: RecommendationCard;
  showAlternative?: boolean;
}>();

const emit = defineEmits<{
  toggleLanguage: [];
}>();

const { buildImageUrl } = useStrapi();

const avatarUrl = computed<string | undefined>(() => {
  const url = buildImageUrl(props.data.avatar, "small");
  return url === null ? undefined : url;
});

const recommendationText = computed<BlockNode[]>(
  () => (props.data.recommendation ?? []) as BlockNode[]
);

const hasAlternativeLanguage = computed(() => {
  return false;
});

const displayText = computed(() => {
  return recommendationText.value;
});

const formatDate = (dateStr: string | undefined): string => {
  if (!dateStr) return "";

  const date = new Date(dateStr);
  if (isNaN(date.getTime())) return dateStr;

  const dd = String(date.getDate()).padStart(2, "0");
  const mm = String(date.getMonth() + 1).padStart(2, "0");
  const yyyy = date.getFullYear();
  return `${dd}.${mm}.${yyyy}`;
};

const handleLanguageToggle = () => {
  emit("toggleLanguage");
};
</script>

<template>
  <BaseCard
    class="testimonial-card-large"
    role="listitem"
    :aria-labelledby="`testimonial-${data.id}`"
  >
    <div class="testimonial-card-large__container">
      <!-- Header: Avatar and author info -->
      <header class="testimonial-card-large__header">
        <div class="testimonial-card-large__avatar-wrapper">
          <img
            v-if="avatarUrl"
            :src="avatarUrl"
            :alt="`Avatar of ${data.author}`"
            class="testimonial-card-large__avatar"
          />
          <div
            v-else
            class="testimonial-card-large__avatar testimonial-card-large__avatar--placeholder"
            :aria-label="`Avatar placeholder for ${data.author}`"
          >
            <UIcon
              name="i-heroicons-user-circle"
              class="testimonial-card-large__avatar-icon"
            />
          </div>
        </div>

        <div class="testimonial-card-large__author-info">
          <h3
            :id="`testimonial-${data.id}`"
            class="testimonial-card-large__author-name"
          >
            {{ data.author }}
          </h3>
          <p class="testimonial-card-large__author-position">
            {{ data.position }}
            <span v-if="data.company" class="testimonial-card-large__company">
              · {{ data.company }}
            </span>
          </p>
          <p v-if="data.relation" class="testimonial-card-large__relation">
            {{ data.relation }}
          </p>
        </div>
      </header>

      <!-- Content: Scrollable recommendation text -->
      <div
        class="testimonial-card-large__content"
        tabindex="0"
        role="region"
        aria-label="Empfehlungstext, scrollbarer Bereich"
      >
        <div class="testimonial-card-large__text-wrapper">
          <StrapiBlocksText
            :key="`${data.id ?? 'noid'}-${showAlternative ? 'alt' : 'main'}`"
            :nodes="displayText"
            class="testimonial-card-large__text"
          />
        </div>
      </div>

      <!-- Footer: Language toggle and metadata (date + optional source link) -->
      <footer class="testimonial-card-large__footer">
        <UButton
          v-if="hasAlternativeLanguage"
          variant="link"
          size="xs"
          color="primary"
          class="testimonial-card-large__language-toggle"
          @click="handleLanguageToggle"
        >
          <UIcon
            name="i-heroicons-language-20-solid"
            class="testimonial-card-large__language-icon"
          />
          {{
            showAlternative
              ? "Deutsche Übersetzung anzeigen"
              : "Englischen Originaltext anzeigen"
          }}
        </UButton>

        <!-- Translation indicator -->
        <div
          v-if="data.isTranslated"
          class="testimonial-card-large__translation-indicator"
        >
          <UIcon
            name="i-heroicons-language-20-solid"
            class="testimonial-card-large__translation-icon"
          />
          <span class="testimonial-card-large__translation-text">
            Deutsche Übersetzung des englischen Kommentars.
          </span>
        </div>
        <div
          v-else-if="!data.isTranslated"
          class="testimonial-card-large__translation-indicator"
        >
          <UIcon
            name="i-heroicons-language-20-solid"
            class="testimonial-card-large__translation-icon"
          />
          <span class="testimonial-card-large__translation-text">
            Deutscher original Text.
          </span>
        </div>

        <div class="testimonial-card-large__metadata">
          <span class="testimonial-card-large__date">
            {{ formatDate(data.postDate) }}
          </span>
          <template v-if="data.sourceUrl">
            <span class="testimonial-card-large__separator" aria-hidden="true"
              >|</span
            >
            <UTooltip
              text="Originales Feedback ansehen"
              :delay-duration="0"
              :content="{ side: 'bottom', sideOffset: 6 }"
            >
              <a
                :href="data.sourceUrl"
                target="_blank"
                rel="noopener noreferrer"
                class="testimonial-card-large__source-link"
              >
                Quelle
                <UIcon
                  name="i-heroicons-arrow-top-right-on-square-20-solid"
                  class="testimonial-card-large__source-icon"
                />
              </a>
            </UTooltip>
          </template>
          <template v-else-if="data.platform">
            <span class="testimonial-card-large__separator" aria-hidden="true"
              >|</span
            >
            <a
              href="https://www.linkedin.com/in/denissteinhorst/"
              target="_blank"
              class="testimonial-card-large__platform"
            >
              {{ data.platform }}
              <UIcon
                name="i-heroicons-arrow-top-right-on-square"
                class="certificate-card__button-icon"
                aria-hidden="true"
              />
            </a>
          </template>
        </div>
      </footer>
    </div>
  </BaseCard>
</template>

<style scoped lang="scss">
$block: "testimonial-card-large";

.#{$block} {
  height: 807px;

  &__container {
    display: grid;
    grid-template-rows: auto minmax(0, 1fr) auto; // middle row can shrink and scroll
    height: 765px; // ensure fixed card height even if root class height doesn't apply
    min-height: 0; // allow inner row to shrink/scroll in Safari
    overflow: hidden; // prevent outer scroll; only center scrolls
    row-gap: 1rem;
  }

  &__header {
    display: flex;
    align-items: flex-start;
    gap: 1rem;
    padding-bottom: 0.75rem;
    border-bottom: 1px solid rgb(229 231 235 / 0.5);
    flex-shrink: 0; // Prevent header from shrinking

    @at-root .dark #{&} {
      border-bottom-color: rgb(55 65 81 / 0.5);
    }
  }

  &__avatar-wrapper {
    flex-shrink: 0;
  }

  &__avatar {
    width: 3.5rem;
    height: 3.5rem;
    border-radius: 50%;
    object-fit: cover;
    border: 2px solid rgb(229 231 235 / 0.7);

    @at-root .dark #{&} {
      border-color: rgb(55 65 81 / 0.6);
    }

    &--placeholder {
      background-color: #f3f4f6;
      display: flex;
      align-items: center;
      justify-content: center;

      @at-root .dark #{&} {
        background-color: #374151;
      }
    }
  }

  &__avatar-icon {
    width: 2rem;
    height: 2rem;
    color: #9ca3af;

    @at-root .dark #{&} {
      color: #6b7280;
    }
  }

  &__author-info {
    flex: 1;
    min-width: 0;
  }

  &__author-name {
    font-size: 1.125rem;
    font-weight: 600;
    line-height: 1.75rem;
    color: #111827;
    margin: 0;
    padding-bottom: 3px;

    @at-root .dark #{&} {
      color: #f9fafb;
    }
  }

  &__author-position {
    font-size: 0.875rem;
    line-height: 1.25rem;
    color: #6b7280;
    padding-bottom: 12px;

    @at-root .dark #{&} {
      color: #9ca3af;
    }
  }

  &__company {
    color: inherit;
  }

  &__relation {
    font-size: 0.75rem;
    line-height: 1rem;
    color: #9ca3af;
    margin: -10px 0 0 0;

    @at-root .dark #{&} {
      color: #6b7280;
    }
  }

  &__content {
    min-height: 0; // allow the middle row to shrink below content height
    overflow: auto; // this is the single scroll container
    -webkit-overflow-scrolling: touch; // iOS momentum
    overscroll-behavior: contain; // prevent page scroll chaining
    padding-right: 0.5rem; // keep space for custom scrollbar on desktop
    box-sizing: border-box;
    scrollbar-width: thin;
    scrollbar-color: rgba(139, 92, 246, 0.7) transparent;

    &::-webkit-scrollbar {
      width: 8px;
      cursor: pointer;
    }

    &::-webkit-scrollbar-track {
      background: transparent;
    }

    &::-webkit-scrollbar-thumb {
      background-color: rgba(139, 92, 246, 0.7);
      border-radius: 9999px;
      cursor: pointer;

      &:hover {
        background-color: rgba(124, 58, 237, 0.85);
      }
    }

    @at-root .dark #{&} {
      scrollbar-color: rgba(167, 139, 250, 0.85) transparent;

      &::-webkit-scrollbar-thumb {
        background-color: rgba(167, 139, 250, 0.85);

        &:hover {
          background-color: rgba(139, 92, 246, 0.95);
        }
      }
    }
  }

  &__text-wrapper {
    // no nested scroll; let the parent handle scrolling
    :deep(p) {
      padding-bottom: 0.75rem !important;
    }
  }

  &__text {
    font-size: 0.875rem;
    line-height: 1.6;
    color: #374151;
    max-width: none;

    @at-root .dark #{&} {
      color: #d1d5db;
    }

    p {
      margin: 0 0 0.75rem 0;

      &:last-child {
        margin-bottom: 0;
      }
    }

    ul,
    ol {
      margin: 0 0 0.75rem 0;
      padding-left: 1.25rem;
    }

    a {
      color: #7c3aed;
      text-decoration: underline;

      @at-root .dark #{&} {
        color: #a78bfa;
      }
    }
  }

  &__footer {
    display: flex;
    align-items: center;
    justify-content: space-between;
    gap: 0.5rem;
    padding-top: 0.75rem;
    border-top: 1px solid rgb(229 231 235 / 0.5);
    flex-shrink: 0; // Prevent footer from shrinking

    @at-root .dark #{&} {
      border-top-color: rgb(55 65 81 / 0.5);
    }

    @media (max-width: 640px) {
      flex-direction: column;
      align-items: flex-start;
      gap: 0.75rem;
    }
  }

  &__language-toggle {
    flex-shrink: 0;
  }

  &__language-icon {
    width: 1rem;
    height: 1rem;
    margin-right: 0.25rem;
  }

  &__translation-indicator {
    display: flex;
    align-items: center;
    gap: 0.375rem;
    font-size: 0.75rem;
    line-height: 1rem;
    border-radius: 0.375rem;

    @at-root .dark #{&} {
      color: #616774;
    }

    @media (max-width: 640px) {
      order: -1;
    }
  }

  &__translation-icon {
    width: 1rem;
    height: 1rem;
    flex-shrink: 0;
  }

  &__translation-text {
    font-weight: 500;
  }

  &__metadata {
    display: flex;
    align-items: center;
    gap: 0.5rem;
    font-size: 0.75rem;
    line-height: 1rem;
    color: #9ca3af;
    margin-left: auto;

    @at-root .dark #{&} {
      color: #6b7280;
    }

    @media (max-width: 640px) {
      margin-left: 0;
    }
  }

  &__date {
    white-space: nowrap;
  }
  &__platform {
    white-space: nowrap;
    color: var(--color-primary);
    cursor: pointer;
  }

  &__separator {
    color: #d1d5db;

    @at-root .dark #{&} {
      color: #4b5563;
    }
  }

  &__source-link {
    display: inline-flex;
    align-items: center;
    gap: 0.25rem;
    color: #dc2626;
    text-decoration: none;

    &:hover {
      text-decoration: underline;
    }

    @at-root .dark #{&} {
      color: #fca5a5;
    }
  }

  &__source-icon {
    width: 0.875rem;
    height: 0.875rem;
  }
}
</style>
