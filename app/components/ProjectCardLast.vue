<script setup lang="ts">
defineProps<{ data: LastProjectCard }>();
</script>

<template>
  <BaseCard
    class="project-card-last"
    role="listitem"
    aria-labelledby="manual-projects-heading"
  >
    <div class="project-card-last__header">
      <h3 id="manual-projects-heading" class="project-card-last__title">
        {{ data.title }}
      </h3>
      <p class="project-card-last__description">
        {{ data.text }}
      </p>
    </div>
    <ul class="project-card-last__items" aria-label="Weitere Projekte Liste">
      <li
        v-for="item in data.content?.items"
        :key="item.name"
        class="project-card-last__item"
      >
        <span class="project-card-last__item-icon" aria-hidden="true">
          <UIcon name="i-lucide-star" />
        </span>
        <span class="project-card-last__item-name">{{ item.name }}</span>
        <span class="project-card-last__item-type">({{ item.type }})</span>
      </li>
    </ul>
    <span class="project-card-last__bottom-border" aria-hidden="true"></span>
  </BaseCard>
</template>

<style scoped lang="scss">
$block: "project-card-last";

.#{$block} {
  &__header {
    margin-top: -1rem;
  }

  &__title {
    font-size: 1.125rem;
    font-weight: 600;
    line-height: 1.25;
    letter-spacing: -0.025em;
    color: #101828;

    @at-root .dark #{&} {
      color: #ffffff;
    }
  }

  &__description {
    margin-top: 0.5rem;
    font-size: 0.875rem;
    color: #4d5868;

    @at-root .dark #{&} {
      color: #cfd2d9;
    }
  }

  &__items {
    margin-top: auto;
    display: grid;
    grid-template-columns: 1fr;
    gap: 0.5rem;
    font-size: 0.875rem;
    margin-left: 0;

    @media (min-width: 640px) {
      grid-template-columns: repeat(2, 1fr);
    }
  }

  &__item {
    display: flex;
    align-items: flex-start;
    gap: 0.25rem;
  }

  &__item-icon {
    margin-top: 0.125rem;
    width: 0.875rem;
    height: 0.875rem;
    color: var(--color-primary);
    background-size: contain;
    background-repeat: no-repeat;
    background-position: center;
  }

  &__item-name {
    font-weight: 500;
    color: #101828;

    @at-root .dark #{&} {
      color: #e5e7eb;
    }
  }

  &__item-type {
    color: #6b7483;

    @at-root .dark #{&} {
      color: #98a0ad;
    }
  }

  &__bottom-border {
    pointer-events: none;
    position: absolute;
    inset-inline: 0;
    bottom: 0;
    height: 1px;
    background-image: linear-gradient(
      to right,
      transparent,
      var(--color-primary-500, currentColor) 50%,
      transparent
    );
    opacity: 0.3;
  }
}
</style>
