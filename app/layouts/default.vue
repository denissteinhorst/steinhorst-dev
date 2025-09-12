<script setup lang="ts">
import '~/assets/scss/app.scss'

const colorMode = useColorMode()
const route = useRoute()

const ambientBackground = ref<HTMLElement | null>(null)

const showAmbient = computed(() => route.meta?.ambient !== false)

useScrollHashes()
useFocusHelper()

const updateAmbientBackground = (preference: string): void => {
  if (!ambientBackground.value) return

  if (preference === 'light') {
    ambientBackground.value.classList.add('ambient-background-light')
  } else {
    ambientBackground.value.classList.remove('ambient-background-light')
  }
}

onMounted(() => {
  updateAmbientBackground(colorMode.preference)
})

watch(() => colorMode.preference, updateAmbientBackground)
watch(
  () => ambientBackground.value,
  (element) => {
    if (element) updateAmbientBackground(colorMode.preference)
  },
)
</script>

<template>
  <UApp>
    <NuxtRouteAnnouncer />
    <div class="layout-root">
      <NavigationSection />
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
@import 'tailwindcss';
@import '@nuxt/ui';

.layout-root {
  min-height: 100dvh;
  display: flex;
  flex-direction: column;
  position: relative;
  isolation: isolate;
}

.layout-root > main {
  flex: 1 0 auto;
}

.ambient-background {
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  z-index: -1;
  pointer-events: none;
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

.ambient-background::before,
.ambient-background::after {
  content: '';
  position: absolute;
  inset: 0;
  pointer-events: none;
}

.ambient-background::before {
  background:
    radial-gradient(circle at 20% 35%, rgba(96, 140, 255, 0.12), transparent 60%),
    radial-gradient(circle at 78% 65%, rgba(255, 110, 150, 0.1), transparent 65%),
    radial-gradient(circle at 55% 80%, rgba(120, 255, 210, 0.08), transparent 55%),
    radial-gradient(circle at 35% 60%, rgba(255, 230, 140, 0.05), transparent 60%);
  filter: blur(60px) saturate(140%);
  mix-blend-mode: screen;
  animation: ambient-shift-1 110s linear infinite alternate;
  opacity: 0.65;
}

.ambient-background::after {
  background:
    radial-gradient(circle at 60% 40%, rgba(255, 255, 255, 0.04), transparent 70%),
    radial-gradient(circle at 30% 75%, rgba(180, 220, 255, 0.035), transparent 75%),
    repeating-linear-gradient(45deg, rgba(255, 255, 255, 0.015) 0 4px, rgba(0, 0, 0, 0) 4px 8px);
  background-blend-mode: overlay, overlay, normal;
  filter: blur(40px) contrast(110%) brightness(105%);
  mix-blend-mode: plus-lighter;
  opacity: 0.35;
  animation: ambient-shift-2 300s ease-in-out infinite alternate;
}

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
  background:
    radial-gradient(circle at 20% 35%, rgba(255, 200, 140, 0.12), transparent 60%),
    radial-gradient(circle at 78% 65%, rgba(255, 150, 110, 0.1), transparent 65%),
    radial-gradient(circle at 55% 80%, rgba(255, 255, 210, 0.08), transparent 55%),
    radial-gradient(circle at 35% 60%, rgba(255, 255, 255, 0.05), transparent 60%);
  filter: blur(60px) saturate(140%);
  mix-blend-mode: screen;
  animation: ambient-shift-1 110s linear infinite alternate;
  opacity: 0.65;
}

.ambient-background-light::after {
  background:
    radial-gradient(circle at 60% 40%, rgba(255, 255, 255, 0.04), transparent 70%),
    radial-gradient(circle at 30% 75%, rgba(255, 255, 255, 0.035), transparent 75%),
    repeating-linear-gradient(45deg, rgba(255, 255, 255, 0.015) 0 4px, rgba(0, 0, 0, 0) 4px 8px);
  background-blend-mode: overlay, overlay, normal;
  filter: blur(40px) contrast(110%) brightness(105%);
  mix-blend-mode: plus-lighter;
  opacity: 0.35;
  animation: ambient-shift-2 300s ease-in-out infinite alternate;
}

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

@media (prefers-reduced-motion: reduce) {
  .ambient-background::before,
  .ambient-background::after {
    animation: none;
  }
}

@media (max-width: 640px) {
  .ambient-background::before {
    filter: blur(48px);
  }
  .ambient-background::after {
    filter: blur(32px);
  }
}
</style>
