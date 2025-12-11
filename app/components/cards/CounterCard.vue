<script setup lang="ts">
import { useIntersectionObserver } from '@vueuse/core'

const props = defineProps<{ data: CounterCard }>()

const { generateComponentId } = useIdGenerator()

const cardRef = ref<HTMLElement | null>(null)
const displayCount = ref(0)
const hasAnimated = ref(false)

const cardId = computed(() =>
  generateComponentId('counter', props.data.title || 'counter', props.data.id || 0),
)

const targetCount = computed(() => props.data.count || 0)

// Animate counter when card comes into view
const animateCounter = () => {
  if (hasAnimated.value) return

  hasAnimated.value = true
  const duration = 1000 // 1 second
  const steps = 40
  const increment = targetCount.value / steps
  const stepDuration = duration / steps

  let currentStep = 0

  const timer = setInterval(() => {
    currentStep++
    displayCount.value = Math.min(Math.round(increment * currentStep), targetCount.value)

    if (currentStep >= steps) {
      displayCount.value = targetCount.value
      clearInterval(timer)
    }
  }, stepDuration)
}

// Use intersection observer to trigger animation when in view
useIntersectionObserver(
  cardRef,
  ([entry]) => {
    if (entry?.isIntersecting) {
      animateCounter()
    }
  },
  { threshold: 0.3 },
)
</script>

<template>
  <div ref="cardRef" class="counter-card" :aria-labelledby="cardId">
    <h3 :id="cardId" class="counter-card__title">
      {{ data.title }}
    </h3>
    <span class="counter-card__number" aria-live="polite">
      {{ displayCount }}
    </span>
    <p v-if="data.text" class="counter-card__text">
      {{ data.text }}
    </p>
  </div>
</template>

<style scoped lang="scss">
$block: 'counter-card';

.#{$block} {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  text-align: center;
  padding: 2.5rem 1.5rem;
  min-height: 200px;

  &__number {
    font-size: clamp(3.5rem, 8vw, 5rem);
    font-weight: 600;
    letter-spacing: -0.03em;
    line-height: 1;
    color: var(--color-gray-900);
    font-feature-settings:
      'tnum' on,
      'lnum' on;
    margin-bottom: 0.75rem;

    @at-root .dark #{&} {
      color: var(--color-gray-50);
    }
  }

  &__title {
    font-size: 1.125rem;
    font-weight: 600;
    letter-spacing: -0.01em;
    line-height: 1.3;
    color: var(--color-gray-900);
    margin-bottom: 0.5rem;

    @at-root .dark #{&} {
      color: var(--color-gray-100);
    }
  }

  &__text {
    font-size: 0.9375rem;
    font-weight: 400;
    line-height: 1.5;
    color: var(--color-gray-500);
    max-width: 20ch;

    @at-root .dark #{&} {
      color: var(--color-gray-400);
    }
  }
}
</style>
