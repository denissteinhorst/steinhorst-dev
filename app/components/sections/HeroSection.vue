<script setup lang="ts">
const { cmsRequest, buildImageUrl, currentLocaleString } = useStrapi();

// Preload hero background image for Safari optimization
const preloadBgImage = () => {
  if (import.meta.client) {
    const link = document.createElement("link");
    link.rel = "preload";
    link.href = "/images/hero_image.jpeg";
    link.as = "image";
    link.crossOrigin = "anonymous";
    document.head.appendChild(link);
  }
};

onMounted(() => {
  preloadBgImage();
});

const { data, pending, error } = await useLazyAsyncData<HeroSectionResponse>(
  () => `hero-section-${currentLocaleString.value}`,
  () =>
    cmsRequest<HeroSectionResponse>("hero-section", [
      "titleBefore",
      "emphasis",
      "titleAfter",
      "text",
      "jumpmark",
      "image",
      "heroTags",
      "heroLinks",
    ])
);

const text = computed<RichTextNodes>(() => data.value?.text ?? []);
</script>

<template>
  <section v-if="pending" class="hero-section">Loading hero-section...</section>

  <section v-else-if="error" class="hero-section">
    Failed to load hero-section.
  </section>

  <section
    v-else-if="data"
    :id="data.jumpmark"
    class="hero-section"
    aria-labelledby="hero-heading"
  >
    <!-- persistent dark gradient background -->
    <div class="hero-section__bg-glow" aria-hidden="true"></div>

    <!-- layered decorative backgrounds -->
    <div class="hero-section__bg-layers" aria-hidden="true">
      <div class="hero-section__masked-gradient" aria-hidden="true"></div>
      <div class="hero-section__radial"></div>
      <div class="hero-section__aura-top" aria-hidden="true"></div>
      <div class="hero-section__bottom-fade" aria-hidden="true"></div>
    </div>

    <UContainer class="hero-section__container">
      <div
        class="hero-section__background-blur"
        :class="{ 'hero-section__background-blur--loaded': !pending }"
        aria-hidden="true"
      ></div>
      <div class="hero-section__inner">
        <div class="hero-section__grid">
          <!-- Left: complete content area -->
          <div class="hero-section__col hero-section__col--content">
            <div class="hero-section__content-wrapper">
              <header class="hero-section__header">
                <div class="hero-section__badge">
                  <JobSearchBadge />
                </div>

                <h1 id="hero-heading" tabindex="-1" class="hero-section__title">
                  <span v-if="data.titleBefore">{{ data.titleBefore }} </span>
                  <span v-if="data.emphasis" class="hero-section__emphasis">{{
                    data.emphasis
                  }}</span>
                  <span v-if="data.titleAfter"> {{ data.titleAfter }}</span>
                </h1>

                <div class="hero-section__text">
                  <StrapiBlocksText :nodes="text" />
                </div>
              </header>

              <!-- Desktop: highlights + actions -->
              <div class="hero-section__desktop-actions">
                <ul
                  class="hero-section__highlights hero-section__highlights--desktop"
                  aria-label="Highlights"
                >
                  <li
                    v-for="tag in data.heroTags || []"
                    :key="tag.id"
                    class="hero-section__highlight-item"
                  >
                    <span>{{ tag.text }}</span>
                  </li>
                </ul>

                <div
                  class="hero-section__actions hero-section__actions--desktop"
                >
                  <template
                    v-for="(link, idx) in data.heroLinks || []"
                    :key="link.id ?? link.text ?? idx"
                  >
                    <UButton
                      v-if="link.type === 'button'"
                      :href="link.link ?? '#'"
                      :target="link.target || '_self'"
                      size="md"
                      color="secondary"
                      class="hero-section__cta"
                    >
                      <UIcon
                        v-if="link.icon"
                        :name="link.icon"
                        class="hero-section__icon"
                      />
                      {{ link.text }}
                    </UButton>

                    <template v-else>
                      <UTooltip
                        v-if="link.tooltip"
                        :text="link.tooltip"
                        :delay-duration="0"
                        :content="{ side: 'bottom', sideOffset: 6 }"
                      >
                        <a
                          :href="link.link ?? '#'"
                          target="_blank"
                          rel="noopener noreferrer"
                          class="hero-section__social-link"
                        >
                          <UIcon
                            :name="link.icon || 'i-lucide-mail'"
                            class="hero-section__icon"
                          />
                          <span class="hero-section__social-text">{{
                            link.text
                          }}</span>
                        </a>
                      </UTooltip>
                      <a
                        v-else
                        :href="link.link ?? '#'"
                        target="_blank"
                        rel="noopener noreferrer"
                        class="hero-section__social-link"
                      >
                        <UIcon
                          :name="link.icon || 'i-lucide-mail'"
                          class="hero-section__icon"
                        />
                        <span class="hero-section__social-text">{{
                          link.text
                        }}</span>
                      </a>
                    </template>
                  </template>
                </div>
              </div>
            </div>
          </div>

          <!-- Right: portrait / media -->
          <div class="hero-section__col hero-section__col--media">
            <figure class="hero-section__portrait">
              <img
                :src="buildImageUrl(data.image) || '/images/hero-image.png'"
                :alt="
                  data.image?.alternativeText || 'Portrait von Denis Steinhorst'
                "
                class="hero-section__portrait-img"
                sizes="(min-width: 1280px) 34rem, (min-width: 1024px) 28rem, 60vw"
                decoding="async"
                fetchpriority="high"
              />
            </figure>
          </div>

          <!-- Mobile list + actions (stacked under image) -->
          <div class="hero-section__mobile-actions">
            <ul class="hero-section__highlights" aria-label="Highlights">
              <li
                v-for="tag in data.heroTags || []"
                :key="tag.id"
                class="hero-section__highlight-item"
              >
                <span>{{ tag.text }}</span>
              </li>
            </ul>

            <div class="hero-section__actions">
              <template
                v-for="(link, idx) in data.heroLinks || []"
                :key="link.id ?? link.text ?? idx"
              >
                <UButton
                  v-if="link.type === 'button'"
                  :href="link.link ?? '#'"
                  :target="link.target || '_self'"
                  size="md"
                  color="secondary"
                  class="hero-section__cta"
                >
                  <UIcon
                    v-if="link.icon"
                    :name="link.icon"
                    class="hero-section__icon"
                  />
                  {{ link.text }}
                </UButton>

                <template v-else>
                  <UTooltip
                    v-if="link.tooltip"
                    :text="link.tooltip"
                    :delay-duration="0"
                    :content="{ side: 'bottom', sideOffset: 6 }"
                  >
                    <a
                      :href="link.link ?? '#'"
                      target="_blank"
                      rel="noopener noreferrer"
                      class="hero-section__social-link"
                    >
                      <UIcon
                        :name="link.icon || 'i-lucide-mail'"
                        class="hero-section__icon"
                      />
                      <span class="hero-section__social-text">{{
                        link.text
                      }}</span>
                    </a>
                  </UTooltip>
                  <a
                    v-else
                    :href="link.link ?? '#'"
                    target="_blank"
                    rel="noopener noreferrer"
                    class="hero-section__social-link"
                  >
                    <UIcon
                      :name="link.icon || 'i-lucide-mail'"
                      class="hero-section__icon"
                    />
                    <span class="hero-section__social-text">{{
                      link.text
                    }}</span>
                  </a>
                </template>
              </template>
            </div>
          </div>
        </div>
      </div>
    </UContainer>
  </section>
</template>

<style scoped lang="scss">
$block: "hero-section";

.#{$block} {
  position: relative;
  overflow: hidden;
  isolation: isolate;
  margin-top: -72px;

  /* Keep this hero visually dark regardless of global color mode.
    Define local CSS variables that override root/theme variables for
    this component only. This prevents light-mode from affecting it. */
  --color-heading: #e5e5e5; /* dark-theme heading */
  --color-text: #d1d5db; /* dark-theme body text */
  --color-bg: #1d2129; /* dark background */
  --color-background: #1d2129; /* used by some gradients here */
  --color-surface: #232833;

  color: var(--color-text);
  background: var(--color-bg);
  min-height: 100vh;
  display: flex;
  align-items: center;
  padding-top: calc(4rem + 72px);
  padding-bottom: 4rem;

  @media (min-width: 1024px) {
    padding-top: calc(5rem + 72px);
    padding-bottom: 5rem;
  }

  &__background-blur {
    position: absolute;
    inset: -250px;
    background-image: url("/images/hero_image.jpeg");
    background-size: cover;
    background-position: center;
    background-repeat: no-repeat;
    pointer-events: none;
    z-index: -1;
    opacity: 0;
    transition: opacity 0.8s ease-out;

    /* Safari-optimized blur with fallbacks */
    filter: blur(50px) brightness(0.45) contrast(1.1) saturate(0.5);
    -webkit-filter: blur(50px) brightness(0.45) contrast(1.1) saturate(0.5);

    /* Ensure full coverage with transform scale as backup */
    transform: scale(1.2);
    -webkit-transform: scale(1.2);

    /* Performance optimizations for Safari */
    will-change: transform, filter;
    transform-style: preserve-3d;
    -webkit-transform-style: preserve-3d;
    backface-visibility: hidden;
    -webkit-backface-visibility: hidden;

    /* Preload hint for Safari */
    content-visibility: auto;

    /* Safari-specific fixes for positioning */
    @supports (-webkit-backdrop-filter: blur(1px)) {
      /* Ensure proper coverage on Safari */
      left: -300px;
      right: -300px;
      top: -300px;
      bottom: -300px;
      width: calc(100vw + 600px);
      height: calc(100vh + 600px);
      inset: unset;
    }

    /* Fallback for older Safari versions */
    @media screen and (-webkit-min-device-pixel-ratio: 0) {
      transform: scale(1.5);
      -webkit-transform: scale(1.5);
    }

    &--loaded {
      opacity: 1;
    }
  }

  &__bg-layers {
    position: absolute;
    inset: 0;
    z-index: 10;
    pointer-events: none;
  }

  &__container {
    position: relative;
    z-index: 20;
  }

  &__inner {
    width: 100%;
  }

  &__grid {
    display: grid;
    gap: 1.5rem;
    align-items: center;
    grid-template-columns: 1fr;

    @media (min-width: 1024px) {
      grid-template-columns: 1fr 1fr;
      gap: 3rem;
      align-items: center;
    }
  }

  &__col {
    &--content {
      grid-column: 1 / -1;
      max-width: 40rem;
      margin: 0 auto;

      @media (min-width: 1024px) {
        grid-column: 1;
        margin: 0;
        max-width: none;
      }
    }

    &--media {
      grid-column: 1 / -1;
      margin: 0 auto;
      max-width: 28rem;
      margin-top: 2rem;

      @media (min-width: 1024px) {
        grid-column: 2;
        max-width: none;
        margin-top: 0;
        display: flex;
        align-items: center;
        justify-content: center;
      }
    }
  }

  &__content-wrapper {
    display: flex;
    flex-direction: column;
    height: 100%;
    text-align: center;

    @media (min-width: 1024px) {
      justify-content: center;
      text-align: left;
    }
  }

  &__header {
    display: block;
    gap: 1.5rem;
  }

  &__badge {
    display: flex;
    justify-content: center;

    @media (min-width: 1024px) {
      justify-content: flex-start;
    }
  }

  &__title {
    margin: 1rem 0 0.5rem;
    font-weight: 700;
    line-height: 1.05;
    color: var(--color-heading);
    font-size: var(--font-size-3xl);
    scroll-margin-top: 80px;
    text-shadow: 0 2px 8px rgba(0, 0, 0, 0.3);
    letter-spacing: -0.025em;

    @media (min-width: 640px) {
      font-size: var(--font-size-4xl);
    }
    @media (min-width: 1024px) {
      font-size: var(--font-size-6xl);
      text-shadow: 0 4px 12px rgba(0, 0, 0, 0.4);
    }
  }

  &__emphasis {
    color: var(--color-primary);
    position: relative;
  }

  &__text {
    margin-top: 1rem;
    color: var(--color-text);
    line-height: 1.6;
    max-width: 60ch;
    font-weight: 500;
    margin-left: auto;
    margin-right: auto;
    text-shadow: 0 1px 1px rgb(0, 0, 0);

    @media (min-width: 1024px) {
      margin-left: 0;
      margin-right: 0;
    }
  }

  /* portrait */
  &__portrait {
    position: relative;
    width: 100%;
    max-width: 28rem;
    margin: 0 auto;
    transform: scale(0.7);
    opacity: 0.85;

    @media (min-width: 1024px) {
      transform: scale(0.9);
      opacity: 0.9;
    }
  }

  .shape-blob {
    border-radius: 30% 70% 70% 30% / 30% 30% 70% 70%;
    transition: border-radius 1.2s cubic-bezier(0.25, 0.8, 0.25, 1),
      filter 0.4s ease, transform 0.6s ease;
  }

  &__portrait-img {
    position: relative;
    width: 100%;
    display: block;
    border-radius: 30% 70% 70% 30% / 30% 30% 70% 70%;
    box-shadow: 0 8px 25px rgba(0, 0, 0, 0.08), 0 2px 4px rgba(0, 0, 0, 0.04);
    border: 1px solid rgba(255, 255, 255, 0.6);
    z-index: 10;
    object-fit: cover;
    will-change: transform;
    filter: saturate(0.9) brightness(0.95);

    /* Mobile - minimal transform for performance */
    @media (max-width: 767px) {
      transform: perspective(600px) rotateY(-1deg) rotateX(0.5deg);
    }

    /* Tablet - moderate transform */
    @media (min-width: 768px) and (max-width: 1023px) {
      transform: perspective(800px) rotateY(-2deg) rotateX(1deg);
    }

    /* Desktop - subtle 3D effect */
    @media (min-width: 1024px) {
      transform: perspective(1000px) rotateY(-3deg) rotateX(2deg);
    }
  }

  &:hover {
    .shape-blob {
      border-radius: 32% 68% 65% 35% / 28% 34% 72% 68%;
    }
  }

  &__highlights {
    display: flex;
    flex-wrap: wrap;
    gap: 0.5rem 1.5rem;
    font-size: var(--font-size-sm);
    font-weight: 500;
    justify-content: center;
    margin-left: 0rem;
    padding-bottom: 0.5rem;

    &--desktop {
      justify-content: flex-start;
    }
  }

  &__highlight-item {
    display: inline-flex;
    align-items: center;
    color: var(--color-text);
    font-weight: 600;
  }

  &__actions {
    display: flex;
    flex-wrap: wrap;
    gap: 0.5rem;
    justify-content: center;

    &--desktop {
      justify-content: flex-start;
    }
  }

  &__social-link {
    color: var(--color-text);
    display: inline-flex;
    align-items: center;
    gap: 0.5rem;
    padding: 0.5rem 0.75rem;
    border-radius: 0.5rem;
    font-size: var(--font-size-md);
    text-decoration: none;
    transition: color 0.16s ease, background-color 0.16s ease;

    &:hover,
    &:focus-visible {
      background-color: rgba(255, 255, 255, 0.04);
    }
  }

  &__icon {
    display: inline-flex;
    align-items: center;
  }

  &__social-text {
    display: none;

    @media (min-width: 640px) {
      display: inline;
      margin-left: 0.5rem;
    }
  }

  /* Mobile/desktop control for actions */
  &__mobile-actions {
    display: block;
    margin-top: 1.5rem;

    @media (min-width: 1024px) {
      display: none;
    }
  }

  &__desktop-actions {
    display: none;
    margin-top: 1.5rem;

    @media (min-width: 1024px) {
      display: block;
      margin-top: 1.5rem;
    }
  }
}

@media (prefers-reduced-motion: reduce) {
  .hero-section__portrait-img {
    transform: none !important;
  }

  .shape-blob {
    transition: none !important;
  }
}
</style>
