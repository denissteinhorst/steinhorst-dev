<script setup lang="ts">
import "~/assets/scss/app.scss";

// useColorMode is auto-imported by @nuxtjs/color-mode module
const colorMode = useColorMode();
const route = useRoute();
const ambientBackground = ref<HTMLElement | null>(null);

// Show ambient background on all routes except those that explicitly disable it via page meta
const showAmbient = computed<boolean>(() => route.meta?.ambient !== false);

// Keep URL hash in sync with the section ≥50% in view (hero keeps path without hash)
useScrollHashes();

onMounted(() => {
  // If the element exists on initial mount, apply the appropriate mode class
  if (ambientBackground.value) {
    updateAmbientBackground(colorMode.preference);
  }
});

watch(
  () => colorMode.preference,
  (newPreference) => {
    updateAmbientBackground(newPreference);
  }
);

// When the ambient background element is (re)mounted due to route changes, sync its mode class
watch(
  () => ambientBackground.value,
  (el) => {
    if (el) updateAmbientBackground(colorMode.preference);
  }
);

function updateAmbientBackground(preference: string) {
  if (preference === "light") {
    ambientBackground.value?.classList.add("ambient-background-light");
  } else {
    ambientBackground.value?.classList.remove("ambient-background-light");
  }
}

const { initialize } = useHotjar();

onMounted(() => {
  initialize();
});
</script>

<template>
  <UApp>
    <NuxtRouteAnnouncer />
    <div class="layout-root">
      <NavigationSection />
      <!-- Ambient background (starts after hero/first viewport) -->
      <div
        v-if="showAmbient"
        ref="ambientBackground"
        class="ambient-background"
        aria-hidden="true"
      ></div>
      <main id="main-content" tabindex="-1">
        <NuxtPage />
      </main>
      <ScrollCompanion />
      <FooterSection />
    </div>
  </UApp>
</template>

<style>
@import "tailwindcss";
@import "@nuxt/ui";

/* Sticky footer layout */
.layout-root {
  min-height: 100vh;
  min-height: 100dvh; /* modern viewport units for mobile */
  display: flex;
  flex-direction: column;
  position: relative;
  /* Ensure stacking context so negative z-index child stays behind */
  isolation: isolate;
}

.layout-root > main {
  flex: 1 0 auto; /* take remaining space so footer sits at bottom */
}

/* Ambient background effect */
/* Ambient background now spans whole page; we use a vertical gradient so the area behind the hero stays softly translucent
   and only solidifies further down, removing the hard cut after the hero. */
.ambient-background {
  position: absolute;
  top: 0; /* cover from very top to allow a gradual blend */
  left: 0;
  right: 0;
  bottom: 0;
  z-index: -1;
  pointer-events: none;
  /* Layer 1: vertical luminance ramp (transparent near top so hero's own gradients show through)
     Stops chosen so by ~55vh it begins darkening, reaching full #181818 after ~110vh. Adjust vh stops to taste. */
  background: linear-gradient(
    to bottom,
    rgba(24, 24, 24, 0) 0%,
    rgba(24, 24, 24, 0.15) 25vh,
    rgba(24, 24, 24, 0.35) 45vh,
    rgba(24, 24, 24, 0.6) 65vh,
    rgba(24, 24, 24, 0.8) 90vh,
    #181818 120vh
  );
  overflow: hidden;
  transition: background 0.5s ease-in-out;
}

/* Use pseudo elements so we can layer glows + subtle noise separately for compositing control */
.ambient-background::before,
.ambient-background::after {
  content: "";
  position: absolute;
  inset: 0;
  pointer-events: none;
}

/* Soft multi‑glow layer (very low opacity). Large blurred radial gradients animated slowly. */
.ambient-background::before {
  /* Multiple radial gradients with transparent falloff */
  background: radial-gradient(
      circle at 20% 35%,
      rgba(96, 140, 255, 0.12),
      transparent 60%
    ),
    radial-gradient(
      circle at 78% 65%,
      rgba(255, 110, 150, 0.1),
      transparent 65%
    ),
    radial-gradient(
      circle at 55% 80%,
      rgba(120, 255, 210, 0.08),
      transparent 55%
    ),
    radial-gradient(
      circle at 35% 60%,
      rgba(255, 230, 140, 0.05),
      transparent 60%
    );
  filter: blur(60px) saturate(140%);
  mix-blend-mode: screen; /* Keeps it subtle over dark base */
  animation: ambient-shift-1 110s linear infinite alternate;
  opacity: 0.65;
}

/* Subtle secondary motion / parallax using another gentle gradient veil + dither noise */
.ambient-background::after {
  background: radial-gradient(
      circle at 60% 40%,
      rgba(255, 255, 255, 0.04),
      transparent 70%
    ),
    radial-gradient(
      circle at 30% 75%,
      rgba(180, 220, 255, 0.035),
      transparent 75%
    ),
    repeating-linear-gradient(
      45deg,
      rgba(255, 255, 255, 0.015) 0 4px,
      rgba(0, 0, 0, 0) 4px 8px
    );
  background-blend-mode: overlay, overlay, normal;
  filter: blur(40px) contrast(110%) brightness(105%);
  mix-blend-mode: plus-lighter;
  opacity: 0.35;
  animation: ambient-shift-2 300s ease-in-out infinite alternate;
}

/* Light mode variant of the ambient background */
.ambient-background-light {
  background: linear-gradient(
    to bottom,
    rgba(255, 255, 255, 0) 0%,
    rgba(255, 255, 255, 0.15) 25vh,
    rgba(255, 255, 255, 0.35) 45vh,
    rgba(255, 255, 255, 0.6) 65vh,
    rgba(255, 255, 255, 0.8) 90vh,
    #ffffff 120vh
  );
  transition: background 0.5s ease-in-out;
}

.ambient-background-light::before {
  background: radial-gradient(
      circle at 20% 35%,
      rgba(255, 200, 140, 0.12),
      transparent 60%
    ),
    radial-gradient(
      circle at 78% 65%,
      rgba(255, 150, 110, 0.1),
      transparent 65%
    ),
    radial-gradient(
      circle at 55% 80%,
      rgba(255, 255, 210, 0.08),
      transparent 55%
    ),
    radial-gradient(
      circle at 35% 60%,
      rgba(255, 255, 255, 0.05),
      transparent 60%
    );
  filter: blur(60px) saturate(140%);
  mix-blend-mode: screen;
  animation: ambient-shift-1 110s linear infinite alternate;
  opacity: 0.65;
}

.ambient-background-light::after {
  background: radial-gradient(
      circle at 60% 40%,
      rgba(255, 255, 255, 0.04),
      transparent 70%
    ),
    radial-gradient(
      circle at 30% 75%,
      rgba(255, 255, 255, 0.035),
      transparent 75%
    ),
    repeating-linear-gradient(
      45deg,
      rgba(255, 255, 255, 0.015) 0 4px,
      rgba(0, 0, 0, 0) 4px 8px
    );
  background-blend-mode: overlay, overlay, normal;
  filter: blur(40px) contrast(110%) brightness(105%);
  mix-blend-mode: plus-lighter;
  opacity: 0.35;
  animation: ambient-shift-2 300s ease-in-out infinite alternate;
}

/* Keyframes: translate backgrounds subtly, no large movements to avoid distraction */
@keyframes ambient-shift-1 {
  0% {
    transform: translate3d(0, 0, 0) scale(1);
  }
  50% {
    transform: translate3d(2%, -2%, 0) scale(1.03);
  }
  100% {
    transform: translate3d(-3%, 3%, 0) scale(1.05);
  }
}

@keyframes ambient-shift-2 {
  0% {
    transform: translate3d(0, 0, 0) scale(1);
  }
  100% {
    transform: translate3d(-4%, 2%, 0) scale(1.04);
  }
}

/* Reduced motion preference: keep static glows without animation */
@media (prefers-reduced-motion: reduce) {
  .ambient-background::before,
  .ambient-background::after {
    animation: none;
  }
}

/* Responsive tweaks (optional) - on very small screens reduce blur radius to save resources */
@media (max-width: 640px) {
  .ambient-background::before {
    filter: blur(48px);
  }
  .ambient-background::after {
    filter: blur(32px);
  }
}

/* ------------------------------------------------------------ */
/* In‑page anchor smooth scrolling + offset for sticky header   */
/* ------------------------------------------------------------ */
/* Enable native smooth scrolling for hash / programmatic scroll */
html {
  scroll-behavior: smooth;
}

/* Respect reduced motion preference */
@media (prefers-reduced-motion: reduce) {
  html {
    scroll-behavior: auto;
  }
}

/* Provide top offset so target sections aren't hidden under the sticky header */
/* Targets any section with an id (our main content blocks) */
section[id] {
  scroll-margin-top: 5.5rem; /* ~88px for mobile (header ~56px + breathing room) */
}

@media (min-width: 1024px) {
  /* lg breakpoint (Tailwind default) */
  section[id] {
    scroll-margin-top: 6.5rem; /* a bit more room on large screens */
  }
}
</style>
