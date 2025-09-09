<script setup lang="ts">
const props = defineProps<{
  data: ExperienceCard;
  index?: number;
  showJobsearchBadge?: boolean;
}>();

const { buildImageUrl } = useStrapi();
const { t } = useI18n();

// Helper function to compute duration from period string
const computeDuration = (period?: string): string => {
  if (!period) return "";

  // Map German month names to month numbers (1-12)
  const monthMap: Record<string, number> = {
    januar: 1,
    februar: 2,
    märz: 3,
    april: 4,
    mai: 5,
    juni: 6,
    juli: 7,
    august: 8,
    september: 9,
    oktober: 10,
    november: 11,
    dezember: 12,
  };

  // Split by common separators: 'bis', en-dash, em-dash, hyphen
  const parts = period.split(/\s+(?:bis|–|—|-)\s+/i).map((p) => p.trim());
  if (parts.length < 1) return "";

  const parsePart = (text?: string | null): Date | null => {
    if (!text) return null;
    if (/heute/i.test(text)) return new Date();
    const m = text.match(/([A-Za-zäöüÄÖÜß]+)\s+(\d{4})/);
    if (!m) return null;
    const monthName = (m[1] ?? "").toLowerCase();
    const yearStr = m[2] ?? "";
    const year = parseInt(yearStr, 10);
    if (Number.isNaN(year)) return null;
    const month = monthMap[monthName] ?? NaN;
    if (Number.isNaN(month)) return null;

    // Create date representing first day of month
    return new Date(year, month - 1, 1);
  };

  const startDate = parsePart(parts[0] ?? "");
  const endDate = parts[1] ? parsePart(parts[1]) : null;
  const effectiveEnd = endDate ?? new Date();

  if (!startDate) return "";

  // Inclusive month difference (counts both start and end months)
  // Example: Februar -> Juli (same year) = 6 Monate
  const monthsRaw =
    effectiveEnd.getFullYear() * 12 +
    effectiveEnd.getMonth() -
    (startDate.getFullYear() * 12 + startDate.getMonth());
  const monthsDiff = monthsRaw + 1; // inclusive
  if (monthsDiff <= 0) return "";

  // Always show exact years and months (inclusive), no rounding and no tilde
  let years = Math.floor(monthsDiff / 12);
  const rem = monthsDiff % 12;

  // If there are no full years, only show months (inclusive total)
  if (years === 0) {
    const monthsLabelOnly = monthsDiff === 1 ? "Monat" : "Monate";
    return ` (${monthsDiff} ${monthsLabelOnly})`;
  }

  // When years > 0, display months as remainder + 1 (if there's a remainder)
  let shownMonths = rem > 0 ? rem + 1 : 0;

  // Rollover: 12 months -> +1 year, 0 months
  if (shownMonths === 12) {
    years += 1;
    shownMonths = 0;
  }

  const yearsLabel = years === 1 ? "Jahr" : "Jahre";
  const monthsLabel = shownMonths === 1 ? "Monat" : "Monate";
  return ` (${years} ${yearsLabel}, ${shownMonths} ${monthsLabel})`;
};

// Helper function to render rich text blocks as plain text
const renderRichTextAsText = (blocks?: RichTextBlock[]): string => {
  if (!blocks) return "";

  return blocks
    .map((block: RichTextBlock): string => {
      if (block.type === "text" && block.text) {
        return block.text;
      }
      if (block.children) {
        return renderRichTextAsText(block.children);
      }
      return "";
    })
    .join("");
};

// Helper function to extract list items from rich text
const extractListItems = (blocks?: RichTextBlock[]): string[] => {
  if (!blocks) return [];

  const items: string[] = [];

  const traverse = (blocks: RichTextBlock[]): void => {
    blocks.forEach((block: RichTextBlock): void => {
      if (block.type === "list-item" && block.children) {
        const text = renderRichTextAsText(block.children);
        if (text.trim()) {
          items.push(text.trim());
        }
      } else if (block.children) {
        traverse(block.children);
      }
    });
  };

  traverse(blocks);
  return items;
};

const durationDisplay = computed(() => computeDuration(props.data.period));
const mainText = computed(() => renderRichTextAsText(props.data.text));
const dutyItems = computed(() => extractListItems(props.data.duty));
const learningText = computed(() => renderRichTextAsText(props.data.learning));
const logoUrl = computed(() => buildImageUrl(props.data.logo, "small"));
const aosDelay = computed(() => Math.min(props.index ?? 0, 5) * 100);

// Determine if this card should be visible based on jobsearch logic
const shouldShowCard = computed(() => {
  // If this card is marked as jobsearch, show it only when showJobsearchBadge is true
  if (props.data.isJobsearch === true) {
    return props.showJobsearchBadge === true;
  }
  // For all other cards (not marked as jobsearch), always show them
  return true;
});
</script>

<template>
  <div
    v-if="data && shouldShowCard"
    data-aos="fade-up"
    :data-aos-delay="aosDelay"
    class="experience-card"
  >
    <!-- Mobile: Logo above company and role -->
    <div class="experience-card__mobile-logo">
      <a
        v-if="logoUrl && data.link"
        :href="data.link"
        :target="data.target || '_blank'"
        rel="noopener noreferrer"
        class="experience-card__logo-link"
      >
        <NuxtImg
          :src="logoUrl"
          :alt="`Logo von ${data.company}`"
          class="experience-card__logo-image"
          format="webp"
        />
      </a>
      <div v-else-if="logoUrl" class="experience-card__logo-link">
        <NuxtImg
          :src="logoUrl"
          :alt="`Logo von ${data.company}`"
          class="experience-card__logo-image"
          format="webp"
        />
      </div>
    </div>

    <!-- Date and Title -->
    <div class="experience-card__header">
      <span class="experience-card__date">
        {{ data.period }}
        <span v-if="durationDisplay" class="experience-card__duration">
          {{ durationDisplay }}
        </span>
      </span>

      <h3 :id="`exp-${data.id}`" class="experience-card__title" tabindex="-1">
        <a
          v-if="data.link"
          :href="data.link"
          :target="data.target || '_blank'"
          rel="noopener noreferrer"
          class="experience-card__company-link"
        >
          {{ data.company }}
        </a>
        <span v-else class="experience-card__company-link">
          {{ data.company }}
        </span>
        <span class="experience-card__position"> — {{ data.position }} </span>
      </h3>
    </div>

    <!-- Content -->
    <div class="experience-card__content">
      <!-- Description Content -->
      <div class="experience-card__description">
        <p v-if="mainText" class="experience-card__summary">
          {{ mainText }}
        </p>

        <!-- Responsibilities Section -->
        <div v-if="dutyItems.length" class="experience-card__responsibilities">
          <h4 class="experience-card__responsibilities-title">
            {{ t("experience_section.responsibilities") }}
          </h4>
          <ul class="experience-card__responsibilities-list">
            <li
              v-for="item in dutyItems"
              :key="item"
              class="experience-card__responsibility-item"
            >
              {{ item }}
            </li>
          </ul>
        </div>

        <!-- Key Learning Insight -->
        <div v-if="learningText" class="experience-card__insight">
          <div class="experience-card__insight-header">
            <UIcon
              name="i-heroicons-light-bulb"
              class="experience-card__insight-icon"
            />
            <span class="experience-card__insight-label">{{
              t("experience_section.key_learning")
            }}</span>
          </div>
          <p class="experience-card__insight-text">{{ learningText }}</p>
        </div>
      </div>

      <!-- Logo for Larger Screens -->
      <div class="experience-card__desktop-logo">
        <a
          v-if="logoUrl && data.link"
          :href="data.link"
          :target="data.target || '_blank'"
          rel="noopener noreferrer"
          class="experience-card__logo-link experience-card__logo-link--desktop"
        >
          <NuxtImg
            :src="logoUrl"
            :alt="`Logo von ${data.company}`"
            class="experience-card__logo-image"
            format="webp"
          />
        </a>
        <div
          v-else-if="logoUrl"
          class="experience-card__logo-link experience-card__logo-link--desktop"
        >
          <NuxtImg
            :src="logoUrl"
            :alt="`Logo von ${data.company}`"
            class="experience-card__logo-image"
            format="webp"
          />
        </div>
      </div>
    </div>
  </div>
</template>

<style scoped lang="scss">
$block: "experience-card";

.#{$block} {
  width: 100%;

  &__mobile-logo {
    display: flex;
    flex-direction: column;
    margin-bottom: var(--spacing-xs);
    width: 100%;

    @media (min-width: 640px) {
      display: none;
    }
  }

  &__header {
    margin-bottom: var(--spacing-sm);
  }

  &__title {
    margin-top: 0;
    font-size: var(--font-size-lg);
    font-weight: 600;
    line-height: 1.4;
    color: var(--color-heading);
  }

  &__company-link {
    color: var(--color-primary);
    text-decoration: none;

    &:hover {
      text-decoration: underline;
    }
  }

  &__position {
    font-weight: 400;
    color: var(--color-text-muted);
  }

  &__date {
    display: inline-block;
    margin-bottom: 0.375rem;
    font-family: ui-monospace, SFMono-Regular, "SF Mono", Monaco, Consolas,
      "Liberation Mono", "Courier New", monospace;
    font-size: var(--font-size-xs);
    letter-spacing: -0.025em;
    color: var(--color-text-muted);
  }

  &__duration {
    margin-left: 0.25rem;
    color: var(--color-text-secondary);
  }

  &__content {
    display: flex;
    align-items: flex-start;
    width: 100%;
    flex-direction: column;

    @media (min-width: 640px) {
      flex-direction: row;
    }
  }

  &__description {
    flex: 1;
    color: var(--color-text);
    font-size: var(--font-size-base);
    line-height: 1.75;
    max-width: 36rem;
  }

  &__summary {
    margin: 0;
  }

  &__responsibilities {
    margin-top: var(--spacing-md);
  }

  &__responsibilities-title {
    margin: 0 0 var(--spacing-xs) 0;
    font-size: var(--font-size-sm);
    font-weight: 600;
    color: var(--color-text-muted);
    text-transform: uppercase;
    letter-spacing: 0.05em;
  }

  &__responsibilities-list {
    margin: 0;
    padding: 8px 0;
    list-style: none;
  }

  &__responsibility-item {
    position: relative;
    padding-left: 1.25rem;
    font-size: var(--font-size-xs);
    font-weight: 500;
    color: var(--color-text-secondary);
    line-height: 1.6;

    &:not(:last-child) {
      margin-bottom: var(--spacing-xs);
    }

    &::before {
      content: "•";
      position: absolute;
      left: 0;
      color: var(--color-primary);
      font-weight: 600;
    }
  }

  &__insight {
    margin-top: var(--spacing-md);
    padding: var(--spacing-sm);
    background: linear-gradient(
      135deg,
      rgba(59, 130, 246, 0.05) 0%,
      rgba(147, 51, 234, 0.05) 100%
    );
    border-left: 3px solid var(--color-primary);
    border-radius: var(--radius-medium);

    @at-root .dark #{&} {
      background: linear-gradient(
        135deg,
        rgba(59, 130, 246, 0.1) 0%,
        rgba(147, 51, 234, 0.1) 100%
      );
    }
  }

  &__insight-header {
    display: flex;
    align-items: center;
    gap: var(--spacing-xs);
    margin-bottom: var(--spacing-xs);
  }

  &__insight-icon {
    font-size: var(--font-size-base);
    color: var(--color-primary);
    flex-shrink: 0;
  }

  &__insight-label {
    font-size: var(--font-size-xs);
    font-weight: 600;
    color: var(--color-primary);
    text-transform: uppercase;
    letter-spacing: 0.05em;
  }

  &__insight-text {
    margin: 0;
    font-size: var(--font-size-sm);
    color: var(--color-text-secondary);
    line-height: 1.6;
    font-style: italic;
  }

  &__desktop-logo {
    margin-left: auto;
    flex-shrink: 0;
    align-items: center;
    display: none;

    @media (min-width: 640px) {
      display: flex;
    }
  }

  &__logo-link {
    display: inline-flex;
    align-items: center;
    justify-content: center;
    height: 5rem;
    width: 8rem;
    border-radius: var(--radius-small);
    background-color: var(--color-surface);
    box-shadow: var(--shadow-sm);
    margin-bottom: var(--spacing-xs);

    @at-root .dark #{&} {
      background-color: #fafafa;
    }

    &--desktop {
      margin-bottom: 0;
    }
  }

  &__logo-image {
    max-height: 4rem;
    max-width: 7rem;
    width: auto;
    height: auto;
    object-fit: contain;
  }
}
</style>
