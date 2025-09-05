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
    <!-- Background Elements -->
    <div class="hero-section-bg" aria-hidden="true">
      <div class="hero-section-bg-blur" :class="{ loaded: !pending }"></div>
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
            <span v-if="data.titleBefore">{{ data.titleBefore }} </span>
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
                v-for="tag in data.heroTags || []"
                :key="tag.id"
                class="hero-section-tag"
              >
                <span>{{ tag.text }}</span>
              </li>
            </ul>

            <div class="hero-section-buttons">
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
                  class="hero-section-cta"
                >
                  <UIcon
                    v-if="link.icon"
                    :name="link.icon"
                    class="hero-section-icon"
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
                      class="hero-section-link"
                    >
                      <UIcon
                        :name="link.icon || 'i-lucide-mail'"
                        class="hero-section-icon"
                      />
                      <span class="hero-section-link-text">{{
                        link.text
                      }}</span>
                    </a>
                  </UTooltip>
                  <a
                    v-else
                    :href="link.link ?? '#'"
                    target="_blank"
                    rel="noopener noreferrer"
                    class="hero-section-link"
                  >
                    <UIcon
                      :name="link.icon || 'i-lucide-mail'"
                      class="hero-section-icon"
                    />
                    <span class="hero-section-link-text">{{ link.text }}</span>
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
                  src="/images/hero_image.jpeg"
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
                  src="/images/hero_image.jpeg"
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
              v-for="tag in data.heroTags || []"
              :key="tag.id"
              class="hero-section-tag"
            >
              <span>{{ tag.text }}</span>
            </li>
          </ul>

          <div class="hero-section-buttons">
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
                class="hero-section-cta"
              >
                <UIcon
                  v-if="link.icon"
                  :name="link.icon"
                  class="hero-section-icon"
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
                    class="hero-section-link"
                  >
                    <UIcon
                      :name="link.icon || 'i-lucide-mail'"
                      class="hero-section-icon"
                    />
                    <span class="hero-section-link-text">{{ link.text }}</span>
                  </a>
                </UTooltip>
                <a
                  v-else
                  :href="link.link ?? '#'"
                  target="_blank"
                  rel="noopener noreferrer"
                  class="hero-section-link"
                >
                  <UIcon
                    :name="link.icon || 'i-lucide-mail'"
                    class="hero-section-icon"
                  />
                  <span class="hero-section-link-text">{{ link.text }}</span>
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
  --color-text: #d1d5db;
  --color-bg: #1d2129;
  --color-surface: #232833;

  color: var(--color-text);
  background: var(--color-bg);
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
}

/* Background Elements */
.#{$block}-bg {
  position: absolute;
  inset: 0;
  z-index: 1;
  pointer-events: none;

  &-blur {
    position: absolute;
    inset: -20%;
    background-image: url("/images/hero_image.jpeg");
    background-size: cover;
    background-position: center;
    background-repeat: no-repeat;
    opacity: 0;
    transition: opacity 0.8s ease-out;
    filter: blur(50px) brightness(0.4) saturate(0.6);
    transform: scale(1.1);

    &.loaded {
      opacity: 1;
    }
  }

  &-overlay {
    position: absolute;
    inset: 0;
    background: rgba(29, 33, 41, 0.15);
  }
}

/* Container */
.#{$block}-container {
  position: relative;
  z-index: 10;

  @media (min-width: 1200px) {
    margin-top: -5%;
  }
}

/* Grid Layout - Responsive */
.#{$block}-grid {
  display: grid;
  gap: 1.5rem;
  align-items: center;

  @media (min-width: 1024px) {
    grid-template-columns: 1fr 1fr;
    gap: 3rem;
  }
}

/* Content Column */
.#{$block}-content {
  max-width: 45rem;
  margin: 0 auto;
  text-align: center;

  @media (min-width: 1024px) {
    margin: 0;
    text-align: left;
  }
}

.#{$block}-badge {
  margin-bottom: 1rem;
  display: flex;
  justify-content: center;

  @media (min-width: 1024px) {
    justify-content: flex-start;
  }
}

.#{$block}-title {
  font-size: clamp(2.5rem, 8vw, 4rem);
  font-weight: 700;
  line-height: 1.1;
  color: var(--color-heading);
  margin: 0 0 1rem;
  text-shadow: 0 2px 8px rgba(0, 0, 0, 0.3);
  letter-spacing: -0.025em;

  @media (min-width: 1024px) {
    font-size: clamp(3rem, 4vw, 5rem);
    text-shadow: 0 4px 12px rgba(0, 0, 0, 0.4);
  }

  &-emphasis {
    color: var(--color-primary);
  }
}

.#{$block}-text {
  font-size: 1.125rem;
  line-height: 1.6;
  color: var(--color-text);
  font-weight: 500;
  margin-bottom: 1.5rem;
  text-shadow: 0 1px 1px rgba(0, 0, 0, 0.5);

  @media (min-width: 1024px) {
    font-size: 1.25rem;
    margin-bottom: 2rem;
  }
}

/* Image Column */
.#{$block}-image {
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

.#{$block}-portrait {
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

.#{$block}-img-slots {
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

.#{$block}-img-slot {
  position: absolute;
  width: 40%;
  height: 90%;
  overflow: hidden;
  border-radius: calc(var(--radius-default) * 4);
  box-shadow: 0 12px 35px rgba(0, 0, 0, 0.15);
  border: 1px solid rgba(255, 255, 255, 0.1);
  zoom: 0.3;

  @media (min-width: 1024px) {
    zoom: 0.385;
  }

  &--left {
    left: 10%;
    top: -20px;
    transform: rotate(10deg);
    z-index: 2;
  }

  &--right {
    right: 10%;
    bottom: -15%;
    transform: rotate(10deg);
    z-index: 1;
  }
}

.#{$block}-img {
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
.#{$block}-actions {
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

.#{$block}-tags {
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

.#{$block}-tag {
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

.#{$block}-buttons {
  display: flex;
  flex-wrap: wrap;
  gap: 0.75rem;
  justify-content: center;

  @media (min-width: 1024px) {
    justify-content: flex-start;
  }
}

.#{$block}-link {
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

.#{$block}-icon {
  flex-shrink: 0;
}

/* Accessibility */
@media (prefers-reduced-motion: reduce) {
  .#{$block}-bg-blur {
    transition: none !important;
  }
}
</style>
