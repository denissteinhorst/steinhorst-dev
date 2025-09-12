<script setup lang="ts">
const { cmsRequest, currentLocaleString } = useStrapi();

const { data, pending, error } = await useLazyAsyncData<HeroSectionResponse>(
  `hero-section-${currentLocaleString.value}`,
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
  <template v-if="pending">
    <section class="hero-section">Loading hero-section...</section>
  </template>

  <template v-else-if="error">
    <section class="hero-section">Failed to load hero-section.</section>
  </template>

  <section
    v-else-if="data"
    :id="data.jumpmark"
    class="hero-section"
    aria-labelledby="hero-heading"
  >
    <!-- Background Elements -->
    <div class="hero-section-bg" aria-hidden="true">
      <div class="hero-section-bg-blur" :class="{ loaded: !pending }"></div>
      <div class="hero-section-bg-noise"></div>
      <div class="hero-section-bg-overlay"></div>
    </div>

    <UContainer class="hero-section-container">
      <div class="hero-section-bg-blur"></div>
      <div class="hero-section-grid">
        <!-- Content Column -->
        <div class="hero-section-content">
          <div class="hero-section-badge">
            <JobSearchBadge />
          </div>

          <h1 id="hero-heading" tabindex="-1" class="hero-section-title">
            <span v-if="data.titleBefore">{{ data.titleBefore }} </span><br />
            <span v-if="data.emphasis" class="hero-section-title-emphasis">{{
              data.emphasis
            }}</span>
            <span v-if="data.titleAfter"> {{ data.titleAfter }}</span>
          </h1>

          <div class="hero-section-text">
            <StrapiBlocksText :nodes="text" />
          </div>

          <!-- Desktop Actions -->
          <div class="hero-section-actions desktop-only">
            <ul class="hero-section-tags" aria-label="Highlights">
              <li
                v-for="heroTag in data.heroTags || []"
                :key="heroTag.id"
                class="hero-section-tag"
              >
                <span>{{ heroTag.text }}</span>
              </li>
            </ul>

            <div class="hero-section-buttons">
              <template
                v-for="(heroLink, linkIndex) in data.heroLinks || []"
                :key="heroLink.id ?? heroLink.text ?? linkIndex"
              >
                <UButton
                  v-if="heroLink.type === 'button'"
                  :href="heroLink.link ?? '#'"
                  :target="heroLink.target || '_self'"
                  size="md"
                  color="secondary"
                  class="hero-section-cta"
                >
                  <UIcon
                    v-if="heroLink.icon"
                    :name="heroLink.icon"
                    class="hero-section-icon"
                  />
                  {{ heroLink.text }}
                </UButton>

                <template v-else>
                  <UTooltip
                    v-if="heroLink.tooltip"
                    :text="heroLink.tooltip"
                    :delay-duration="0"
                    :content="{ side: 'bottom', sideOffset: 6 }"
                  >
                    <a
                      :href="heroLink.link ?? '#'"
                      target="_blank"
                      rel="noopener noreferrer"
                      class="hero-section-link"
                    >
                      <UIcon
                        :name="heroLink.icon || 'i-lucide-mail'"
                        class="hero-section-icon"
                      />
                      <span class="hero-section-link-text">{{
                        heroLink.text
                      }}</span>
                    </a>
                  </UTooltip>
                  <a
                    v-else
                    :href="heroLink.link ?? '#'"
                    target="_blank"
                    rel="noopener noreferrer"
                    class="hero-section-link"
                  >
                    <UIcon
                      :name="heroLink.icon || 'i-lucide-mail'"
                      class="hero-section-icon"
                    />
                    <span class="hero-section-link-text">{{
                      heroLink.text
                    }}</span>
                  </a>
                </template>
              </template>
            </div>
          </div>
        </div>

        <!-- Image Column -->
        <div class="hero-section-image">
          <figure class="hero-section-portrait">
            <div class="hero-section-img-slots">
              <div class="hero-section-img-slot hero-section-img-slot--left">
                <img
                  src="/images/hero_image.webp"
                  :alt="
                    data.image?.alternativeText ||
                    'Portrait von Denis Steinhorst'
                  "
                  class="hero-section-img"
                  sizes="(min-width: 1280px) 34rem, (min-width: 1024px) 28rem, 60vw"
                  decoding="async"
                  fetchpriority="high"
                />
              </div>

              <div class="hero-section-img-slot hero-section-img-slot--right">
                <img
                  src="/images/hero_image.webp"
                  alt=""
                  class="hero-section-img"
                  sizes="(min-width: 1280px) 34rem, (min-width: 1024px) 28rem, 60vw"
                  decoding="async"
                  aria-hidden="true"
                />
              </div>
            </div>
          </figure>
        </div>

        <!-- Mobile Actions -->
        <div class="hero-section-actions mobile-only">
          <ul class="hero-section-tags" aria-label="Highlights">
            <li
              v-for="heroTag in data.heroTags || []"
              :key="heroTag.id"
              class="hero-section-tag"
            >
              <span>{{ heroTag.text }}</span>
            </li>
          </ul>

          <div class="hero-section-buttons">
            <template
              v-for="(heroLink, linkIndex) in data.heroLinks || []"
              :key="heroLink.id ?? heroLink.text ?? linkIndex"
            >
              <UButton
                v-if="heroLink.type === 'button'"
                :href="heroLink.link ?? '#'"
                :target="heroLink.target || '_self'"
                size="md"
                color="secondary"
                class="hero-section-cta"
              >
                <UIcon
                  v-if="heroLink.icon"
                  :name="heroLink.icon"
                  class="hero-section-icon"
                />
                {{ heroLink.text }}
              </UButton>

              <template v-else>
                <UTooltip
                  v-if="heroLink.tooltip"
                  :text="heroLink.tooltip"
                  :delay-duration="0"
                  :content="{ side: 'bottom', sideOffset: 6 }"
                >
                  <a
                    :href="heroLink.link ?? '#'"
                    target="_blank"
                    rel="noopener noreferrer"
                    class="hero-section-link"
                  >
                    <UIcon
                      :name="heroLink.icon || 'i-lucide-mail'"
                      class="hero-section-icon"
                    />
                    <span class="hero-section-link-text">{{
                      heroLink.text
                    }}</span>
                  </a>
                </UTooltip>
                <a
                  v-else
                  :href="heroLink.link ?? '#'"
                  target="_blank"
                  rel="noopener noreferrer"
                  class="hero-section-link"
                >
                  <UIcon
                    :name="heroLink.icon || 'i-lucide-mail'"
                    class="hero-section-icon"
                  />
                  <span class="hero-section-link-text">{{
                    heroLink.text
                  }}</span>
                </a>
              </template>
            </template>
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

  /* Dark theme variables - always dark regardless of color mode */
  --color-heading: #e5e5e5;
  --color-text: #eeeeee;
  --color-bg: #1d2129;
  --color-surface: #232833;
  --color-primary: #9861ff; /* Fallback for emphasis text */

  color: var(--color-text);
  background: black;
  min-height: 100vh;
  display: flex;
  align-items: center;

  /* Optimized padding - much tighter */
  padding: calc(1.5rem + 72px) 0 1.5rem;

  @media (min-width: 768px) {
    padding: calc(2rem + 72px) 0 2rem;
  }

  @media (min-width: 1024px) {
    padding: calc(2.5rem + 72px) 0 2.5rem;
  }

  &-cta {
    font-weight: 600;
  }

  /* Background Elements */
  &-bg {
    position: absolute;
    inset: 0;
    z-index: 1;
    pointer-events: none;

    &-blur {
      position: absolute;
      inset: 0;
      background-image: url("/images/hero_image.webp");
      background-size: cover;
      background-position: center;
      background-repeat: no-repeat;
      opacity: 0;
      transition: opacity 0.8s ease-out;
      filter: blur(50px) brightness(0.4) saturate(0.6);
      transform: scale(1.1);
      z-index: -1;
      animation: subtle-float 6s ease-in-out infinite;

      &.loaded {
        opacity: 1;
      }
    }

    &-noise {
      position: absolute;
      inset: 0;
      background-image: radial-gradient(
          circle at 20% 30%,
          rgba(255, 255, 255, 0.015) 1px,
          transparent 1px
        ),
        radial-gradient(
          circle at 80% 70%,
          rgba(255, 255, 255, 0.01) 1px,
          transparent 1px
        ),
        radial-gradient(
          circle at 40% 80%,
          rgba(255, 255, 255, 0.008) 1px,
          transparent 1px
        ),
        radial-gradient(
          circle at 60% 20%,
          rgba(255, 255, 255, 0.012) 1px,
          transparent 1px
        );
      background-size: 3px 3px, 5px 5px, 2px 2px, 4px 4px;
      background-position: 0 0, 1px 2px, 3px 1px, 2px 3px;
      opacity: 1;
      z-index: 2;
      mix-blend-mode: overlay;
    }

    &-overlay {
      position: absolute;
      inset: 0;
      background: rgba(29, 33, 41, 0.4);
    }
  }

  /* Container */
  &-container {
    position: relative;
    z-index: 10;

    @media (min-width: 1200px) {
      margin-top: -5%;
    }
  }

  /* Grid Layout - Responsive */
  &-grid {
    display: grid;
    gap: 1.5rem;
    align-items: center;

    @media (min-width: 1024px) {
      grid-template-columns: 1fr 1fr;
      gap: 3rem;
    }
  }

  /* Content Column */
  &-content {
    max-width: 45rem;
    margin: 0 auto;
    text-align: center;

    @media (min-width: 1024px) {
      margin: 0;
      text-align: left;
    }
  }

  &-badge {
    margin-bottom: 1rem;
    display: flex;
    justify-content: center;

    @media (min-width: 1024px) {
      justify-content: flex-start;
    }
  }

  &-title {
    font-size: clamp(2.5rem, 8vw, 4rem);
    font-weight: 700;
    line-height: 1.1;
    color: var(--color-heading);
    margin: 0 0 1rem;
    text-shadow: 0 2px 8px rgba(0, 0, 0, 0.3);
    letter-spacing: -0.025em;

    background: rgba(0, 0, 0, 0.01);

    @media (min-width: 1024px) {
      font-size: clamp(3rem, 4vw, 5rem);
      text-shadow: 0 4px 12px rgba(0, 0, 0, 0.4);
    }

    &-emphasis {
      color: var(--color-primary, #9861ff);
      font-size: inherit;
      font-weight: inherit;
      line-height: inherit;
      letter-spacing: inherit;
      font-family: inherit;
      text-shadow: inherit;
      background: rgba(0, 0, 0, 0.01);
    }
  }

  &-text {
    font-size: 1.125rem;
    line-height: 1.6;
    color: var(--color-text);
    font-weight: 500;
    margin-bottom: 1.5rem;
    text-shadow: 0 1px 1px rgba(0, 0, 0, 1);
    letter-spacing: -0.01em;

    background: rgba(0, 0, 0, 0.01);
    @media (min-width: 1024px) {
      font-size: 1.25rem;
      margin-bottom: 2rem;
    }
  }

  /* Image Column */
  &-image {
    display: flex;
    justify-content: center;
    align-items: center;
    order: -1;
    margin-bottom: 5rem;

    @media (min-width: 768px) and (max-width: 1023px) {
      margin-bottom: 3rem;
    }

    @media (min-width: 768px) and (orientation: portrait) and (max-width: 1023px) {
      margin-bottom: 3.5rem;
    }

    @media (min-width: 1024px) {
      order: 0;
      justify-content: end;
      margin-right: 5px;
      margin-bottom: 0;
    }
  }

  &-portrait {
    width: 100%;
    max-width: 20rem;
    position: relative;

    @media (min-width: 768px) {
      max-width: 24rem;
    }

    @media (min-width: 1024px) {
      max-width: 28rem;
    }
  }

  &-img-slots {
    position: relative;
    width: 100%;
    height: 400px;
    display: flex;
    justify-content: center;
    align-items: center;

    @media (min-width: 768px) {
      height: 480px;
    }

    @media (min-width: 1024px) {
      height: 530px;
    }
  }

  &-img-slot {
    position: absolute;
    width: 40%;
    height: 90%;
    overflow: hidden;
    border-radius: calc(var(--radius-default) * 4);
    box-shadow: 0 12px 35px rgba(0, 0, 0, 0.15);
    border: 1px solid rgba(255, 255, 255, 0.1);
    zoom: 0.3;

    @media (min-width: 1024px) {
      zoom: 0.39;
    }

    &--left {
      left: 10%;
      top: -20px;
      transform: rotate(10deg);
      z-index: 2;
    }

    &--right {
      right: 10%;
      bottom: -15.5%;
      transform: rotate(10deg);
      z-index: 1;
    }
  }

  &-img {
    position: absolute;
    top: 50%;
    left: 50%;
    width: auto;
    height: auto;
    max-width: none;
    max-height: none;
    transform-origin: center;
    filter: saturate(0.9) brightness(0.95);
    transition: transform 0.3s ease;

    .#{$block}-img-slot--left & {
      transform: translate(-51%, -39%) rotate(-10deg);
    }

    .#{$block}-img-slot--right & {
      transform: translate(-73.5%, -56%) rotate(-10deg);
    }
  }

  /* Actions */
  &-actions {
    &.mobile-only {
      display: block;
      margin-top: 1rem;

      @media (min-width: 1024px) {
        display: none;
      }
    }

    &.desktop-only {
      display: none;

      @media (min-width: 1024px) {
        display: block;
      }
    }
  }

  &-tags {
    display: flex;
    flex-wrap: wrap;
    gap: 0.5rem 1rem;
    justify-content: center;
    margin-bottom: 1rem;
    list-style: none;
    padding: 0;
    margin-left: 0;

    @media (min-width: 1024px) {
      justify-content: flex-start;
      margin-bottom: 1.5rem;
    }
  }

  &-tag {
    list-style: none;
    margin: 0;
    padding: 0;
    margin-right: 12px;

    span {
      font-size: 0.875rem;
      font-weight: 600;
      color: #ffffff;
      opacity: 1;
    }
  }

  &-buttons {
    display: flex;
    flex-wrap: wrap;
    gap: 0.75rem;
    justify-content: center;

    @media (min-width: 1024px) {
      justify-content: flex-start;
    }
  }

  &-link {
    color: var(--color-text);
    display: inline-flex;
    align-items: center;
    gap: 0.5rem;
    padding: 0.5rem 0.75rem;
    border-radius: 0.5rem;
    text-decoration: none;
    transition: all 0.2s ease;

    &:hover,
    &:focus-visible {
      background-color: rgba(255, 255, 255, 0.06);
      color: #fff;
    }

    &-text {
      display: none;

      @media (min-width: 640px) {
        display: inline;
      }
    }
  }

  &-icon {
    flex-shrink: 0;
  }
}

/* Accessibility */
@media (prefers-reduced-motion: reduce) {
  .#{$block}-bg-blur {
    transition: none !important;
    animation: none !important;
  }
}

/* Subtle background animation */
@keyframes subtle-float {
  0%,
  100% {
    transform: scale(1.1) translateY(0px) translateX(0px);
    filter: blur(50px) brightness(0.4) saturate(0.6);
  }
  25% {
    transform: scale(1.12) translateY(-3px) translateX(1px);
    filter: blur(51px) brightness(0.42) saturate(0.65);
  }
  50% {
    transform: scale(1.13) translateY(-1px) translateX(-1px);
    filter: blur(52px) brightness(0.44) saturate(0.7);
  }
  75% {
    transform: scale(1.12) translateY(-4px) translateX(1px);
    filter: blur(51px) brightness(0.41) saturate(0.65);
  }
}
</style>
