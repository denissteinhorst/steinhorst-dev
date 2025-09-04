<script setup lang="ts">
const { cmsRequest, buildImageUrl, currentLocaleString } = useStrapi();

const { data, pending, error } =
  await useLazyAsyncData<LeaveNotificationResponse>(
    () => `leaveNotification-${currentLocaleString.value}`,
    (): Promise<LeaveNotificationResponse> =>
      cmsRequest<LeaveNotificationResponse>("leave-notification", [
        "title",
        "text",
        "qrcode",
      ])
  );

// Public API: only vertical offset for the activation band
const props = withDefaults(defineProps<{ blindTopOffsetPx?: number }>(), {
  blindTopOffsetPx: 0,
});

// Desktop detection
const isDesktop = ref(true);

const checkIfDesktop = (): void => {
  if (!import.meta.client) return;
  const mediaQuery = window.matchMedia("(min-width: 1024px)");
  isDesktop.value = mediaQuery.matches;
};

const qrCodeUrl = computed<string | undefined>(() => {
  const qrcode = Array.isArray(data.value?.qrcode)
    ? data.value?.qrcode[0]
    : data.value?.qrcode;
  const url = buildImageUrl(qrcode, "small");
  return url === null ? undefined : url;
});

// Internal state
const isOpen = ref(false);
const lastMouseY = ref<number | null>(null);
const suppressedUntil = ref<number>(0);

// Minimal, readable constants (do not expose as props)
const ACTIVATION_THRESHOLD_IN_PIXELS = 60; // Top band height triggering the modal
const MINIMUM_UPWARD_DELTA_IN_PIXELS = 6; // Required upward pointer movement to signal intent
const SUPPRESS_LOCAL_STORAGE_KEY = "leave-notification:suppress-until";

const readSuppressedUntil = (): number => {
  if (!import.meta.client) return 0;
  try {
    const raw = localStorage.getItem(SUPPRESS_LOCAL_STORAGE_KEY);
    const parsed = raw ? parseInt(raw, 10) : 0;
    return Number.isFinite(parsed) ? parsed : 0;
  } catch {
    return 0;
  }
};

const suppressForToday = (): void => {
  if (!import.meta.client) return;
  const nextDayStart = new Date();
  nextDayStart.setHours(24, 0, 0, 0);
  suppressedUntil.value = nextDayStart.getTime();
  try {
    localStorage.setItem(
      SUPPRESS_LOCAL_STORAGE_KEY,
      String(suppressedUntil.value)
    );
  } catch {
    // ignore storage errors
  }
};

const shouldOpenOnMove = (mouseY: number, deltaY: number): boolean => {
  const topOffset = Math.max(0, props.blindTopOffsetPx ?? 0);
  if (Date.now() < suppressedUntil.value) return false;
  if (mouseY > ACTIVATION_THRESHOLD_IN_PIXELS) return false;
  if (mouseY < topOffset) return false;
  if (deltaY >= -MINIMUM_UPWARD_DELTA_IN_PIXELS) return false;
  return true;
};

const handleMouseMove = (event: MouseEvent): void => {
  const mouseY = event.clientY;
  const deltaY = lastMouseY.value === null ? 0 : mouseY - lastMouseY.value;
  lastMouseY.value = mouseY;
  if (shouldOpenOnMove(mouseY, deltaY)) {
    isOpen.value = true;
  }
};

onMounted(() => {
  suppressedUntil.value = readSuppressedUntil();
  checkIfDesktop();

  // Only enable leave notification on desktop devices
  if (isDesktop.value) {
    window.addEventListener("mousemove", handleMouseMove, { passive: true });
  }
});

onBeforeUnmount(() => {
  if (isDesktop.value) {
    window.removeEventListener("mousemove", handleMouseMove);
  }
});

// Suppress re-open until tomorrow whenever the modal is closed
watch(isOpen, (newValue: boolean, oldValue: boolean): void => {
  if (oldValue === true && newValue === false) suppressForToday();
});
</script>

<template>
  <div v-if="pending" class="leave-notification">
    Loading leave-notification...
  </div>

  <div v-else-if="error" class="leave-notification">
    Failed to load leave-notification.
  </div>

  <div v-else-if="data" class="leave-notification">
    <ClientOnly>
      <UModal v-if="isOpen" v-model:open="isOpen">
        <template #header>
          <div class="leave-notification__header">
            <div
              role="heading"
              aria-level="2"
              class="leave-notification__title"
            >
              {{ data.title || "Kontakt aufnehmen" }}
            </div>
            <UButton
              aria-label="Schließen"
              icon="i-lucide-x"
              color="neutral"
              variant="ghost"
              size="sm"
              class="leave-notification__close-button"
              style="cursor: pointer"
              @click="isOpen = false"
            />
          </div>
        </template>
        <template #body>
          <div class="leave-notification__body">
            <p class="leave-notification__intro-text">
              {{ data.text || "" }}
            </p>

            <section
              class="leave-notification__qr-section"
              aria-labelledby="leave-notification-qr-title"
            >
              <h3
                id="leave-notification-qr-title"
                class="leave-notification__section-title"
              >
                Direkt Nachricht per WhatsApp:
              </h3>
              <img
                :src="qrCodeUrl"
                alt="WhatsApp QR Code"
                class="leave-notification__qr-image"
              />
              <a
                href="https://wa.me/4915908639395"
                target="_blank"
                rel="noopener noreferrer"
                aria-label="WhatsApp Nachricht"
                class="leave-notification__contact-link leave-notification__contact-link--whatsapp"
              >
                <UIcon
                  name="i-simple-icons-whatsapp"
                  class="leave-notification__icon"
                />
                <span>WhatsApp öffnen</span>
              </a>
            </section>

            <div class="leave-notification__separator" aria-hidden="true">
              <span>oder</span>
            </div>

            <section
              class="leave-notification__links"
              aria-label="Kontaktmöglichkeiten"
            >
              <a
                href="https://calendly.com/denis-steinhorst"
                target="_blank"
                rel="noopener noreferrer"
                aria-label="Termin buchen"
                class="leave-notification__contact-link"
              >
                <UIcon
                  name="i-lucide-calendar"
                  class="leave-notification__icon"
                />
                <span>Termin</span>
              </a>

              <a
                href="mailto:denis@steinhorst.dev"
                target="_blank"
                aria-label="E-Mail schreiben"
                class="leave-notification__contact-link"
              >
                <UIcon name="i-lucide-mail" class="leave-notification__icon" />
                <span>E‑Mail</span>
              </a>

              <a
                href="https://www.linkedin.com/in/denis-steinhorst/"
                target="_blank"
                rel="noopener noreferrer"
                aria-label="LinkedIn Profil"
                class="leave-notification__contact-link"
              >
                <UIcon
                  name="i-simple-icons-linkedin"
                  class="leave-notification__icon"
                />
                <span>LinkedIn</span>
              </a>

              <a
                href="https://www.xing.com/profile/Denis_Steinhorst/"
                target="_blank"
                rel="noopener noreferrer"
                aria-label="Xing Profil"
                class="leave-notification__contact-link"
              >
                <UIcon
                  name="i-simple-icons-xing"
                  class="leave-notification__icon"
                />
                <span>Xing</span>
              </a>
            </section>

            <p class="leave-notification__footnote" aria-hidden="true">
              * Unverbindlich. Keine Vorbereitung nötig.
            </p>
          </div>
        </template>
      </UModal>
    </ClientOnly>
  </div>
</template>

<style scoped lang="scss">
$block: "leave-notification";

.#{$block} {
  &__header {
    display: flex;
    align-items: center;
    justify-content: space-between;
    gap: 0.5rem;
    width: 100%;
  }

  &__title {
    font-size: 1.25rem;
    line-height: 1.4;
    margin: 0;
  }

  &__close-button {
    margin-left: auto; // ensure right alignment even if header styles change
    cursor: pointer !important;
    display: inline-flex;
    align-items: center;
    justify-content: center;
  }

  &__body {
    display: flex;
    flex-direction: column;
    gap: 1rem; // 16px
  }

  &__intro-text {
    font-size: 0.875rem;
    margin-bottom: 0.5rem;
  }

  &__qr-section {
    display: flex;
    flex-direction: column;
    align-items: center;
    gap: 0.75rem; // 12px
    padding: 0.75rem 0;

    img {
      border: 10px solid white;
    }
  }

  &__section-title {
    font-size: 0.875rem;
    font-weight: 600;
    margin: 0;
  }

  &__qr-image {
    width: 128px;
    height: 128px;
    border-radius: 0.5rem;
    box-shadow: 0 1px 2px rgba(0, 0, 0, 0.08), 0 1px 1px rgba(0, 0, 0, 0.04);
  }

  &__icon {
    width: 20px;
    height: 20px;
  }

  &__separator {
    display: flex;
    align-items: center;
    gap: 0.75rem;
    font-size: 0.8125rem;
    user-select: none;
    margin-top: 0.75rem;

    &::before,
    &::after {
      content: "";
      height: 1px;
      background-color: currentColor;
      opacity: 0.25;
      flex: 1;
    }

    span {
      padding: 0 0.5rem;
    }
  }

  &__links {
    display: flex;
    flex-wrap: wrap;
    align-items: center;
    justify-content: center;
    gap: 0.75rem;
    margin-top: 1rem;
  }

  &__contact-link {
    display: inline-flex;
    align-items: center;
    gap: 0.5rem;
    padding: 0.5rem 0.75rem;
    border-radius: 0.5rem;
    font-size: 0.875rem;
    font-weight: 500;
    color: inherit;
    text-decoration: none;
    transition: background-color 0.2s ease;

    &:hover {
      background-color: rgba(0, 0, 0, 0.06);
    }

    @media (prefers-color-scheme: dark) {
      &:hover {
        background-color: rgba(255, 255, 255, 0.08);
      }
    }

    &--whatsapp {
      color: #25d366;

      &:hover {
        background-color: rgba(37, 211, 102, 0.12);
      }
    }
  }

  &__footnote {
    text-align: center;
    font-size: 0.75rem;
    opacity: 0.8;
    margin-top: 0.5rem;
  }
}
</style>
