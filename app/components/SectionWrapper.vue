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
  }>(),
  {
    headerText: () => [] as unknown as RichTextNodes,
    footerText: () => [] as unknown as RichTextNodes,
    buttonText: undefined,
    buttonLink: undefined,
    buttonIcon: undefined,
    target: "_self" as NavigationLinkTarget,
    textAlign: "left" as TextAlignment,
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
</script>

<template>
  <section :id="jumpmark" class="section-wrapper">
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

  .section-header {
    margin-bottom: var(--spacing-2xl);
    text-align: left;

    &--left {
      text-align: left;
    }

    &--center {
      text-align: center;
    }

    &--right {
      text-align: right;
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
      justify-content: flex-start;

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
      justify-content: flex-end;

      @media (min-width: 768px) {
        justify-content: flex-end;
        align-self: flex-end;
      }
    }

    &--left &__actions {
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
