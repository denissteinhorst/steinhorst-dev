<script setup lang="ts">
const props = defineProps<{
  data: RecommendationCard
  isActive?: boolean
}>()

const emit = defineEmits<{
  click: []
}>()

const { generateComponentId } = useIdGenerator()

const cardId = computed(() =>
  generateComponentId('testimonial', props.data.author || 'testimonial', props.data.id || 0),
)

const handleClick = () => {
  emit('click')
}

const handleKeydown = (event: KeyboardEvent) => {
  if (event.key === 'Enter' || event.key === ' ') {
    event.preventDefault()
    emit('click')
  }
}
</script>

<template>
  <BaseCard
    :is-active="isActive"
    class="testimonial-card-compact"
    :class="{ 'testimonial-card-compact--active': isActive }"
    :aria-labelledby="cardId"
  >
    <button
      class="testimonial-card-compact__button"
      :aria-pressed="isActive"
      :aria-labelledby="cardId"
      @click="handleClick"
      @keydown="handleKeydown"
    >
      <div class="testimonial-card-compact__content">
        <span class="testimonial-card-compact__summary">
          {{ data.summary }}
        </span>
        <div class="testimonial-card-compact__footer">
          <div class="testimonial-card-compact__author-info">
            <p :id="cardId" class="testimonial-card-compact__author-name">
              {{ data.author }}
            </p>
            <p class="testimonial-card-compact__author-position">
              {{ data.position }} | {{ data.company }}
            </p>
          </div>
        </div>
      </div>
    </button>
  </BaseCard>
</template>

<style scoped lang="scss">
$block: 'testimonial-card-compact';

.#{$block} {
  transition: all 0.15s ease-in-out;
  cursor: pointer;
  padding-bottom: 0 !important;
  height: 160px;

  :deep(p) {
    padding-bottom: 0;
  }

  &__button {
    border: none;
    background: none;
    border-radius: 0.5rem;
    cursor: pointer;
    transition: all 0.15s ease-in-out;
    min-height: 0;
    display: flex;
    flex-direction: column;
    height: 110px;
    padding: 0;
    width: 100%;
    text-align: left;

    &:focus-visible {
      outline: 2px solid var(--color-primary, #a78bfa);
      outline-offset: 2px;
    }

    @at-root .dark #{&} {
      border-color: transparent;
    }
  }

  &__content {
    display: flex;
    flex-direction: column;
    height: 100%;
    padding: 0;
  }

  &__summary {
    font-size: 0.75rem;
    margin: 0;
    padding: 0;
    color: #374151;
    flex: 1 1 auto;

    @at-root .dark #{&} {
      color: #e5e7eb;
    }
  }

  &__footer {
    display: flex;
    align-items: center;
    justify-content: flex-end;
    gap: 0.75rem;
    flex-shrink: 0;
  }

  &__author-info {
    min-width: 0;
    text-align: right;
    line-height: 1;
  }

  &__author-name {
    font-size: 0.875rem;
    overflow: hidden;
    text-overflow: ellipsis;
    white-space: nowrap;
    color: #111827;
    margin: 0;

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
    margin: 0;
    line-height: 1.2;

    @at-root .dark #{&} {
      color: #9ca3af;
    }
  }
}
</style>
