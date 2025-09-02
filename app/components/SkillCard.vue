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
    font-size: 1.125rem;
    font-weight: 600;
    line-height: 1.25;
    letter-spacing: -0.025em;
    color: #111827;
    margin-bottom: 12px;
    margin-top: 0;

    @at-root .dark #{&} {
      color: #ffffff;
    }
  }

  &__list {
    display: flex;
    flex-direction: column;
    color: #4b5563;
    font-size: 1rem;
    margin-left: 0;
    margin-bottom: 0;

    @at-root .dark #{&} {
      color: #d1d5db;
    }
  }

  &__list-item {
    display: flex;
    align-items: center;
    gap: 0.5rem;

    &-marker {
      display: inline-block;
      height: 0.5rem;
      width: 0.5rem;
      border-radius: 2px;
      background-color: var(--color-primary);
      flex-shrink: 0;
    }

    &-text {
      display: inline;
    }

    &-separator {
      color: #b7b7b7;
      opacity: 1;
      margin: 0 0.125rem;

      @at-root .dark #{&} {
        color: #7b7c7e;
      }
    }
  }
}
</style>
