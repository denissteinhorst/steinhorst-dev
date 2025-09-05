<script setup lang="ts">
import type { NavigationElement, NavigationResponse } from "~/types/types";

const route = useRoute();
const router = useRouter();
const { cmsRequest, currentLocaleString } = useStrapi();

const { y } = useWindowScroll();
const isScrolled = computed(() => y.value > 2);
const currentHash = ref("");

const updateCurrentHash = () => {
  if (import.meta.client) {
    currentHash.value = window.location.hash;
  }
};

onMounted(() => {
  if (import.meta.client) {
    updateCurrentHash();
    window.addEventListener("hashchange", updateCurrentHash, { passive: true });

    const originalReplaceState = window.history.replaceState.bind(
      window.history
    ) as (data: unknown, title: string, url?: string | URL | null) => void;
    const handleReplace = () => updateCurrentHash();

    try {
      window.history.replaceState = ((
        data: unknown,
        title: string,
        url?: string | URL | null
      ) => {
        originalReplaceState(data, title, url);
        handleReplace();
      }) as History["replaceState"];
    } catch {
      // Fallback if patching fails
    }

    onUnmounted(() => {
      window.removeEventListener("hashchange", updateCurrentHash);
      try {
        window.history.replaceState = originalReplaceState;
      } catch {
        // Ignore restoration errors
      }
    });
  }
});

const { data, pending, error } = await useLazyAsyncData<NavigationResponse>(
  () => `nav-${currentLocaleString.value}`,
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
const isDesktopDropdownOpen = ref(false);
const menuButtonRef = ref<HTMLElement | null>(null);
const desktopDropdownRef = ref<HTMLElement | null>(null);
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

const updateMobileMenu = (isOpen: boolean): boolean =>
  (isMobileMenuOpen.value = isOpen);
const closeMobileMenu = (): boolean => (isMobileMenuOpen.value = false);

let dropdownTimeout: NodeJS.Timeout | null = null;

const handleDesktopDropdownEnter = () => {
  if (!isScrolled.value) {
    if (dropdownTimeout) {
      clearTimeout(dropdownTimeout);
      dropdownTimeout = null;
    }
    isDesktopDropdownOpen.value = true;
  }
};

const handleDesktopDropdownLeave = () => {
  dropdownTimeout = setTimeout(() => {
    isDesktopDropdownOpen.value = false;
  }, 150);
};

const handleClickOutside = (event: Event) => {
  if (
    desktopDropdownRef.value &&
    !desktopDropdownRef.value.contains(event.target as Node)
  ) {
    isDesktopDropdownOpen.value = false;
  }
};

onMounted(() => {
  if (import.meta.client) {
    document.addEventListener("click", handleClickOutside);

    onUnmounted(() => {
      document.removeEventListener("click", handleClickOutside);
      if (dropdownTimeout) {
        clearTimeout(dropdownTimeout);
      }
    });
  }
});

watch(isMobileMenuOpen, (isOpen: boolean): void => {
  if (!isOpen) {
    const element =
      menuButtonRef.value instanceof HTMLElement
        ? menuButtonRef.value
        : document.querySelector(".navigation-section__menu-button");
    (element as HTMLElement | null)?.focus?.();
  }
});

const onBrandClick = (e: MouseEvent) => {
  const targetPath = brandLink.value || "/";
  if (route.path === targetPath) {
    e.preventDefault();
    if (import.meta.client) {
      const base = `${window.location.pathname}${window.location.search}`;
      try {
        window.history.replaceState(window.history.state, "", base);
      } catch {
        // Fallback if replaceState fails
      }
    }
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
  e.preventDefault();
  router.push(targetPath);
};
</script>

<template>
  <div
    class="navigation-section"
    :class="{ 'navigation-section--scrolled': isScrolled }"
    role="navigation"
  >
    <a
      v-if="showSkipLink"
      href="#hero-heading"
      class="navigation-section__skip-link"
      @click.prevent="skipToHero"
      @keydown.space.prevent="skipToHero"
    >
      Zum Inhalt springen
    </a>

    <div aria-hidden="true" class="navigation-section__separator"></div>

    <UContainer class="navigation-section__container">
      <div class="navigation-section__inner">
        <div class="navigation-section__brand">
          <slot name="brand">
            <NuxtLink
              :to="brandLink"
              class="navigation-section__brand-link"
              @click="onBrandClick"
            >
              {{ brandNameParts.main
              }}<span class="text-primary"
                >.{{ brandNameParts.secondary }}</span
              >
            </NuxtLink>
          </slot>
        </div>

        <nav aria-label="Primäre Navigation" class="navigation-section__nav">
          <ul class="navigation-section__list">
            <li
              v-for="link in mainLinks"
              :key="link.link"
              class="navigation-section__item navigation-section__nav-item"
            >
              <NuxtLink
                :to="link.link"
                :aria-label="link.title"
                :aria-current="isActive(link.link) ? 'page' : undefined"
                class="navigation-section__link"
                :data-active="isActive(link.link) ? 'true' : 'false'"
                @keydown.space.prevent="router.push(link.link)"
              >
                {{ link.title }}
              </NuxtLink>
            </li>

            <li class="navigation-section__actions">
              <div
                class="navigation-section__action-item navigation-section__burger-item"
              >
                <div
                  ref="desktopDropdownRef"
                  class="navigation-section__desktop-burger"
                  @mouseenter="handleDesktopDropdownEnter"
                  @mouseleave="handleDesktopDropdownLeave"
                >
                  <button
                    class="navigation-section__desktop-burger-button"
                    :aria-expanded="isDesktopDropdownOpen"
                    aria-label="Navigation anzeigen"
                  >
                    <UIcon
                      name="i-lucide-menu"
                      class="navigation-section__burger-icon"
                      :class="{
                        'navigation-section__burger-icon--hovering':
                          isDesktopDropdownOpen,
                      }"
                    />
                    <UIcon
                      name="i-lucide-chevron-down"
                      class="navigation-section__chevron-icon"
                      :class="{
                        'navigation-section__chevron-icon--hovering':
                          isDesktopDropdownOpen,
                      }"
                    />
                  </button>

                  <div
                    v-if="isDesktopDropdownOpen && !isScrolled"
                    class="navigation-section__desktop-dropdown"
                    role="menu"
                  >
                    <NuxtLink
                      v-for="link in mainLinks"
                      :key="link.link"
                      :to="link.link"
                      :aria-label="link.title"
                      :aria-current="isActive(link.link) ? 'page' : undefined"
                      class="navigation-section__dropdown-link"
                      :data-active="isActive(link.link) ? 'true' : 'false'"
                      role="menuitem"
                      @click="isDesktopDropdownOpen = false"
                    >
                      {{ link.title }}
                    </NuxtLink>
                  </div>
                </div>
              </div>

              <div class="navigation-section__action-item">
                <AiSummary
                  key="desktop-ai-summary"
                  :title="specialName"
                  :target="specialLink"
                />
              </div>

              <div class="navigation-section__action-item">
                <LanguageSelector key="desktop-language-selector" />
              </div>
            </li>
          </ul>
        </nav>

        <div class="navigation-section__mobile" aria-label="Mobile navigation">
          <div class="navigation-section__mobile-language">
            <LanguageSelector />
          </div>

          <UButton
            ref="menuButtonRef"
            variant="ghost"
            square
            aria-label="Menü öffnen"
            :aria-expanded="isMobileMenuOpen.toString()"
            aria-controls="mobile-primary-navigation"
            class="navigation-section__menu-button"
            @click="isMobileMenuOpen = true"
          >
            <UIcon name="i-lucide-menu" class="navigation-section__menu-icon" />
            <span class="visually-hidden">Menü öffnen</span>
          </UButton>

          <USlideover
            id="mobile-primary-navigation"
            v-model:open="isMobileMenuOpen"
            :title="brandName || 'Navigation'"
            description="Navigation"
            class="navigation-section__slideover"
            @close="closeMobileMenu"
            @update:open="updateMobileMenu"
            @update:model-value="updateMobileMenu"
          >
            <template #body>
              <div class="navigation-section__mobile-wrapper">
                <nav
                  aria-label="Mobile Navigation"
                  class="navigation-section__mobile-nav"
                >
                  <ul class="navigation-section__mobile-list">
                    <li
                      v-for="link in mainLinks"
                      :key="link.link"
                      class="navigation-section__mobile-item"
                    >
                      <NuxtLink
                        :to="link.link"
                        :aria-label="link.title"
                        :aria-current="isActive(link.link) ? 'page' : undefined"
                        class="navigation-section__mobile-link"
                        :data-active="isActive(link.link) ? 'true' : 'false'"
                        @click="isMobileMenuOpen = false"
                        @keydown.space.prevent="
                          (isMobileMenuOpen = false), router.push(link.link)
                        "
                      >
                        {{ link.title }}
                      </NuxtLink>
                    </li>

                    <li class="navigation-section__mobile-item">
                      <NuxtLink
                        to="#contact"
                        aria-label="Kontakt"
                        class="navigation-section__mobile-link"
                        @click="isMobileMenuOpen = false"
                        @keydown.space.prevent="
                          (isMobileMenuOpen = false), router.push('#contact')
                        "
                      >
                        Kontakt
                      </NuxtLink>
                    </li>

                    <li class="navigation-section__mobile-extra">
                      <AiSummary :title="specialName" :target="specialLink" />
                    </li>
                  </ul>
                </nav>
              </div>
            </template>
          </USlideover>
        </div>
      </div>
    </UContainer>

    <div v-if="pending || error" class="navigation-section__fallback">
      <span v-if="pending">Navigation wird geladen…</span>
      <span v-else>Navigation konnte nicht geladen werden.</span>
    </div>
  </div>
</template>

<style scoped lang="scss">
$block: "navigation-section";

.#{$block} {
  position: sticky;
  top: 0;
  z-index: 50;
  color: #fff;
  background: transparent;
  box-shadow: none;
  backdrop-filter: none;
  transition: background-color 0.25s cubic-bezier(0.4, 0, 0.2, 1),
    box-shadow 0.25s cubic-bezier(0.4, 0, 0.2, 1);
  transform: translateZ(0);
  will-change: background-color, box-shadow;

  &--scrolled {
    background: rgba(0, 0, 0, 0.65);
    box-shadow: 0 4px 24px -2px rgba(0, 0, 0, 0.15),
      0 0 0 1px rgba(255, 255, 255, 0.05);
    backdrop-filter: saturate(180%) blur(20px);

    @media (prefers-color-scheme: dark) {
      background: rgba(0, 0, 0, 0.65);
    }

    .#{$block}__separator {
      opacity: 1;
    }
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
    opacity: 0;
    transition: opacity 0.25s cubic-bezier(0.4, 0, 0.2, 1);
    transform: translateZ(0);
    will-change: opacity;
  }

  &__container {
    width: 100%;
  }

  &__inner {
    display: flex;
    align-items: center;
    gap: 16px;
    height: 72px;
    transform: translateZ(0);
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
    flex: 0 0 auto;
  }

  &__brand-link {
    font-weight: 700;
    font-size: 1.125rem;
    line-height: 1;
    letter-spacing: -0.025em;
    outline: none;
    border-radius: 0.375rem;
    padding: 0.25rem 0.5rem;
    margin: -0.25rem -0.5rem;
    white-space: nowrap;
    transition: color 0.2s cubic-bezier(0.4, 0, 0.2, 1),
      font-size 0.25s cubic-bezier(0.4, 0, 0.2, 1);
    transform: translateZ(0);
    text-shadow: 0 2px 8px rgba(0, 0, 0, 0.3);

    &:focus-visible {
      outline: 2px solid var(--color-primary, #a78bfa);
      outline-offset: 2px;
    }

    &:hover {
      color: rgba(255, 255, 255, 0.8);
    }

    @media (min-width: 768px) {
      font-size: 1.15rem;
    }

    .#{$block}--scrolled & {
      font-size: 1.05rem;

      @media (min-width: 768px) {
        font-size: 1.075rem;
      }
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

  &__nav {
    margin-left: auto;
    display: none;
    flex: 1 1 auto;
    min-width: 0;
  }

  &__desktop-burger {
    position: relative;
    display: flex;
    align-items: center;
  }

  &__burger-item {
    display: flex;
    align-items: center;
    transition: transform 0.4s cubic-bezier(0.4, 0, 0.2, 1),
      opacity 0.4s cubic-bezier(0.4, 0, 0.2, 1);
    transform: translateX(0) translateZ(0);
    opacity: 1;
    width: auto;
    overflow: visible;
    will-change: transform, opacity;

    .#{$block}--scrolled & {
      transform: translateX(-36px) translateZ(0);
      opacity: 0;
      pointer-events: none;
      width: 0;
      overflow: hidden;
      margin: 0;
      padding: 0;
    }
  }

  &__desktop-burger-button {
    position: relative;
    display: flex;
    align-items: center;
    justify-content: center;
    padding: 0.5rem 0.875rem;
    background: transparent;
    border: none;
    color: rgba(248, 250, 252, 0.9);
    cursor: pointer;
    border-radius: 0.375rem;
    transition: color 0.2s cubic-bezier(0.4, 0, 0.2, 1);
    text-shadow: 0 1px 4px rgba(0, 0, 0, 0.3);
    transform: translateZ(0);

    @media (max-width: 1200px) {
      margin-right: 4px;
    }

    &:hover {
      color: #fff;
    }

    &:focus-visible {
      outline: 2px solid var(--color-primary, #a78bfa);
      outline-offset: 2px;
    }
  }

  &__burger-icon,
  &__chevron-icon {
    width: 20px;
    height: 20px;
    position: absolute;
    transition: opacity 0.3s cubic-bezier(0.4, 0, 0.2, 1),
      transform 0.3s cubic-bezier(0.4, 0, 0.2, 1);
    backface-visibility: hidden;
    will-change: opacity, transform;
  }

  &__burger-icon {
    opacity: 1;
    transform: rotate(0deg) scale(1) translateZ(0);

    &--hovering {
      opacity: 0;
      transform: rotate(90deg) scale(0.8) translateZ(0);
    }
  }

  &__chevron-icon {
    opacity: 0;
    transform: rotate(-90deg) scale(0.8) translateZ(0);

    &--hovering {
      opacity: 1;
      transform: rotate(0deg) scale(1) translateZ(0);
    }
  }

  &__desktop-dropdown {
    position: absolute;
    top: calc(100% + 8px);
    left: 50%;
    transform: translateX(-50%);
    min-width: 200px;
    background: rgba(0, 0, 0, 0.9);
    backdrop-filter: blur(20px) saturate(180%);
    border: 1px solid rgba(255, 255, 255, 0.15);
    border-radius: 0.75rem;
    padding: 0.75rem;
    box-shadow: 0 20px 60px -10px rgba(0, 0, 0, 0.5),
      0 10px 40px -15px rgba(0, 0, 0, 0.3), 0 0 0 1px rgba(255, 255, 255, 0.05);
    z-index: 60;
    animation: dropdown-appear 0.3s cubic-bezier(0.34, 1.56, 0.64, 1);

    &::before {
      content: "";
      position: absolute;
      top: -12px;
      left: 50%;
      transform: translateX(-50%);
      width: 60px;
      height: 12px;
      background: transparent;
      pointer-events: auto;
    }

    &::after {
      content: "";
      position: absolute;
      top: -6px;
      left: 50%;
      transform: translateX(-50%);
      width: 0;
      height: 0;
      border-left: 6px solid transparent;
      border-right: 6px solid transparent;
      border-bottom: 6px solid rgba(0, 0, 0, 0.9);
    }

    @supports (backdrop-filter: blur(20px)) {
      background: rgba(0, 0, 0, 0.85);

      &::after {
        border-bottom-color: rgba(0, 0, 0, 0.85);
      }
    }
  }

  &__dropdown-link {
    display: block;
    padding: 0.875rem 1.25rem;
    font-size: 0.875rem;
    font-weight: 600;
    letter-spacing: 0.025em;
    color: rgba(248, 250, 252, 0.95);
    text-decoration: none;
    border-radius: 0.5rem;
    transition: color 0.2s cubic-bezier(0.4, 0, 0.2, 1),
      background-color 0.2s cubic-bezier(0.4, 0, 0.2, 1),
      transform 0.2s cubic-bezier(0.4, 0, 0.2, 1);
    white-space: nowrap;
    position: relative;
    backface-visibility: hidden;
    will-change: color, background-color, transform;

    &:not(:last-child) {
      margin-bottom: 2px;
    }

    &:hover {
      color: #fff;
      background: rgba(255, 255, 255, 0.15);
      transform: translateX(2px) translateZ(0);
    }

    &:focus-visible {
      outline: 2px solid var(--color-primary, #a78bfa);
      outline-offset: 2px;
    }

    &[data-active="true"] {
      color: var(--color-primary, #a78bfa);
      font-weight: 700;
      background: rgba(167, 139, 250, 0.15);

      &::before {
        content: "";
        position: absolute;
        left: 0;
        top: 50%;
        transform: translateY(-50%);
        width: 3px;
        height: 60%;
        background: var(--color-primary, #a78bfa);
        border-radius: 2px;
      }
    }
  }

  @keyframes dropdown-appear {
    from {
      opacity: 0;
      transform: translateX(-50%) translateY(-12px) scale(0.95);
    }
    to {
      opacity: 1;
      transform: translateX(-50%) translateY(0) scale(1);
    }
  }

  &__list {
    list-style: none;
    display: flex;
    align-items: center;
    gap: 2px;
    margin: 0;
    padding: 0;
    flex: 1 1 auto;
    justify-content: flex-end;
  }

  &__item {
    display: flex;
    align-items: center;
    transition: transform 0.4s cubic-bezier(0.4, 0, 0.2, 1),
      opacity 0.4s cubic-bezier(0.4, 0, 0.2, 1);
  }

  &__nav-item {
    transform: translateX(0) translateZ(0);
    opacity: 1;
    width: auto;
    overflow: visible;
    transition: transform 0.4s cubic-bezier(0.4, 0, 0.2, 1),
      opacity 0.4s cubic-bezier(0.4, 0, 0.2, 1);
    will-change: transform, opacity;

    .#{$block}--scrolled & {
      transform: translateX(54px) translateZ(0);

      @media (max-width: 1200px) {
        transform: translateX(28px) translateZ(0);
      }
    }

    .#{$block}:not(.#{$block}--scrolled) & {
      transform: translateX(100px) translateZ(0);
      opacity: 0;
      pointer-events: none;
      width: 0;
      overflow: hidden;
      margin: 0;
      padding: 0;
    }

    @for $i from 1 through 8 {
      &:nth-child(#{$i + 1}) {
        transition-delay: #{$i * 0.05}s;
      }
    }
  }

  &__link {
    display: inline-block;
    padding: 0.5rem 0.875rem;
    font-size: 0.875rem;
    font-weight: 600;
    letter-spacing: 0.025em;
    color: rgba(248, 250, 252, 0.9);
    text-decoration: none;
    transition: color 0.2s cubic-bezier(0.4, 0, 0.2, 1);
    transform: translateZ(0);
    text-shadow: 0 1px 4px rgba(0, 0, 0, 0.3);

    &:hover {
      color: #fff;
    }

    &:focus-visible {
      outline: 2px solid var(--color-primary, #a78bfa);
      outline-offset: 2px;
    }

    &[data-active="true"] {
      color: var(--color-primary, #a78bfa);
      font-weight: 700;
    }
  }

  &__actions {
    margin-left: auto;
    display: flex;
    align-items: center;
    gap: 0;
    list-style: none;
    flex: 0 0 auto;
  }

  &__action-item {
    display: flex;
    align-items: center;
    padding-inline: 2px;
    height: 100%;
    white-space: nowrap;

    & + & {
      border-left: 1px solid rgba(148, 163, 184, 0.4);
    }
  }

  &__actions > &__action-item:first-child {
    padding-right: 10px;
  }
  &__actions > &__action-item:last-child {
    padding-left: 10px;
  }

  @media (min-width: 1024px) and (max-width: 1200px) {
    &__link {
      padding: 0.5rem 0.625rem;
      font-size: 0.8125rem;
    }
    &__desktop-burger-button {
      padding: 0.5rem 0.625rem;
    }
    &__action-item {
      padding-inline: 4px;
    }
    &__actions > &__action-item:first-child {
      padding-right: 8px;
    }
    &__actions > &__action-item:last-child {
      padding-left: 8px;
    }

    &__action-item :deep() {
      font-size: 0.8125rem;

      button,
      .ui-button {
        font-size: 0.8125rem !important;
      }

      .ui-icon,
      svg {
        width: 16px !important;
        height: 16px !important;
      }
    }
  }

  &__mobile {
    margin-left: auto;
    display: flex;
    align-items: center;
    gap: 8px;
  }

  &__mobile-language {
    display: flex;
    align-items: center;
  }

  &__menu-button {
    border: 0;
    transition: color 0.2s cubic-bezier(0.4, 0, 0.2, 1);
    transform: translateZ(0);

    &:hover {
      color: rgba(255, 255, 255, 0.8);
    }

    &:focus-visible {
      outline: 2px solid var(--color-primary, #a78bfa);
      outline-offset: 2px;
    }
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

  @media (prefers-reduced-motion: reduce) {
    &,
    &__inner,
    &__separator,
    &__burger-item,
    &__nav-item,
    &__burger-icon,
    &__chevron-icon {
      transition: none !important;
      animation: none !important;
    }
  }
}
</style>
