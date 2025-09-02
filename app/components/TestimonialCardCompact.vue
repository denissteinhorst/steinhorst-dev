<script setup lang="ts">
defineProps<{ data: RecommendationCard }>();
</script>

<template>
  <BaseCard
    class="testimonial-card-compact"
    role="listitem"
    :aria-labelledby="`project-${data.id}`"
  >
    <article class="testimonial-card-compact__article">
      <p class="testimonial-card-compact__summary">
        {{ data.summary }}
      </p>
      <div class="testimonial-card-compact__footer">
        <div class="testimonial-card-compact__author-info">
          <p class="testimonial-card-compact__author-name">
            {{ data.author }}
          </p>
          <p class="testimonial-card-compact__author-position">
            {{ data.position }} | {{ data.company }}
          </p>
        </div>
      </div>
    </article>
  </BaseCard>
</template>

<style scoped lang="scss">
$block: "testimonial-card-compact";

.#{$block} {
  &__article {
    border-radius: 0.5rem;
    cursor: pointer;
    transition: all 0.15s ease-in-out;
    height: 100%;
    min-height: 0;

    &:hover {
      border-color: #d1d5db;
    }

    @at-root .dark #{&} {
      border-color: #374151;

      &:hover {
        border-color: #4b5563;
      }
    }
  }

  &__summary {
    font-size: 0.75rem;
    line-height: 1rem;
    margin-bottom: 0.75rem;
    color: #374151;

    @at-root .dark #{&} {
      color: #e5e7eb;
    }
  }

  &__footer {
    display: flex;
    align-items: center;
    justify-content: flex-end;
    gap: 0.75rem;
  }

  &__author-info {
    min-width: 0;
    text-align: right;
  }

  &__author-name {
    font-size: 0.875rem;
    overflow: hidden;
    text-overflow: ellipsis;
    white-space: nowrap;
    color: #111827;
    margin-bottom: -0.75rem;

    @at-root .dark #{&} {
      color: #ffffff;
    }
  }

  &__author-position {
    font-size: 0.75rem;
    overflow: hidden;
    text-overflow: ellipsis;
    white-space: nowrap;
    color: #6b7280;

    @at-root .dark #{&} {
      color: #9ca3af;
    }
  }
}
</style>
