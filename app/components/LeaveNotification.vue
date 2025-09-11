<script setup lang="ts">
import { useBreakpoints, useEventListener, useStorage } from "@vueuse/core";

const props = withDefaults(
  defineProps<{
    blindTopOffsetPx?: number;
  }>(),
  {
    blindTopOffsetPx: 0,
  }
);

const { cmsRequest, buildImageUrl, currentLocaleString } = useStrapi();

const { data, pending, error } =
  await useLazyAsyncData<LeaveNotificationResponse>(
    `leaveNotification-${currentLocaleString.value}`,
    () =>
      cmsRequest<LeaveNotificationResponse>("leave-notification", [
        "title",
        "text",
        "qrcode",
        "openWhatsapp",
        "directMessage",
        "disclaimer",
      ])
  );
const breakpoints = useBreakpoints({ lg: 1024 });
const isDesktop = breakpoints.greaterOrEqual("lg");

const qrCodeUrl = computed<string | undefined>(() => {
  const qrcode = Array.isArray(data.value?.qrcode)
    ? data.value?.qrcode[0]
    : data.value?.qrcode;
  const url = buildImageUrl(qrcode, "small");
  return url === null ? undefined : url;
});

const isOpen = ref(false);
const lastMouseY = ref<number | null>(null);
const hasScrolledHalfway = ref(false);
const showIndicator = ref(true);

const suppressedUntil = useStorage(
  "leave-notification:suppress-until",
  0,
  undefined,
  {
    serializer: { read: Number, write: String },
  }
);

const ACTIVATION_THRESHOLD = 60;
const MINIMUM_UPWARD_DELTA = 6;

const suppressForToday = (): void => {
  const nextDayStart = new Date();
  nextDayStart.setHours(24, 0, 0, 0);
  suppressedUntil.value = nextDayStart.getTime();
};

const shouldOpenOnMove = (mouseY: number, deltaY: number): boolean => {
  const topOffset = Math.max(0, props.blindTopOffsetPx);
  const isAiSummaryOpen =
    typeof document !== "undefined" &&
    document.documentElement.hasAttribute("data-ai-summary-open");

  return (
    Date.now() >= suppressedUntil.value &&
    hasScrolledHalfway.value &&
    mouseY <= ACTIVATION_THRESHOLD &&
    mouseY >= topOffset &&
    deltaY < -MINIMUM_UPWARD_DELTA &&
    !isAiSummaryOpen
  );
};

const handleMouseMove = (event: MouseEvent): void => {
  const mouseY = event.clientY;
  const deltaY = lastMouseY.value === null ? 0 : mouseY - lastMouseY.value;
  lastMouseY.value = mouseY;

  if (shouldOpenOnMove(mouseY, deltaY)) {
    isOpen.value = true;
  }
};

const handleScroll = (): void => {
  if (hasScrolledHalfway.value) return;

  const scrollPercentage =
    window.scrollY /
    (document.documentElement.scrollHeight -
      document.documentElement.clientHeight);

  if (scrollPercentage >= 0.5) {
    hasScrolledHalfway.value = true;
    setTimeout(() => (showIndicator.value = false), 3000);
  }
};

onMounted(() => {
  if (isDesktop.value) {
    useEventListener("mousemove", handleMouseMove, { passive: true });
    useEventListener("scroll", handleScroll, { passive: true });
  }
});

watch(isOpen, (newValue: boolean, oldValue: boolean) => {
  if (oldValue && !newValue) suppressForToday();
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
      <UModal
        v-if="isOpen"
        v-model:open="isOpen"
        :title="data.title || 'Kontakt aufnehmen'"
        :description="data.text || 'Nehmen Sie direkt Kontakt auf'"
        :prevent-close="true"
        class="leave-modal-custom"
      >
        <template #body>
          <div class="leave-notification__body">
            <section
              class="leave-notification__qr-section"
              aria-labelledby="leave-notification-qr-title"
            >
              <h3
                id="leave-notification-qr-title"
                class="leave-notification__section-title"
              >
                {{ data.directMessage || "Direkt Nachricht per WhatsApp:" }}
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
                <span>{{ data.openWhatsapp || "WhatsApp öffnen" }}</span>
              </a>
            </section>

            <div class="leave-notification__separator" aria-hidden="true">
              <span>{{ $t("leave_notification.separator") }}</span>
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
                <span>{{ $t("leave_notification.appointment") }}</span>
              </a>

              <a
                href="mailto:denis@steinhorst.dev"
                target="_blank"
                aria-label="E-Mail schreiben"
                class="leave-notification__contact-link"
              >
                <UIcon name="i-lucide-mail" class="leave-notification__icon" />
                <span>{{ $t("leave_notification.email") }}</span>
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
                <span>{{ $t("leave_notification.linkedin") }}</span>
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
                <span>{{ $t("leave_notification.xing") }}</span>
              </a>
            </section>

            <p class="leave-notification__footnote" aria-hidden="true">
              {{
                data.disclaimer || "* Unverbindlich. Keine Vorbereitung nötig."
              }}
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

// Global fallback for any modal title
:global(.leave-modal-custom h2),
:global(.leave-modal-custom [id*="dialog-title"]) {
  font-size: 1.5rem !important;
}

:global(.leave-modal-custom button) {
  cursor: pointer !important;
}
</style>
