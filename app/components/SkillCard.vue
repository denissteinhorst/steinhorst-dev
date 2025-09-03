<script setup lang="ts">
const props = defineProps<{
  title: string;
  listItems: string[];
  index?: number;
}>();

const cardId = computed(() => `skill-${props.title}`);
const aosDelay = computed(() => (props.index ?? 0) * 100);
</script>

<template>
  <div data-aos="fade-up" :data-aos-delay="aosDelay" class="skill-card-wrapper">
    <BaseCard class="skill-card" :aria-labelledby="cardId" role="group">
      <div class="skill-card__content">
        <h3 :id="cardId" class="skill-card__title">
          {{ props.title }}
        </h3>
        <ul class="skill-card__list" :aria-label="`Kategorie ${props.title}`">
          <li
            v-for="(item, itemIndex) in props.listItems"
            :key="itemIndex"
            class="skill-card__list-item"
          >
            <span
              class="skill-card__list-item-marker"
              aria-hidden="true"
            ></span>
            <span class="skill-card__list-item-text">
              <span
                v-for="(part, partIndex) in item.split('|')"
                :key="partIndex"
              >
                {{ part }}
                <span
                  v-if="partIndex < item.split('|').length - 1"
                  class="skill-card__list-item-separator"
                  >|</span
                >
              </span>
            </span>
          </li>
        </ul>
      </div>
    </BaseCard>
  </div>
</template>

<style scoped lang="scss">
$block: "skill-card";

.skill-card-wrapper {
  height: 100%;
  display: flex;
  flex-direction: column;
}

.#{$block} {
  &__content {
    display: flex;
    flex-direction: column;
  }

  &__title {
    font-size: var(--font-size-lg);
    font-weight: 600;
    line-height: 1.25;
    letter-spacing: -0.025em;
    color: var(--color-heading);
    margin-bottom: var(--spacing-sm);
    margin-top: 0;
  }

  &__list {
    display: flex;
    flex-direction: column;
    color: var(--color-text-muted);
    font-size: var(--font-size-base);
    margin-left: 0;
    margin-bottom: 0;
  }

  &__list-item {
    display: flex;
    align-items: center;
    gap: var(--spacing-xs);

    &-marker {
      display: inline-block;
      height: var(--spacing-xs);
      width: var(--spacing-xs);
      border-radius: 2px;
      background-color: var(--color-primary);
      flex-shrink: 0;
    }

    &-text {
      display: inline;
    }

    &-separator {
      color: var(--color-text-separator);
      opacity: 1;
      margin: 0 0.125rem;
    }
  }
}
</style>
