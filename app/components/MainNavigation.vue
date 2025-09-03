<script setup lang="ts">
import type { NavigationElement, NavigationResponse } from "~/types/types";

const route = useRoute();
const router = useRouter();
const { cmsRequest } = useStrapi();

// Track actual browser hash for active state detection
const currentHash = ref("");

// Update hash when location changes (including replaceState from useScrollHashes)
const updateCurrentHash = () => {
  if (import.meta.client) {
    currentHash.value = window.location.hash;
  }
};

// Listen for hash changes and poll for URL changes (to catch replaceState)
onMounted(() => {
  if (import.meta.client) {
    updateCurrentHash();
    window.addEventListener("hashchange", updateCurrentHash);

    // Poll for hash changes to catch replaceState from useScrollHashes
    const hashWatcher = setInterval(() => {
      const newHash = window.location.hash;
      if (newHash !== currentHash.value) {
        currentHash.value = newHash;
      }
    }, 100);

    onUnmounted(() => {
      window.removeEventListener("hashchange", updateCurrentHash);
      clearInterval(hashWatcher);
    });
  }
});

const { data, pending, error } = await useLazyAsyncData<NavigationResponse>(
  "nav",
  () =>
    cmsRequest<NavigationResponse>("navigation", [
      "brandName",
      "navigationElements",
      "specialButton",
      "specialLink",
      "brandLink",
    ])
);

const isMobileMenuOpen = ref(false);
const menuButtonRef = ref<HTMLElement | null>(null);
const showSkipLink = ref(true);

const brandName = computed(() => data.value?.brandName ?? "");
const brandLink = computed(() => data.value?.brandLink ?? "/");

const specialName = computed(() => data.value?.specialButton ?? "");
const specialLink = computed(() => data.value?.specialLink ?? "/");

const mainLinks = computed<NavigationElement[]>(
  () => data.value?.navigationElements ?? []
);

const brandNameParts = computed(() => {
  const [main = "", secondary = ""] = (brandName.value || "").split(".");
  return { main, secondary };
});

const isActive = (to = ""): boolean => {
  if (!to) return false;
  if (to.startsWith("#")) return currentHash.value === to;
  const [path, hash] = to.split("#");
  if (hash) return route.path === path && currentHash.value === `#${hash}`;
  return route.path === path;
};

const skipToHero = () => {
  const el = document.getElementById("hero-heading");
  if (!el) return;
  el.scrollIntoView({ behavior: "smooth", block: "start" });
  (el as HTMLElement).focus?.();
};

const updateMobileMenu = (val: boolean) => (isMobileMenuOpen.value = val);

const closeMobileMenu = () => (isMobileMenuOpen.value = false);

watch(isMobileMenuOpen, (open) => {
  if (!open) {
    const el =
      menuButtonRef.value instanceof HTMLElement
        ? menuButtonRef.value
        : document.querySelector(".main-navigation__menu-button");
    (el as HTMLElement | null)?.focus?.();
  }
});

// Handle brand click: if already on home route, just scroll to top/hero and clear hash (no navigation)
const onBrandClick = (e: MouseEvent) => {
  const targetPath = brandLink.value || "/";
  if (route.path === targetPath) {
    e.preventDefault();
    // Clear hash without causing scroll jump
    if (import.meta.client) {
      const base = `${window.location.pathname}${window.location.search}`;
      try {
        window.history.replaceState(window.history.state, "", base);
      } catch {
        /* noop: best-effort to clear hash without navigation */
      }
    }
    // Smooth scroll to hero heading if present, else top
    const el =
      document.getElementById("hero-heading") ||
      document.getElementById("hero");
    if (el) {
      el.scrollIntoView({ behavior: "smooth", block: "start" });
      (el as HTMLElement).focus?.();
    } else {
      window.scrollTo({ top: 0, behavior: "smooth" });
    }
    return;
  }
  // Navigate normally if not on home
  e.preventDefault();
  router.push(targetPath);
};
</script>

<template>
  <div class="main-navigation" role="navigation">
    <!-- Skip link (WCAG) -->
    <a
      v-if="showSkipLink"
      href="#hero-heading"
      class="main-navigation__skip-link"
      @click.prevent="skipToHero"
      @keydown.space.prevent="skipToHero"
    >
      Zum Inhalt springen
    </a>

    <!-- Gradient separator (bottom) -->
    <div aria-hidden="true" class="main-navigation__separator"></div>

    <UContainer class="main-navigation__container">
      <div class="main-navigation__inner">
        <div class="main-navigation__brand">
          <!-- Brand / Logo -->
          <slot name="brand">
            <NuxtLink
              :to="brandLink"
              class="main-navigation__brand-link"
              @click="onBrandClick"
            >
              {{ brandNameParts.main
              }}<span class="text-primary"
                >.{{ brandNameParts.secondary }}</span
              >
            </NuxtLink>
          </slot>
        </div>

        <!-- Desktop navigation -->
        <nav aria-label="Primäre Navigation" class="main-navigation__nav">
          <ul class="main-navigation__list">
            <li
              v-for="link in mainLinks"
              :key="link.link"
              class="main-navigation__item"
            >
              <NuxtLink
                :to="link.link"
                :aria-label="link.title"
                :aria-current="isActive(link.link) ? 'page' : undefined"
                class="main-navigation__link"
                :data-active="isActive(link.link) ? 'true' : 'false'"
                @keydown.space.prevent="router.push(link.link)"
              >
                {{ link.title }}
              </NuxtLink>
            </li>

            <li class="main-navigation__extra">
              <ai-summary :title="specialName" :target="specialLink" />
            </li>
          </ul>
        </nav>

        <!-- Mobile trigger and panel -->
        <div class="main-navigation__mobile" aria-label="Mobile navigation">
          <UButton
            ref="menuButtonRef"
            variant="ghost"
            square
            aria-label="Menü öffnen"
            :aria-expanded="isMobileMenuOpen.toString()"
            aria-controls="mobile-primary-navigation"
            class="main-navigation__menu-button"
            @click="isMobileMenuOpen = true"
          >
            <UIcon name="i-lucide-menu" class="main-navigation__menu-icon" />
            <span class="visually-hidden">Menü öffnen</span>
          </UButton>

          <USlideover
            id="mobile-primary-navigation"
            v-model:open="isMobileMenuOpen"
            :title="brandName || 'Navigation'"
            description="Navigation"
            class="main-navigation__slideover"
            @close="closeMobileMenu"
            @update:open="updateMobileMenu"
            @update:model-value="updateMobileMenu"
          >
            <template #body>
              <div class="main-navigation__mobile-wrapper">
                <nav
                  aria-label="Mobile Navigation"
                  class="main-navigation__mobile-nav"
                >
                  <ul class="main-navigation__mobile-list">
                    <li
                      v-for="link in mainLinks"
                      :key="link.link"
                      class="main-navigation__mobile-item"
                    >
                      <NuxtLink
                        :to="link.link"
                        :aria-label="link.title"
                        :aria-current="isActive(link.link) ? 'page' : undefined"
                        class="main-navigation__mobile-link"
                        :data-active="isActive(link.link) ? 'true' : 'false'"
                        @click="isMobileMenuOpen = false"
                        @keydown.space.prevent="
                          (isMobileMenuOpen = false), router.push(link.link)
                        "
                      >
                        {{ link.title }}
                      </NuxtLink>
                    </li>

                    <!-- Mobile: Kontakt -->
                    <li class="main-navigation__mobile-item">
                      <NuxtLink
                        to="/#contact"
                        aria-label="Kontakt"
                        class="main-navigation__mobile-link"
                        @click="isMobileMenuOpen = false"
                        @keydown.space.prevent="
                          (isMobileMenuOpen = false), router.push('/#contact')
                        "
                      >
                        Kontakt
                      </NuxtLink>
                    </li>

                    <!-- Mobile: Extra slot (e.g., AI Summary) -->
                    <li class="main-navigation__mobile-extra">
                      <ai-summary :title="specialName" :target="specialLink" />
                    </li>
                  </ul>
                </nav>
              </div>
            </template>
          </USlideover>
        </div>
      </div>
    </UContainer>

    <div v-if="pending || error" class="main-navigation__fallback">
      <span v-if="pending">Navigation wird geladen…</span>
      <span v-else>Navigation konnte nicht geladen werden.</span>
    </div>
  </div>
</template>

<style scoped lang="scss">
$block: "main-navigation";

.#{$block} {
  position: sticky;
  top: 0;
  z-index: 50;
  color: #fff;
  background: rgba(0, 0, 0, 0.9);

  -webkit-backdrop-filter: blur(14px) saturate(150%);
  backdrop-filter: blur(14px) saturate(150%);
  box-shadow: 0 0 15px 5px rgba(0, 0, 0, 0.5);

  @supports (backdrop-filter: blur(14px)) {
    background: rgba(0, 0, 0, 0.75);
  }

  @media (prefers-color-scheme: dark) {
    background: rgba(0, 0, 0, 0.6);

    @supports (backdrop-filter: blur(14px)) {
      background: rgba(0, 0, 0, 0.8);
    }
  }

  &::before {
    content: "";
    position: absolute;
    inset: 0;
    z-index: -10;
    background: linear-gradient(
      to bottom,
      rgba(255, 255, 255, 0.1),
      rgba(255, 255, 255, 0) 70%
    );
  }

  &__separator {
    position: absolute;
    inset-inline: 0;
    bottom: -1px;
    height: 1px;
    pointer-events: none;
    background: linear-gradient(
      90deg,
      rgba(0, 0, 0, 0) 0%,
      var(--color-primary) 50%,
      rgba(0, 0, 0, 0) 100%
    );
    filter: drop-shadow(0 0 6px var(--color-secondary, #90a1b9));
  }

  &__container {
    width: 100%;
  }

  &__inner {
    display: flex;
    align-items: center;
    gap: 16px;
    height: 56px;
  }

  &__skip-link {
    position: absolute;
    top: 0;
    left: 0;
    z-index: 60;
    transform: translateY(-120%);
    background: #000;
    color: #fff;
    padding: 12px 16px;
    border: 2px solid var(--color-secondary, #90a1b9);
    border-radius: 0 0 8px 0;
    font-weight: 600;
    text-decoration: none;
    transition: transform 0.25s ease;

    &:focus {
      transform: translateY(0);
      outline: none;
    }
  }

  &__brand {
    display: flex;
    align-items: center;
  }

  &__brand-link {
    font-weight: 600;
    font-size: 1.125rem;
    line-height: 1;
    letter-spacing: -0.015em;
    outline: none;
    border-radius: 0.125rem;

    &:focus-visible {
      outline: 2px solid var(--color-primary, #a78bfa);
      outline-offset: 2px;
    }

    @media (min-width: 768px) {
      font-size: 1.15rem;
    }

    span {
      &.font-bold {
        font-weight: 700;
      }

      &.text-primary {
        color: var(--color-primary, #90a1b9);
      }
    }
  }

  /* Desktop nav */
  &__nav {
    margin-left: auto;
    display: none;
  }

  &__list {
    list-style: none;
    display: flex;
    align-items: center;
    gap: 6px;
    margin: 0;
    padding: 0;
  }

  &__item {
    display: flex;
    align-items: center;
  }

  &__link {
    display: inline-block;
    padding: 0.375rem 0.75rem;
    font-size: 0.875rem;
    font-weight: 500;
    letter-spacing: 0.05em;
    color: #f8fafc;
    text-decoration: none;
    transition: color 0.2s ease;

    &:hover {
      color: var(--color-secondary, #90a1b9);
    }

    &[data-active="true"] {
      color: var(--color-primary, #a78bfa);
    }
  }

  &__extra {
    display: flex;
    align-items: center;
    padding-left: 6px;
    border-left: 1px solid rgba(148, 163, 184, 0.4);
  }

  /* Mobile */
  &__mobile {
    margin-left: auto;
    display: flex;
    align-items: center;
  }

  &__menu-button {
    border: 0;
  }

  &__menu-icon {
    width: 20px;
    height: 20px;
  }

  &__slideover :deep(.ui-slideover-panel) {
    z-index: 1101;
    height: 100vh;
    height: 100svh;
    height: 100dvh;
    min-height: 100dvh;
    display: flex;
    flex-direction: column;
    padding-bottom: env(safe-area-inset-bottom, 0);
  }

  &__slideover :deep(.ui-slideover-overlay) {
    z-index: 1100;
  }

  &__slideover :deep(.ui-slideover-body) {
    flex: 1;
    display: flex;
    flex-direction: column;
    padding: 0;
  }

  &__mobile-wrapper {
    flex: 1;
    display: flex;
    flex-direction: column;
    overflow: hidden;
  }

  &__mobile-nav {
    padding-top: env(safe-area-inset-top, 0);
  }

  &__mobile-list {
    list-style: none;
    margin: 0;
    padding: 0;
    display: flex;
    flex-direction: column;
  }

  &__mobile-item {
    border-bottom: 1px solid rgba(148, 163, 184, 0.4);
  }

  &__mobile-link {
    position: relative;
    display: block;
    text-align: center;
    padding: 1rem 0.75rem;
    font-size: 0.95rem;
    font-weight: 700;
    letter-spacing: 0.1px;
    color: inherit;
    text-decoration: none;
    border-radius: 8px;
    line-height: 1.2;

    &:hover {
      color: var(--color-primary, #9861ff);
    }

    &[data-active="true"] {
      color: var(--color-secondary, #90a1b9);
    }

    &::after {
      content: "";
      position: absolute;
      inset: 0;
      min-height: 44px;
    }
  }

  &__mobile-extra {
    padding-top: 8px;
  }

  @media (min-width: 1024px) {
    &__nav {
      display: block;
    }

    &__mobile {
      display: none;
    }
  }
}
</style>
