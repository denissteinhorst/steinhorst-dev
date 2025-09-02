<script setup lang="ts">
import { onMounted, onUnmounted, ref } from "vue";

const isActive = ref(false);
const isStarting = ref(false);
const isBottom = ref(false);
const isContactInView = ref(false);
const showContactIcon = ref(true);

let contactObserver: IntersectionObserver | null = null;
let ticking = false;

const scrollToTop = () => {
  window.scrollTo({ top: 0, behavior: "smooth" });
};

const updateScrollState = () => {
  if (!ticking) {
    requestAnimationFrame(() => {
      const scrollY = window.scrollY || window.pageYOffset;
      const windowHeight = window.innerHeight;
      isStarting.value = scrollY > windowHeight / 4;
      isActive.value = scrollY > windowHeight / 4.2;
      isBottom.value = false;
      showContactIcon.value = !isContactInView.value;
      ticking = false;
    });
    ticking = true;
  }
};

onMounted(() => {
  window.addEventListener("scroll", updateScrollState);
  updateScrollState();

  const contactEl = document.getElementById("contact");
  if (contactEl) {
    contactObserver = new IntersectionObserver(
      (entries) => {
        for (const entry of entries) {
          if (entry.target === contactEl) {
            isContactInView.value = entry.isIntersecting;
            showContactIcon.value = !isContactInView.value;
          }
        }
      },
      { root: null, threshold: [0.1, 0.25, 0.5] }
    );
    contactObserver.observe(contactEl);
  }
});

onUnmounted(() => {
  window.removeEventListener("scroll", updateScrollState);
  if (contactObserver) {
    contactObserver.disconnect();
    contactObserver = null;
  }
});
</script>

<template>
  <div
    v-if="isStarting"
    ref="companion"
    :class="[
      'scroll-companion',
      {
        'scroll-companion--starting': isStarting && !isBottom,
        'scroll-companion--bottom': isBottom,
      },
    ]"
  >
    <!-- Glow effect as separate element -->
    <div class="scroll-companion__glow"></div>
    <div
      :class="[
        'scroll-companion__inner',
        {
          'scroll-companion__inner--active': isActive,
        },
      ]"
    >
      <div class="scroll-companion__content">
        <!-- 1) Arrow up -->
        <div class="scroll-companion__section">
          <UTooltip
            :text="'Zum Seitenanfang scrollen'"
            :delay-duration="0"
            :content="{ side: 'top', sideOffset: 12 }"
          >
            <UIcon
              name="i-lucide-arrow-up-circle"
              class="scroll-companion__icon scroll-companion__icon--clickable"
              style="--color-secondary: var(--color-secondary, #8b5cf6)"
              aria-label="Zum Seitenanfang scrollen"
              @click="scrollToTop"
            />
          </UTooltip>
          <!-- Hidden rocket icon that appears on hover -->
          <UIcon
            v-if="!isActive"
            name="i-heroicons-rocket-launch"
            class="scroll-companion__rocket-icon"
            aria-hidden="true"
          />
        </div>

        <!-- 2) Color mode toggle -->
        <div class="scroll-companion__section">
          <color-selector />
        </div>

        <!-- 3) Contact or AI Summary -->
        <div class="scroll-companion__section">
          <template v-if="showContactIcon">
            <UTooltip
              :text="'Direkt zum Kontaktbereich scrollen'"
              :delay-duration="0"
              :content="{ side: 'top', sideOffset: 8 }"
            >
              <NuxtLink
                to="/#contact"
                aria-label="Direkt zum Kontaktbereich scrollen"
                class="scroll-companion__contact-link"
              >
                <UIcon
                  name="i-lucide-message-circle-more"
                  class="scroll-companion__icon scroll-companion__icon--clickable"
                  style="--color-secondary: var(--color-secondary, #8b5cf6)"
                />
              </NuxtLink>
            </UTooltip>
          </template>
          <template v-else>
            <UTooltip
              :text="'KI Zusammenfassung anzeigen'"
              :delay-duration="0"
              :content="{ side: 'top', sideOffset: 5 }"
            >
              <span class="scroll-companion__ai-wrapper">
                <ai-summary
                  :icon-only="true"
                  class="scroll-companion__ai-summary"
                  title="KI Zusammenfassung"
                  target="companion"
                />
              </span>
            </UTooltip>
          </template>
        </div>
      </div>
    </div>
  </div>
</template>

<style scoped lang="scss">
$block: "scroll-companion";

.#{$block} {
  position: fixed;
  width: 100%;
  display: flex;
  justify-content: center;
  align-items: center;
  z-index: 9001;
  pointer-events: none;
  bottom: -10rem; // Start hidden below viewport

  &--starting {
    animation: slide 0.4s ease-out, fade 0.6s ease-out;
    bottom: 1rem;
  }

  &--bottom {
    animation: slide-higher 0.6s ease-out;
    bottom: 3rem;
  }

  &__glow {
    position: absolute;
    left: 50%;
    bottom: -32px;
    transform: translateX(-50%);
    width: 320px;
    height: 120px;
    background: radial-gradient(
      ellipse 70% 60% at 50% 60%,
      var(--color-primary, #8b5cf6) 0%,
      transparent 80%
    );
    opacity: 0;
    pointer-events: none;
    transition: opacity 0.4s ease-out;
    z-index: 1;
    filter: blur(16px) saturate(1.2);
  }

  &:hover &__glow {
    opacity: 0.7;
  }

  &__inner {
    display: flex;
    justify-content: space-around;
    align-items: center;
    background-color: #dbdbdd;
    padding: 0 0.5rem;
    width: 3.75rem; // w-15
    height: 3.75rem; // h-15
    box-shadow: 0 0 0 25px rgba(0, 0, 0, 0.25);
    border-radius: 50%;
    transition: all 0.4s ease-out;
    pointer-events: auto;
    position: relative;
    transform: translateZ(0); /* Force hardware acceleration */
    z-index: 2; /* Ensure companion stays above the glow */

    &--active {
      width: 150px;
      height: 34px;
      border: 1px solid rgba(0, 0, 0, 0.05);
      box-shadow: none;
      border-radius: 500px;
      animation: mutate 0.4s ease-out;
    }

    // Badge transformation on hover (when not active)
    &:not(.#{$block}__inner--active):hover {
      width: 220px !important;
      height: 34px !important;
      border: 1px solid rgba(var(--color-primary), 0.4) !important;
      background-color: rgba(17, 24, 39, 0.55) !important;
      backdrop-filter: blur(4px) !important;
      box-shadow: 0 1px 2px 0 rgba(0, 0, 0, 0.05) !important;
      border-radius: 500px !important;
      transition: all 0.4s ease-out !important;
      display: inline-flex !important;
      gap: 0.5rem !important;
      padding: 0 0.75rem !important;

      .#{$block}__content > .#{$block}__section:first-child {
        transform: translateX(-5px);
      }

      .#{$block}__rocket-icon {
        opacity: 1;
        transform: translateX(30px);
        transition: all 0.4s ease-out;
      }

      &::before {
        content: "Ab September 2025 verfügbar – Let's talk";
        position: absolute;
        right: 10px;
        color: var(--color-secondary, #8b5cf6);
        font-size: 0.875rem;
        font-weight: 500;
        white-space: nowrap;
        opacity: 1;
        animation: fadeIn 0.4s ease-out;
      }
    }
  }

  &__content {
    display: flex;
    align-items: center;
    justify-content: space-between;
    width: 100%;
    height: 34px;
  }

  &__section {
    flex: 1;
    display: flex;
    align-items: center;
    justify-content: center;
    height: 34px;
  }

  &__icon {
    color: #111827; // text-gray-900
    cursor: pointer;
    font-size: 1.25rem; // text-xl
    transition: color 0.3s ease-out;

    &--clickable:hover {
      color: var(--color-secondary, #8b5cf6) !important;
    }
  }

  &__rocket-icon {
    width: 1rem; // size-4
    height: 1rem;
    color: white;
    position: absolute;
    opacity: 0;
  }

  &__contact-link {
    display: flex;
    align-items: center;
    justify-content: center;
    height: 34px;
    width: 100%;
  }

  &__ai-wrapper {
    display: inline-flex;
    align-items: center;
    justify-content: center;
    height: 34px;
  }

  &__ai-summary {
    // Compact, icon-only AI Summary inside the companion
    :deep(.ai-summary-btn) {
      width: 34px;
      height: 34px;
      padding: 0;
      display: inline-flex;
      align-items: center;
      justify-content: center;
      border-radius: 9999px;
    }

    :deep(.ai-summary-label) {
      display: none !important;
    }

    :deep(.sparkle-wrapper) {
      display: none !important;
    }

    :deep(.bell-ring-icon) {
      width: 20px;
      height: 20px;
      color: #111827 !important;
      transition: color 0.2s ease;
    }

    :deep(.ai-summary-btn:hover .bell-ring-icon) {
      color: var(--color-secondary, #8b5cf6) !important;
    }

    :deep(button[aria-haspopup="dialog"]) {
      outline: none;

      &:focus-visible {
        box-shadow: 0 0 0 2px var(--color-secondary, #8b5cf6);
        border-radius: 9999px;
      }
    }
  }
}

// Animations
@keyframes mutate {
  0% {
    width: 60px;
    height: 60px;
    box-shadow: 0 0 0 25px rgba(0, 0, 0, 0.25);
    border-radius: 50%;
  }
  100% {
    width: 150px;
    height: 34px;
    border: 1px solid rgba(0, 0, 0, 0.05);
    box-shadow: none;
    border-radius: 500px;
  }
}

@keyframes mutate-slim {
  0% {
    width: 60px;
    height: 60px;
    box-shadow: 0 0 0 25px rgba(0, 0, 0, 0.25);
    border-radius: 50%;
  }
  100% {
    width: 110px;
    height: 34px;
    border: 1px solid rgba(0, 0, 0, 0.05);
    box-shadow: none;
    border-radius: 500px;
  }
}

@keyframes fade {
  0% {
    opacity: 0;
  }
  100% {
    opacity: 1;
  }
}

@keyframes slide {
  0% {
    bottom: -10rem;
    opacity: 0;
  }
  60% {
    bottom: 1.5rem;
    opacity: 0.8;
  }
  80% {
    bottom: 0.8rem;
    opacity: 0.95;
  }
  100% {
    bottom: 1rem;
    opacity: 1;
  }
}

@keyframes slide-higher {
  0% {
    bottom: 1rem;
  }
  100% {
    bottom: 3rem;
  }
}

@keyframes fadeIn {
  0% {
    opacity: 0;
  }
  100% {
    opacity: 1;
  }
}
</style>
