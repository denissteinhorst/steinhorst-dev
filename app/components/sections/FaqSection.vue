<script setup lang="ts">
const { cmsRequest, currentLocaleString } = useStrapi();

const { data, pending, error } = await useLazyAsyncData<FaqSectionResponse>(
  () => `faq-${currentLocaleString.value}`,
  () => cmsRequest<FaqSectionResponse>("faq-section", [])
);

const headerText = computed<RichTextNodes>(() => data.value?.text ?? []);
</script>

<template>
  <section v-if="pending" class="faq-section faq-section--loading">
    Loading faq-section...
  </section>

  <section v-else-if="error" class="faq-section faq-section--error">
    Failed to load faq-section.
  </section>

  <SectionWrapper
    v-else-if="data"
    :jumpmark="data.jumpmark || 'faqs'"
    variant="h2"
    :header-title="data.title || ''"
    :header-text="headerText"
    text-align="center"
    :is-wrapped="true"
  >
    <template #content>
      <div class="faq-section" aria-label="Main">
        <div class="faq-section__container">
          <!-- Accent vertical line, similar to Experience Section -->
          <div aria-hidden="true" class="faq-section__accent-line">
            <div class="faq-section__accent-line-gradient"></div>
          </div>
          <UContainer class="faq-section__content">
            <div class="faq-section__accordion-wrapper">
              <div
                v-for="(item, index) in data.faqItems || []"
                :key="index"
                data-aos="fade-up"
                :data-aos-delay="Math.min(index, 5) * 100"
                class="faq-section__accordion-item-wrapper"
              >
                <UAccordion
                  type="multiple"
                  :items="[item]"
                  trailing-icon="i-lucide-chevron-down"
                  class="faq-section__accordion"
                  label-key="question"
                  :ui="{
                    item: 'faq-section__accordion-item',
                    trigger: 'faq-section__accordion-trigger',
                    content: 'faq-section__accordion-content',
                    body: 'faq-section__accordion-body',
                    leadingIcon: 'faq-section__accordion-leading-icon',
                    trailingIcon: 'faq-section__accordion-trailing-icon',
                    label: 'faq-section__accordion-label',
                  }"
                >
                  <template #default="{ item: accordionItem }">
                    <div class="faq-section__question-wrapper">
                      <UIcon
                        name="i-lucide:help-circle"
                        class="faq-section__question-icon"
                        aria-hidden="true"
                      />
                      <h6
                        :id="`faq-q-` + accordionItem.question"
                        class="faq-section__question"
                      >
                        {{ accordionItem.question }}
                      </h6>
                    </div>
                  </template>
                  <template #body="{ item: accordionItem }">
                    <div class="faq-section__answer">
                      {{ accordionItem.answer }}
                    </div>
                  </template>
                </UAccordion>
              </div>
            </div>
          </UContainer>
        </div>
      </div>
    </template>
  </SectionWrapper>
</template>

<style scoped lang="scss">
$block: "faq-section";

.#{$block} {
  &--loading,
  &--error {
    padding: 2rem;
    text-align: center;
  }

  &__container {
    position: relative;
  }

  &__accent-line {
    pointer-events: none;
    position: absolute;
    inset: 0;
    z-index: 0;
  }

  &__accent-line-gradient {
    position: absolute;
    top: 0;
    left: calc(50% - 40rem);
    width: 1px;
    height: 100%;
    background: linear-gradient(
      to bottom,
      transparent,
      var(--color-primary),
      transparent
    );
    opacity: 0.7;
  }

  &__content {
    position: relative;
    max-width: 64rem;
    margin: 0 auto;
    z-index: 1;
  }

  &__accordion-wrapper {
    width: 100%;
  }

  &__accordion-item-wrapper {
    width: 100%;
  }

  &__accordion {
    width: 100%;
  }

  &__question-wrapper {
    display: flex;
    align-items: center;
    gap: 0.5rem;
    cursor: pointer;
    transform: none !important;
    scale: 1 !important;
    transition: none !important;

    &:hover {
      transform: none !important;
      scale: 1 !important;

      .#{$block}__question {
        text-decoration: underline;
      }
    }
  }

  &__question-icon {
    flex-shrink: 0;
    width: 1.125rem;
    height: 1.125rem;
    color: rgb(var(--color-primary));
  }

  &__question {
    font-size: 1rem;
    font-weight: 600;
    line-height: 1.375;
    transition: text-decoration 150ms ease;
  }

  &__answer {
    font-size: 1rem;
    line-height: 1.625;
  }
}

:deep(.#{$block}__accordion-item) {
  border-bottom: 1px solid rgb(var(--color-gray-200));

  @media (prefers-color-scheme: dark) {
    border-bottom-color: rgb(var(--color-gray-800));
  }
}

// Remove border from the last accordion item wrapper
.#{$block}__accordion-item-wrapper:last-child {
  :deep(.#{$block}__accordion-item) {
    border-bottom: none;
  }
}

:deep(.#{$block}__accordion-trigger) {
  display: flex;
  flex: 1;
  align-items: center;
  gap: 0.375rem;
  font-weight: 500;
  font-size: 1rem;
  padding: 1rem 0;
  min-width: 0;
  transform: none !important;
  scale: 1 !important;
  transition: none !important;

  &:hover {
    transform: none !important;
    scale: 1 !important;
  }

  &:focus-visible {
    outline: 2px solid rgb(var(--color-primary));
    outline-offset: 2px;
  }
}

:deep(.#{$block}__accordion-content) {
  overflow: hidden;
  transition: all 300ms cubic-bezier(0.4, 0, 0.2, 1);

  &[data-state="open"] {
    animation: accordion-slide-down 300ms cubic-bezier(0.4, 0, 0.2, 1);
  }

  &[data-state="closed"] {
    animation: accordion-slide-up 300ms cubic-bezier(0.4, 0, 0.2, 1);
  }

  &:focus {
    outline: none;
  }
}

:deep(.#{$block}__accordion-body) {
  font-size: 1rem;
  padding-bottom: 0.875rem;
  color: rgb(var(--color-gray-700));
  transform: translateY(0);
  opacity: 1;
  transition: opacity 300ms cubic-bezier(0.4, 0, 0.2, 1),
    transform 300ms cubic-bezier(0.4, 0, 0.2, 1);

  @media (prefers-color-scheme: dark) {
    color: rgb(var(--color-gray-300));
  }

  [data-state="closed"] & {
    opacity: 0;
    transform: translateY(-10px);
  }

  [data-state="open"] & {
    opacity: 1;
    transform: translateY(0);
  }
}

:deep(.#{$block}__accordion-leading-icon) {
  flex-shrink: 0;
  width: 1.25rem;
  height: 1.25rem;
}

:deep(.#{$block}__accordion-trailing-icon) {
  flex-shrink: 0;
  width: 1.25rem;
  height: 1.25rem;
  margin-left: auto;
  transition: transform 200ms;

  [data-state="open"] & {
    transform: rotate(180deg);
  }
}

:deep(.#{$block}__accordion-label) {
  text-align: start;
  word-break: break-words;
  transform: none !important;
  scale: 1 !important;
  transition: none !important;

  &:hover {
    transform: none !important;
    scale: 1 !important;
  }
}

@keyframes accordion-slide-down {
  from {
    height: 0;
    opacity: 0;
  }
  to {
    height: var(--radix-accordion-content-height);
    opacity: 1;
  }
}

@keyframes accordion-slide-up {
  from {
    height: var(--radix-accordion-content-height);
    opacity: 1;
  }
  to {
    height: 0;
    opacity: 0;
  }
}
</style>
