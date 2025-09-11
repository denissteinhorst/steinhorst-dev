<script setup lang="ts">
const props = withDefaults(
  defineProps<{
    jumpmark: string;
    variant: HeadingLevel;
    headerTitle: string;
    headerText?: RichTextNodes | [];
    buttonText?: string;
    buttonLink?: string;
    buttonIcon?: string;
    target?: NavigationLinkTarget;
    footerText?: RichTextNodes | [];
    textAlign?: TextAlignment;
    isWrapped?: boolean;
    nextSection?: string;
  }>(),
  {
    headerText: () => [] as unknown as RichTextNodes,
    footerText: () => [] as unknown as RichTextNodes,
    buttonText: undefined,
    buttonLink: undefined,
    buttonIcon: undefined,
    target: "_self" as NavigationLinkTarget,
    textAlign: "left" as TextAlignment,
    nextSection: undefined,
  }
);

const emit = defineEmits<{
  "button-click": [event: MouseEvent];
}>();

const handleButtonClick = (event: MouseEvent) => {
  if (!props.buttonLink) {
    emit("button-click", event);
  }
};

// Clip-path scrolling effect for wrapped sections
const sectionRef = ref<HTMLElement>();
const scrollY = ref(0);
const clipPath = ref("");

/**
 * Calculate the clip-path inset values based on scroll position
 * Gradually shrinks the wrapped section to container size with border radius
 * Reaches final form when scrolled halfway through the section element
 * Only works on desktop (1200px and wider)
 */
const updateClipPath = () => {
  if (!import.meta.client || !sectionRef.value || !props.isWrapped) return;

  // Only apply clip-path effect on desktop (1200px and wider)
  if (window.innerWidth < 1200) {
    clipPath.value = "";
    return;
  }

  // Get section element dimensions and position
  const sectionRect = sectionRef.value.getBoundingClientRect();
  const sectionHeight = sectionRef.value.offsetHeight;
  const sectionTop = window.scrollY + sectionRect.top;

  // Calculate scroll progress through the section
  // 0 = top of section, 1 = halfway through section (final form)
  const scrollThroughSection = Math.max(0, scrollY.value - sectionTop);
  const scrollProgress = Math.min(
    scrollThroughSection / (sectionHeight * 0.5),
    1
  );

  // Maximum inset values (when fully scrolled)
  const maxInsetY = 2.06716; // Percentage from top/bottom
  const maxInsetX = 8; // Approximate percentage to match container width
  const maxRadius = 14.5528; // pixels

  // Calculate current inset values
  const currentInsetY = maxInsetY * scrollProgress;
  const currentInsetX = maxInsetX * scrollProgress;
  const currentRadius = maxRadius * scrollProgress;

  // Apply clip-path
  clipPath.value = `inset(${currentInsetY}% ${currentInsetX}% round ${currentRadius}px)`;
};

// Set up scroll listener for wrapped sections
onMounted(() => {
  if (!import.meta.client || !props.isWrapped) return;

  const handleScroll = () => {
    scrollY.value = window.scrollY;
    updateClipPath();
  };

  const handleResize = () => {
    updateClipPath();
  };

  window.addEventListener("scroll", handleScroll, { passive: true });
  window.addEventListener("resize", handleResize, { passive: true });

  // Initial calculation with a slight delay to ensure element is rendered
  nextTick(() => {
    updateClipPath();
  });

  onUnmounted(() => {
    window.removeEventListener("scroll", handleScroll);
    window.removeEventListener("resize", handleResize);
  });
});
</script>

<template>
  <section
    :id="jumpmark"
    ref="sectionRef"
    :style="props.isWrapped ? { clipPath } : undefined"
    :class="[
      'section-wrapper',
      { 'section-wrapper__wrapper': props.isWrapped },
    ]"
  >
    <!-- A11y Skip Link - First focusable element in section -->
    <A11yHelper
      v-if="props.nextSection"
      :next-section="props.nextSection"
      :current-section-title="props.headerTitle"
    />

    <UContainer class="section-wrapper--container">
      <header
        class="section-header"
        :class="`section-header--${props.textAlign || 'left'}`"
        :aria-labelledby="'section-heading-' + jumpmark"
      >
        <div class="section-header__inner">
          <div class="section-header__leading">
            <component
              :is="props.variant"
              :id="'section-heading-' + jumpmark"
              class="section-header__title"
            >
              {{ props.headerTitle }}
            </component>

            <div
              :class="[
                'section-header__intro',
                {
                  'section-header__intro--center': props.textAlign === 'center',
                },
              ]"
            >
              <StrapiBlocksText :nodes="props.headerText" />
            </div>
          </div>

          <div v-if="props.buttonText" class="section-header__actions">
            <UButton
              class="section-header__button"
              variant="link"
              color="secondary"
              size="sm"
              :href="props.buttonLink"
              :target="props.target"
              aria-haspopup="dialog"
              @click="handleButtonClick"
            >
              {{ props.buttonText || "" }}
              <UIcon
                v-if="props.buttonIcon"
                :name="props.buttonIcon"
                class="section-header__icon"
                aria-hidden="true"
              />
            </UButton>
          </div>
        </div>
      </header>

      <slot name="content"></slot>

      <footer
        v-if="props.footerText && props.footerText.length > 0"
        class="section-footer"
      >
        <StrapiBlocksText :nodes="props.footerText" />
      </footer>
    </UContainer>
  </section>
</template>

<style scoped lang="scss">
$block: "section-wrapper";

.#{$block} {
  position: relative;
  padding-top: var(--spacing-3xl);
  padding-bottom: var(--spacing-3xl);

  @media (min-width: 640px) {
    padding-top: var(--spacing-4xl);
    padding-bottom: var(--spacing-4xl);
  }
  @media (min-width: 1024px) {
    padding-top: var(--spacing-5xl);
    padding-bottom: var(--spacing-5xl);
  }

  &__wrapper {
    position: relative;
    overflow: hidden;

    transition: clip-path 0.1s ease-out;

    @media (prefers-reduced-motion: reduce) {
      transition: none;
    }

    &::before {
      content: "";
      position: absolute;
      top: -2rem;
      bottom: -2rem;
      left: -100vw;
      right: -100vw;
      background-color: #fafafa;
      pointer-events: none;
      z-index: -1;

      @at-root .dark #{&} {
        background-color: rgba(0, 0, 0, 0.1) !important;
      }

      @media (min-width: 640px) {
        top: -2.5rem;
        bottom: -2.5rem;
      }

      @media (min-width: 1024px) {
        top: 0;
        bottom: 0;
      }
    }
  }

  .section-header {
    margin-bottom: var(--spacing-2xl);
    text-align: center;

    @media (min-width: 768px) {
      &--left {
        text-align: left;
      }

      &--center {
        text-align: center;
      }

      &--right {
        text-align: right;
      }
    }

    &__inner {
      display: flex;
      flex-direction: column;
      gap: var(--spacing-md);

      @media (min-width: 768px) {
        flex-direction: row;
        align-items: flex-end;
        justify-content: space-between;
      }
    }

    &__leading {
      flex: 1 1 auto;
    }

    &__title {
      font-weight: 600;
      line-height: 1.05;
      font-size: 1.875rem;
      letter-spacing: -0.01em;
      margin: 0;
      margin-bottom: 1.25rem;

      @media (min-width: 640px) {
        font-size: 2.25rem;
      }
      @media (min-width: 1024px) {
        font-size: 3rem;
      }
    }

    &__intro {
      margin-top: var(--spacing-xs);
      color: var(--color-text-muted);
      line-height: 1.6;
      font-size: var(--font-size-base);

      :deep(p) {
        padding-bottom: 0 !important;
      }

      &--center {
        margin-left: auto;
        margin-right: auto;
        max-width: 80%;
      }

      @media (min-width: 640px) {
        font-size: 1.125rem;
      }
    }

    &__actions {
      margin-top: var(--spacing-md);
      display: flex;
      align-items: center;
      justify-content: center;

      @media (min-width: 768px) {
        margin-top: 0;
        justify-content: flex-end;
        align-self: flex-end;
      }
    }

    &--center &__actions {
      justify-content: center;

      @media (min-width: 768px) {
        justify-content: flex-end;
        align-self: flex-end;
      }
    }

    &--right &__actions {
      justify-content: center;

      @media (min-width: 768px) {
        justify-content: flex-end;
        align-self: flex-end;
      }
    }

    &--left &__actions {
      justify-content: center;

      @media (min-width: 768px) {
        justify-content: flex-end;
        align-self: flex-end;
      }
    }

    &__button {
      display: inline-flex;
      align-items: center;
      gap: var(--spacing-2xs);
      text-decoration: none;
      cursor: pointer;
    }

    &__icon {
      margin-left: var(--spacing-2xs);
      width: 1rem;
      height: 1rem;
      display: inline-block;
    }
  }

  .section-footer {
    font-size: var(--font-size-sm);
    color: var(--color-text-muted);
    margin-top: var(--spacing-xl);
    text-align: left;
    line-height: 1.5;
    text-align: center;

    :deep(p) {
      padding-bottom: var(--spacing-xs);
      font-size: var(--font-size-base);
      color: var(--color-text-secondary);
    }

    :deep(a) {
      color: var(--color-primary);

      &:hover {
        text-decoration: underline;
      }
    }
  }
}
</style>
