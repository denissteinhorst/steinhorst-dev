<script setup lang="ts">
const { cmsRequest, currentLocaleString } = useStrapi();

const { data, pending, error } = await useLazyAsyncData<ContactSectionResponse>(
  `contact-${currentLocaleString.value}`,
  (): Promise<ContactSectionResponse> =>
    cmsRequest<ContactSectionResponse>(
      "contact-section",
      ["title", "text", "jumpmark", "contactCards"],
      false,
      ["contactCards"]
    )
);

const headerText = computed<RichTextNodes>(() => data.value?.text ?? []);
</script>

<template>
  <template v-if="pending">
    <section class="contact-section">Loading contact-section...</section>
  </template>

  <template v-else-if="error">
    <section class="contact-section">Failed to load contact-section.</section>
  </template>

  <section
    v-else-if="data"
    :id="data.jumpmark || 'contact'"
    class="contact-section"
    aria-labelledby="contact-heading"
  >
    <!-- Fluid blurry background -->
    <div class="contact-section__background"></div>

    <!-- Elevate foreground content above decorative background -->
    <UContainer class="contact-section__container">
      <header class="contact-section__header">
        <div class="contact-section__badge">
          <JobSearchBadge />
        </div>
        <h2 id="contact-heading" class="contact-section__title">
          {{ data.title || "Contact" }}
        </h2>
        <div v-if="headerText.length > 0" class="contact-section__description">
          <StrapiBlocksText :nodes="headerText" />
        </div>
      </header>

      <ul class="contact-section__grid" role="list" aria-label="Kontaktkanäle">
        <ContactCard
          v-for="(contactCard, cardIndex) in data.contactCards"
          :key="contactCard.id || cardIndex"
          :data="contactCard"
          :aos-delay="cardIndex * 100"
        />
      </ul>
    </UContainer>
  </section>
</template>

<style scoped lang="scss">
$block: "contact-section";

.#{$block} {
  position: relative;
  padding-top: 4rem;
  padding-bottom: 2.5rem;
  overflow: hidden;
  background-color: #1e2025;

  @media (min-width: 640px) {
    padding-top: 5rem;
    padding-bottom: 3rem;
  }

  @media (min-width: 1024px) {
    padding-top: 6rem;
    padding-bottom: 3.5rem;
  }

  &__background {
    position: absolute;
    inset: 0;
    z-index: 1;
    pointer-events: none;
    width: 100%;
    height: 100%;
    background: radial-gradient(
        ellipse 80% 60% at 10% 20%,
        var(--color-primary) 0%,
        transparent 80%
      ),
      radial-gradient(ellipse 70% 50% at 90% 80%, #484848ff 0%, transparent 80%),
      radial-gradient(
        ellipse 60% 40% at 50% 60%,
        var(--color-secondary) 0%,
        transparent 80%
      );
    filter: blur(48px) saturate(1.4);
    opacity: 0.95;
    transition: opacity 1.2s cubic-bezier(0.4, 0, 0.2, 1);
    animation: fluidFadeIn 1.5s ease,
      fluidMove 10s infinite alternate ease-in-out;
  }

  &__container {
    position: relative;
    z-index: 10;
    max-width: 80rem;
    padding-left: 1rem;
    padding-right: 1rem;

    @media (min-width: 640px) {
      padding-left: 1.5rem;
      padding-right: 1.5rem;
    }

    @media (min-width: 1024px) {
      padding-left: 2rem;
      padding-right: 2rem;
    }
  }

  &__header {
    margin-bottom: 3rem;
    text-align: center;
    display: flex;
    flex-direction: column;
    gap: 1.25rem;
  }

  &__badge {
    display: flex;
    justify-content: center;
    align-items: center;
    margin-bottom: -1.75rem;
  }

  &__title {
    font-size: 1.875rem;
    font-weight: 600;
    color: white;
    text-shadow: 1px 1px 2px rgba(0, 0, 0, 0.8);
    line-height: 1.2;
    margin-bottom: -0.5rem;

    @media (min-width: 640px) {
      font-size: 2.25rem;
    }

    @media (min-width: 1024px) {
      font-size: 3rem;
    }
  }

  &__description {
    font-size: 1rem;
    margin: 0 auto;
    width: 85%;
    color: var(--color-text);
    font-weight: 500;
    text-shadow: 0 1px 1px rgba(0, 0, 0, 1);

    // Force dark mode CSS variables for StrapiBlocksText content
    --color-text: #d1d5db;
    --color-heading: #ffffff;
    --color-primary: #a684ff;

    @media (min-width: 640px) {
      font-size: 1.125rem;
    }
  }

  &__grid {
    display: grid;
    gap: 1.5rem;
    grid-template-columns: 1fr;
    list-style: none;
    margin: 0;
    padding: 0;

    @media (min-width: 640px) {
      gap: 1.75rem;
      grid-template-columns: repeat(2, 1fr);
    }

    @media (min-width: 768px) {
      grid-template-columns: repeat(2, 1fr);
    }

    @media (min-width: 1024px) {
      gap: 2rem;
      grid-template-columns: repeat(4, 1fr);
    }
  }
}

@keyframes fluidFadeIn {
  from {
    opacity: 0;
  }
  to {
    opacity: 0.95;
  }
}

@keyframes fluidMove {
  0% {
    transform: translate(0, 0);
  }
  50% {
    transform: translate(10px, -10px);
  }
  100% {
    transform: translate(-10px, 10px);
  }
}

/* Allow graceful reduction for users preferring less motion */
@media (prefers-reduced-motion: reduce) {
  .#{$block}__background {
    transition: none !important;
    animation: none !important;
  }
}
</style>
