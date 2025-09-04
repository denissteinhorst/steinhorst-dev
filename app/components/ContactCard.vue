<script setup lang="ts">
const props = defineProps<{
  data: ContactCard;
  aosDelay: number;
}>();

// Compute text nodes for StrapiBlocksText
const textNodes = computed<RichTextNodes>(() => props.data.text ?? []);

// Compute aria label based on target
const getAriaLabel = (card: ContactCard): string => {
  const baseLabel = card.title || "";
  if (card.target === "_blank") {
    return `${baseLabel} (öffnet in neuem Tab)`;
  }
  return baseLabel;
};
</script>

<template>
  <li
    data-aos="fade-up"
    :data-aos-delay="aosDelay"
    role="listitem"
    class="contact-card"
  >
    <BaseCard
      class="contact-card__inner"
      role="group"
      :is-dark="true"
      :aria-labelledby="`contact-${data.id}-title`"
      :aria-describedby="`contact-${data.id}-desc`"
    >
      <div class="contact-card__body">
        <div class="contact-card__header">
          <div class="contact-card__icon-wrapper" aria-hidden="true">
            <UIcon
              :name="data.icon || 'i-lucide-help-circle'"
              class="contact-card__icon"
            />
          </div>
          <h3 :id="`contact-${data.id}-title`" class="contact-card__title">
            {{ data.title }}
          </h3>
        </div>
        <div class="contact-card__content">
          <div
            :id="`contact-${data.id}-desc`"
            class="contact-card__description"
          >
            <StrapiBlocksText :nodes="textNodes" />
          </div>
        </div>
        <div class="contact-card__actions">
          <UButton
            :href="data.link"
            :to="undefined"
            :target="data.target"
            :rel="data.target === '_blank' ? 'noopener noreferrer' : undefined"
            color="secondary"
            variant="solid"
            size="sm"
            block
            :aria-label="getAriaLabel(data)"
            class="contact-card__button"
          >
            <UIcon
              :name="data.icon || 'i-lucide-help-circle'"
              class="contact-card__button-icon"
              aria-hidden="true"
            />
            <span class="contact-card__button-text">{{
              data.buttonText || data.title
            }}</span>
            <UIcon
              v-if="data.target === '_blank'"
              name="i-lucide-external-link"
              class="contact-card__button-external-icon"
              aria-hidden="true"
            />
            <span v-if="data.target === '_blank'" class="sr-only"
              >(öffnet in neuem Tab)</span
            >
          </UButton>
        </div>
      </div>
    </BaseCard>
  </li>
</template>

<style scoped lang="scss">
$block: "contact-card";

.#{$block} {
  height: 332px;
  display: flex;
  align-items: stretch;

  @media (max-width: 768px) {
    height: 280px;
  }

  &__inner {
    height: 100%;
    flex: 1 1 auto;
    background-color: #111827;
    color: #ffffff;
    background: rgba(255, 255, 255, 0.1);
    backdrop-filter: blur(8px);
    border-radius: var(--radius-default);
    display: flex;
    flex-direction: column;
    position: relative;
    overflow: hidden;
    border: 1px solid rgba(75, 85, 99, 0.6);
    box-shadow: 0 1px 2px 0 rgba(0, 0, 0, 0.05);
    transition: box-shadow 0.3s ease, border-color 0.3s ease;

    --color-text: #d1d5db;
    --color-heading: #ffffff;

    &:hover {
      box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1);
    }
  }

  &__body {
    display: flex;
    flex-direction: column;
    padding: 1.25rem;
    padding-bottom: 4.5rem;
    gap: 0.75rem;
    flex: 1 1 auto;
    min-height: 0;

    @media (max-width: 768px) {
      align-items: center;
      text-align: center;
    }
  }

  &__header {
    display: flex;
    align-items: center;
    gap: 0.75rem;

    @media (max-width: 768px) {
      justify-content: center;
    }
  }

  &__content {
    flex-grow: 1;
    width: 100%;
    min-height: 0;

    @media (max-width: 768px) {
      text-align: center;
    }
  }

  &__icon-wrapper {
    display: flex;
    align-items: center;
    justify-content: center;
    width: 2.75rem;
    height: 2.75rem;
    border-radius: var(--radius-small);
    background-color: rgba(168, 132, 255, 0.15);
    color: var(--color-primary);
    border: 1px solid var(--color-primary);
    opacity: 0.5;
    flex-shrink: 0;
  }

  &__icon {
    width: 1.25rem;
    height: 1.25rem;
  }

  &__title {
    font-size: 1.125rem;
    font-weight: 600;
    line-height: 1.25;
    letter-spacing: -0.025em;
    margin: 0;
    color: #ffffff;
    flex: 1;
  }

  &__description {
    margin: 0;
    font-size: 1rem;
    color: #d1d5db;
    line-height: 1.5;
    width: 100%;
  }

  &__actions {
    position: absolute;
    bottom: 1.25rem;
    left: 1.25rem;
    right: 1.25rem;
    margin-top: 0;
  }

  &__button {
    width: 100% !important;
    justify-content: center !important;
    display: flex !important;
    align-items: center;
    gap: 0.5rem;

    :deep(button) {
      width: 100% !important;
      justify-content: center !important;
      display: flex !important;
    }

    :deep() {
      width: 100% !important;
      justify-content: center !important;

      color: #ffffff !important;

      .bg-gray-50 {
        background-color: #374151 !important;
      }

      .text-gray-900 {
        color: #ffffff !important;
      }

      .border-gray-200 {
        border-color: rgba(75, 85, 99, 0.6) !important;
      }
    }
  }

  &__button-icon {
    width: 1rem;
    height: 1rem;
  }

  &__button-text {
    margin-left: 0.5rem;
  }

  &__button-external-icon {
    width: 0.875rem;
    height: 0.875rem;
    margin-left: 0.25rem;
  }
}
</style>
