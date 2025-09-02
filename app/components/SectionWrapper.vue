<script setup lang="ts">
const props = defineProps<{
  jumpmark: string;
  variant: "h1" | "h2" | "h3" | "h4" | "h5" | "h6";
  headerTitle: string;
  headerText: Array<BlockNode> | [];
  buttonText?: string;
  buttonLink?: string;
  buttonIcon?: string;
  target?: string;
  footerText?: Array<BlockNode> | [];
  textAlign?: "left" | "center" | "right";
}>();

const footerContentText = computed<BlockNode[]>(
  () => (props.footerText ?? []) as BlockNode[]
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
        <StrapiBlocksText :nodes="footerContentText" />
      </footer>
    </UContainer>
  </section>
</template>

<style scoped lang="scss">
$block: "section-wrapper";

.#{$block} {
  padding-top: 4rem;
  padding-bottom: 4rem;

  @media (min-width: 640px) {
    padding-top: 5rem;
    padding-bottom: 5rem;
  }
  @media (min-width: 1024px) {
    padding-top: 6rem;
    padding-bottom: 6rem;
  }

  .section-header {
    margin-bottom: 3rem;
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
      gap: 1rem;
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
      margin-top: 0.5rem;
      color: rgba(75, 85, 99, 1);
      line-height: 1.6;
      font-size: 1rem;

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
      margin-top: 1rem;
      display: flex;
      align-items: center;
      justify-content: flex-start;

      @media (min-width: 768px) {
        margin-top: 0;
      }
    }

    &--center &__actions {
      justify-content: center;

      @media (min-width: 768px) {
        justify-content: center;
      }
    }

    &--right &__actions {
      justify-content: flex-end;

      @media (min-width: 768px) {
        justify-content: flex-end;
      }
    }

    &--left &__actions {
      @media (min-width: 768px) {
        justify-content: flex-end;
      }
    }

    &__button {
      display: inline-flex;
      align-items: center;
      gap: 0.25rem;
      text-decoration: none;
      cursor: pointer;
    }

    &__icon {
      margin-left: 0.25rem;
      width: 1rem;
      height: 1rem;
      display: inline-block;
    }
  }

  .section-footer {
    font-size: 0.875rem;
    color: rgba(75, 85, 99, 1);
    margin-top: 2rem;
    text-align: left;
    line-height: 1.5;
    text-align: center;

    :deep(p) {
      padding-bottom: 0.5rem;
      font-size: 16px;
      color: var(--color-text-secondary);

      @media (prefers-color-scheme: dark) {
        color: #979fab;
      }
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
