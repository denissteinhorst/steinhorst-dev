<script setup lang="ts">
defineProps<{
  nextSection: string;
  currentSectionTitle: string;
}>();

// Function to handle skip link activation and focus next section
const handleSkipActivation = (event: Event, targetId: string) => {
  // Prevent default behavior for both click and keyboard events
  event.preventDefault();

  // Use nextTick to ensure proper navigation
  nextTick(() => {
    const targetElement = document.getElementById(targetId.replace("#", ""));
    if (targetElement) {
      // Scroll to the target element
      targetElement.scrollIntoView({
        behavior: "smooth",
        block: "start",
      });

      // Make the element focusable if it's not already
      if (!targetElement.hasAttribute("tabindex")) {
        targetElement.setAttribute("tabindex", "-1");
      }

      // Focus the element after scroll completes
      setTimeout(() => {
        targetElement.focus();

        // Remove tabindex after focusing to keep normal tab order
        setTimeout(() => {
          if (targetElement.getAttribute("tabindex") === "-1") {
            targetElement.removeAttribute("tabindex");
          }
        }, 100);
      }, 300);
    }
  });
};

// Handle keyboard events (Space and Enter)
const handleKeyDown = (event: KeyboardEvent, targetId: string) => {
  if (event.key === " " || event.key === "Enter") {
    handleSkipActivation(event, targetId);
  }
};
</script>

<template>
  <a
    class="a11y-helper__skip-link"
    :href="`#${nextSection}`"
    :aria-label="
      String(
        $t('a11y_helper.skip_current_section', { section: currentSectionTitle })
      )
    "
    @click="handleSkipActivation($event, nextSection)"
    @keydown="handleKeyDown($event, nextSection)"
  >
    {{
      String(
        $t("a11y_helper.skip_current_section", { section: currentSectionTitle })
      )
    }}
  </a>
</template>

<style lang="scss" scoped>
$block: "a11y-helper";

.#{$block} {
  &__skip-link {
    position: absolute;
    top: -1.5rem;
    left: 50%;
    transform: translateX(-50%);
    z-index: 9999;
    background: var(--color-gray-900, #111827);
    color: var(--color-white, #ffffff);
    padding: 0.75rem 1rem;
    border: 2px solid var(--color-primary-500, #8b5cf6);
    border-radius: 0.375rem;
    font-weight: 600;
    font-size: 0.875rem;
    text-decoration: none;
    transition: all 0.2s ease;
    white-space: nowrap;

    &:focus,
    &:focus-visible {
      clip-path: none;
      transform: translateY(0);
      outline: 2px solid var(--color-primary-500, #8b5cf6);
      outline-offset: 2px;
    }

    &:hover:focus {
      background: var(--color-gray-800, #1f2937);
    }

    /* Ensure it doesn't interfere with other content when not focused */
    &:not(:focus):not(:focus-visible) {
      pointer-events: none;
    }

    &:focus,
    &:focus-visible {
      pointer-events: auto;
    }
  }
}
</style>
