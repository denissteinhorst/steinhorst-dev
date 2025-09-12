<script setup lang="ts">
interface SkipLink {
  target: string
  label: string
  ariaLabel?: string
}

defineProps<{
  nextSection?: string
  currentSectionTitle?: string
  skipLinks?: SkipLink[]
}>()

// Function to handle skip link activation and focus next section
const handleSkipActivation = (event: Event, targetId: string) => {
  // Prevent default behavior for both click and keyboard events
  event.preventDefault()

  // Use nextTick to ensure proper navigation
  nextTick(() => {
    const targetElement = document.getElementById(targetId.replace('#', ''))
    if (targetElement) {
      // Scroll to the target element
      targetElement.scrollIntoView({
        behavior: 'smooth',
        block: 'start',
      })

      // Make the element focusable if it's not already
      if (!targetElement.hasAttribute('tabindex')) {
        targetElement.setAttribute('tabindex', '-1')
      }

      // Focus the element after scroll completes
      setTimeout(() => {
        targetElement.focus()

        // Remove tabindex after focusing to keep normal tab order
        setTimeout(() => {
          if (targetElement.getAttribute('tabindex') === '-1') {
            targetElement.removeAttribute('tabindex')
          }
        }, 100)
      }, 300)
    }
  })
}

// Handle keyboard events (Space and Enter)
const handleKeyDown = (event: KeyboardEvent, targetId: string) => {
  if (event.key === ' ' || event.key === 'Enter') {
    handleSkipActivation(event, targetId)
  }
}
</script>

<template>
  <!-- Multiple skip links mode -->
  <div v-if="skipLinks && skipLinks.length > 0" class="a11y-helper__skip-links">
    <a
      v-for="link in skipLinks"
      :key="link.target"
      class="a11y-helper__skip-link"
      :href="`#${link.target}`"
      :aria-label="link.ariaLabel || link.label"
      @click="handleSkipActivation($event, link.target)"
      @keydown="handleKeyDown($event, link.target)"
    >
      {{ link.label }}
    </a>
  </div>

  <!-- Single skip link mode (legacy support) -->
  <a
    v-else-if="nextSection && currentSectionTitle"
    class="a11y-helper__skip-link"
    :href="`#${nextSection}`"
    :aria-label="String($t('a11y_helper.skip_current_section', { section: currentSectionTitle }))"
    @click="handleSkipActivation($event, nextSection)"
    @keydown="handleKeyDown($event, nextSection)"
  >
    {{ String($t('a11y_helper.skip_current_section', { section: currentSectionTitle })) }}
  </a>
</template>

<style lang="scss" scoped>
$block: 'a11y-helper';

.#{$block} {
  &__skip-links {
    position: absolute;
    top: 0;
    left: 0;
    z-index: 60;
  }

  &__skip-link {
    position: absolute;
    top: 0;
    left: 0;
    display: inline-block;
    padding: 0.8rem 1.6rem;
    line-height: 1;
    font-size: 16px;
    background-color: #000000 !important;
    color: #ffffff !important;
    font-weight: bold;
    border-radius: 0.375rem;
    margin: 0.8rem 0 0 0.8rem;
    text-decoration: none !important;
    white-space: nowrap;
    transform: translateX(-110%);
    pointer-events: none;
    transition: transform 180ms ease;
    z-index: 9999;

    // Override any global link styles
    &:link,
    &:visited,
    &:hover,
    &:active {
      color: #ffffff !important;
      background-color: #000000 !important;
      text-decoration: none !important;
    }

    &:focus,
    &:focus-visible {
      transform: translateX(0);
      opacity: 1;
      pointer-events: auto;
      outline: 2px solid #ffffff;
      outline-offset: 2px;
      color: #ffffff !important;
      background-color: #000000 !important;
      text-decoration: none !important;
    }
  }
}
</style>
