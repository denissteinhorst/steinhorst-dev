<script setup lang="ts">
const { cmsRequest, currentLocaleString } = useStrapi();

const { data, pending, error } = await useLazyAsyncData<AiSummaryResponse>(
  () => `summary-${currentLocaleString.value}`,
  () => cmsRequest<AiSummaryResponse>("ai-summary", ["subtitle", "summary"])
);

// Use PDFEasy composable
const { generatePdfFromMarkdown } = usePdfEasy();

// Typing speed configuration (words per second)
const WORDS_PER_SECOND = 32;
const WORDS_PER_SECOND_FINAL = 9000;

const open = ref(false);
// Use only remote summary from API (no local fallback)
const fullText = computed<string>(
  () => (data.value?.summary as string | undefined)?.trim() ?? ""
);

// Build UI config for USlideover dynamically
const slideoverUi = computed(() => ({
  content: [
    "ai-summary__panel",
    "w-screen sm:w-[85vw] lg:w-[50vw] max-w-none",
  ].join(" "),
  footer: ["ai-summary__panel-footer"].join(" "),
}));

// Tokenize into "word + trailing whitespace" chunks (reactive)
const tokens = computed<string[]>(() => fullText.value.match(/\S+\s*/g) || []);
const currentText = ref("");
const index = ref(0);
const isComplete = ref(false);
const hasStarted = ref(false);
// Staged progress: search -> check -> typing
const searchPhase = ref(false);
const searchCheckedPhase = ref(false);
let searchTimer: ReturnType<typeof setTimeout> | null = null;
let checkTimer: ReturnType<typeof setTimeout> | null = null;

let timer: ReturnType<typeof setTimeout> | null = null;

// Acceleration curve
const computeCurrentDelay = (): number => {
  if (tokens.value.length === 0) return 0;
  const progress = index.value / tokens.value.length;
  const eased = Math.min(1, Math.pow(progress, 2));
  const currentWordPerSecond =
    WORDS_PER_SECOND + (WORDS_PER_SECOND_FINAL - WORDS_PER_SECOND) * eased;
  return 1000 / currentWordPerSecond;
};

const scheduleNext = (): void => {
  if (index.value >= tokens.value.length) {
    isComplete.value = true;
    timer = null;
    return;
  }
  currentText.value += tokens.value[index.value++];
  const delay = computeCurrentDelay();
  timer = setTimeout(scheduleNext, delay);
};

const startTyping = (): void => {
  if (timer || isComplete.value) return;
  if (tokens.value.length === 0) {
    // No content available; mark complete to stop progress states
    hasStarted.value = true;
    isComplete.value = true;
    return;
  }
  hasStarted.value = true;
  scheduleNext();
};

watch(open, async (val) => {
  if (typeof document !== "undefined") {
    if (val) {
      document.documentElement.setAttribute("data-ai-summary-open", "true");
    } else {
      document.documentElement.removeAttribute("data-ai-summary-open");
    }
  }
  if (!val) return;
  await nextTick();
  // Start staged phases immediately
  // Clear previous timers
  if (searchTimer) clearTimeout(searchTimer);
  if (checkTimer) clearTimeout(checkTimer);
  searchPhase.value = true;
  searchCheckedPhase.value = false;
  // After 1.5s, show checkmark for 0.5s
  searchTimer = setTimeout(() => {
    searchCheckedPhase.value = true;
    checkTimer = setTimeout(() => {
      // End search phases and start typing
      searchPhase.value = false;
      searchCheckedPhase.value = false;
      startTyping();
    }, 500);
  }, 1500);
});

onBeforeUnmount(() => {
  if (timer) clearTimeout(timer);
  if (searchTimer) clearTimeout(searchTimer);
  if (checkTimer) clearTimeout(checkTimer);
  if (typeof document !== "undefined") {
    document.documentElement.removeAttribute("data-ai-summary-open");
  }
});

// Throttled markdown parsing
const parsedMarkdown = ref("");
let framePending = false;
const scheduleFrame = (callback: () => void): number | NodeJS.Timeout =>
  typeof window !== "undefined"
    ? window.requestAnimationFrame(callback)
    : setTimeout(callback, 16);

watch(currentText, (): void => {
  if (framePending) return;
  framePending = true;
  scheduleFrame((): void => {
    parsedMarkdown.value = currentText.value;
    framePending = false;
  });
});

parsedMarkdown.value = "";
const progressPercentage = computed(() =>
  Math.min(100, Math.round((index.value / (tokens.value.length || 1)) * 100))
);

// Derive availability states
const hasContent = computed(() => tokens.value.length > 0);
const canDownload = computed(() => isComplete.value && hasContent.value);

// Sparkle particle generation
interface SparkleConf {
  left: number;
  delay: number;
  duration: number;
  scale: number;
  tx: number;
}

const sparkles = ref<SparkleConf[]>([]);
const isClient = ref(false);

const buildSparkles = (count: number = 5): SparkleConf[] =>
  Array.from(
    { length: count },
    (): SparkleConf => ({
      left: 15 + Math.random() * 70,
      delay: Math.random() * 0.6,
      duration: 0.7 + Math.random() * 0.7,
      scale: 0.4 + Math.random() * 0.5,
      tx: (Math.random() - 0.5) * 8,
    })
  );

const regenerateSparkles = (): void => {
  if (!isClient.value) return;
  sparkles.value = buildSparkles();
};

onMounted((): void => {
  isClient.value = true;
  regenerateSparkles();
});

// PDF generation (only from API summary)
const downloadPdf = async (): Promise<void> => {
  if (!canDownload.value) return;
  try {
    const markdownContent = data.value?.summary as string | undefined;
    if (!markdownContent || markdownContent.trim().length === 0) return;
    await generatePdfFromMarkdown(markdownContent, {
      clientEmit: "save",
      size: "a4",
    });
  } catch (error) {
    // Optionally surface a toast; keep silent fallback here
    console.error(error);
  }
};
</script>

<template>
  <div v-if="pending" class="summary-section">Loading summary-section...</div>

  <div v-else-if="error" class="summary-section">
    Failed to load summary-section.
  </div>

  <div v-else-if="data" class="ai-summary">
    <button
      type="button"
      aria-haspopup="dialog"
      :aria-expanded="open"
      class="ai-summary__btn ai-summary-btn"
      @click="open = true"
      @mouseenter="regenerateSparkles()"
    >
      <span class="ai-summary__icon-wrapper">
        <UIcon
          name="i-heroicons-sparkles"
          class="ai-summary__icon bell-ring-icon"
        />
        <!-- Sparkle particles (only animate on hover) -->
        <span
          v-if="isClient"
          class="ai-summary__sparkle-wrapper sparkle-wrapper"
        >
          <span
            v-for="(s, i) in sparkles"
            :key="i"
            class="sparkle"
            :style="{
              left: s.left + '%',
              '--delay': s.delay + 's',
              '--dur': s.duration + 's',
              '--scale': s.scale.toString(),
              '--tx': s.tx + 'px',
            }"
          ></span>
        </span>
      </span>

      <span class="ai-summary__label ai-summary-label" data-label="AI Summary">
        AI Summary
      </span>
    </button>

    <USlideover
      v-model:open="open"
      :ui="slideoverUi"
      :overlay="true"
      side="right"
      class="ai-summary__slideover ai-summary-slideover"
    >
      <template #header>
        <div class="ai-summary__header">
          <div class="ai-summary__header-content">
            <h2 class="ai-summary__title">
              <UIcon
                name="i-heroicons-sparkles"
                class="ai-summary__title-icon"
              />
              <span>AI Summary</span>
            </h2>
            <p class="ai-summary__subtitle">{{ data.subtitle }}</p>
          </div>
          <UButton
            variant="ghost"
            square
            color="neutral"
            aria-label="Schließen"
            @click="open = false"
          >
            <UIcon name="i-lucide-x" class="ai-summary__close-icon" />
            <span class="sr-only">Schließen</span>
          </UButton>
        </div>
      </template>
      <template #body>
        <div class="ai-summary__body ai-summary-scroll">
          <ClientOnly>
            <MDC
              :value="parsedMarkdown"
              tag="div"
              class="ai-summary__content prose dark:prose-invert"
            />
            <template #fallback>
              <div class="ai-summary__loading">Lade Zusammenfassung…</div>
            </template>
          </ClientOnly>
          <!-- Phase 1 & 2: Initial search and check confirmation -->
          <div
            v-if="open && (searchPhase || searchCheckedPhase)"
            class="ai-summary__progress"
          >
            <UIcon
              name="i-heroicons-cpu-chip"
              class="ai-summary__progress-icon"
            />
            <span>Onlinesuche läuft…</span>
            <UIcon
              v-if="searchCheckedPhase"
              name="i-heroicons-check"
              class="ai-summary__progress-icon"
            />
          </div>
          <!-- Phase 3: Typing begins -->
          <div
            v-else-if="open && hasStarted && !isComplete"
            class="ai-summary__progress"
          >
            <UIcon
              name="i-heroicons-cpu-chip"
              class="ai-summary__progress-icon"
            />
            <span>Schreibe… ({{ progressPercentage }}%)</span>
          </div>
        </div>
      </template>
      <template #footer>
        <div class="ai-summary__footer">
          <UButton
            label="Termin buchen"
            color="secondary"
            variant="soft"
            :ui="{ base: 'rounded-md' }"
            href="https://calendly.com/denis-steinhorst"
            target="_blank"
            rel="noopener noreferrer"
          >
            <UIcon name="i-lucide-calendar" class="ai-summary__footer-icon" />
            <span class="ai-summary__footer-text">Termin buchen</span>
          </UButton>
          <template v-if="!canDownload">
            <UTooltip
              text="Wird aktiv sobald die Zusammenfassung vollständig generiert wurde."
              :open-delay="150"
            >
              <UButton
                label="PDF Download"
                color="primary"
                variant="soft"
                :disabled="true"
                :ui="{ base: 'rounded-md' }"
              />
            </UTooltip>
          </template>
          <template v-else>
            <UButton
              label="PDF Download"
              color="secondary"
              variant="soft"
              :disabled="false"
              :ui="{ base: 'rounded-md' }"
              @click="downloadPdf"
            />
          </template>
        </div>
      </template>
    </USlideover>
  </div>
</template>

<style scoped lang="scss">
$block: "ai-summary";

:deep(h1) {
  font-size: 2rem;
}

:deep(h2) {
  font-size: 1.5rem;
}

:deep(h3) {
  font-size: 1.5rem;
}

.#{$block} {
  // Main wrapper - align with navigation breakpoint
  display: block;
  width: 100%;

  @media (min-width: 1024px) {
    display: inline-block;
    width: auto;
  }

  &__btn {
    position: relative;
    display: inline-flex;
    align-items: center;
    gap: 0.25rem;
    padding: 0.375rem 0.75rem;
    background-color: transparent;
    border: none;
    color: rgb(226, 232, 240);
    font-size: 0.875rem;
    font-weight: 500;
    letter-spacing: 0.025em;
    cursor: pointer;
    transition: all 150ms ease;
    user-select: none;
    width: 100%;
    justify-content: center;
    box-shadow: none;
    backdrop-filter: none;
    isolation: isolate;

    // Align with navigation breakpoint (1024px) instead of 640px
    @media (min-width: 1024px) {
      width: auto;
      justify-content: flex-start;
    }

    &:hover {
      background-color: transparent;
      color: white;

      .#{$block}__icon {
        transform: rotate(12deg) scale(1.1);
      }
    }

    &:focus {
      background-color: transparent;
      outline: none;
    }

    &:focus-visible {
      box-shadow: 0 0 0 2px rgba(139, 92, 246, 0.7);
    }

    // Raise button content above glow effects
    > *:not(.glow-ring-el) {
      position: relative;
      z-index: 10;
    }
  }

  &__icon-wrapper {
    position: relative;
    display: flex;
    align-items: center;
  }

  &__icon {
    height: 1rem;
    width: 1rem;
    color: rgb(196, 181, 253);
    transition: transform 150ms ease;
  }

  &__label {
    font-weight: 600;
    position: relative;
    display: inline-block;
  }

  &__sparkle-wrapper {
    pointer-events: none;
    position: absolute;
    inset: -0.75rem;
    overflow: visible;
    z-index: 5;
  }

  // Slideover styles
  &__slideover {
    // Mobile height behavior
    @media (max-width: 1023.98px) {
      :deep(.ui-slideover-panel) {
        height: 100vh;
        height: 100svh;
        height: 100dvh;
        min-height: 100dvh;
        display: flex;
        flex-direction: column;
        padding-bottom: env(safe-area-inset-bottom, 0);
      }

      :deep(.ui-slideover-body) {
        flex: 1;
        display: flex;
        flex-direction: column;
        padding: 0;
      }
    }
  }

  &__panel {
    background-color: rgba(255, 255, 255, 0.85);
    backdrop-filter: blur(24px) saturate(150%);
    box-shadow: 0 0 0 1px rgba(0, 0, 0, 0.06);

    @supports (backdrop-filter: blur(24px)) {
      background-color: rgba(255, 255, 255, 0.6);
    }

    :root.dark & {
      background-color: rgba(0, 0, 0, 0.6);
      box-shadow: 0 0 0 1px rgba(255, 255, 255, 0.06);

      @supports (backdrop-filter: blur(24px)) {
        background-color: rgba(0, 0, 0, 0.4);
      }
    }
  }

  &__panel-footer {
    justify-content: end;
    border-top: 1px solid rgba(203, 213, 225, 0.6);
    background-color: rgba(255, 255, 255, 0.8);
    backdrop-filter: blur(24px) saturate(150%);
    box-shadow: 0 0 0 1px rgba(0, 0, 0, 0.05);
    padding: 0.75rem 1rem;

    @supports (backdrop-filter: blur(24px)) {
      background-color: rgba(255, 255, 255, 0.55);
    }

    :root.dark & {
      border-top-color: rgba(255, 255, 255, 0.1);
      background-color: rgba(0, 0, 0, 0.55);
      box-shadow: 0 0 0 1px rgba(255, 255, 255, 0.05);

      @supports (backdrop-filter: blur(24px)) {
        background-color: rgba(0, 0, 0, 0.38);
      }
    }
  }

  &__header {
    display: flex;
    align-items: flex-start;
    justify-content: space-between;
    gap: 1rem;
    width: 100%;
  }

  &__header-content {
    display: flex;
    flex-direction: column;
    gap: 0.25rem;
  }

  &__title {
    font-size: 1.125rem;
    font-weight: 600;
    display: flex;
    align-items: center;
    gap: 0.5rem;
    color: rgb(15, 23, 42);

    :root.dark & {
      color: rgb(241, 245, 249);
    }
  }

  &__title-icon {
    height: 1.25rem;
    width: 1.25rem;
    color: rgb(139, 92, 246);

    :root.dark & {
      color: rgb(196, 181, 253);
    }
  }

  &__subtitle {
    font-size: 0.75rem;
    color: rgb(71, 85, 105);

    :root.dark & {
      color: rgb(148, 163, 184);
    }
  }

  &__close-icon {
    height: 1.25rem;
    width: 1.25rem;
  }

  &__body {
    position: relative;
    height: 100%;
    width: 100%;
    overflow-y: auto;
    overflow-x: hidden;
    padding: 0 1rem 2rem;
    color: rgb(30, 41, 59);

    :root.dark & {
      color: rgb(241, 245, 249);
    }
  }

  &__content {
    line-height: 1.6;
    font-size: 0.95rem;
    max-width: none;
  }

  &__loading {
    animation: pulse 2s cubic-bezier(0.4, 0, 0.6, 1) infinite;
    color: rgb(148, 163, 184);
    font-size: 0.875rem;
  }

  &__progress {
    margin-top: 1.5rem;
    display: flex;
    align-items: center;
    gap: 0.5rem;
    font-size: 0.625rem;
    text-transform: uppercase;
    letter-spacing: 0.05em;
    color: rgb(107, 114, 128);
  }

  &__progress-icon {
    height: 0.75rem;
    width: 0.75rem;
  }

  &__footer {
    width: 100%;
    display: flex;
    justify-content: flex-end;
    gap: 0.5rem;
  }

  &__footer-icon {
    height: 1rem;
    width: 1rem;
  }

  &__footer-text {
    margin-left: 0.5rem;
  }

  // Scroll styling
  &-scroll {
    scrollbar-width: thin;
    scrollbar-color: var(--scrollbar-thumb) transparent;
    -ms-overflow-style: none;

    &::-webkit-scrollbar {
      width: 8px;
      cursor: pointer;
    }

    &::-webkit-scrollbar-track {
      background: transparent;
    }

    &::-webkit-scrollbar-thumb {
      background-color: var(--scrollbar-thumb);
      border-radius: 9999px;
      cursor: pointer;

      &:hover {
        background-color: var(--scrollbar-thumb-hover);
      }
    }
  }

  // Animations
  @keyframes sparkleRise {
    0% {
      transform: translate3d(0, 6px, 0) scale(var(--scale));
      opacity: 0;
    }
    10% {
      opacity: 1;
    }
    55% {
      opacity: 0.9;
    }
    100% {
      transform: translate3d(var(--tx), -18px, 0)
        scale(calc(var(--scale) * 0.85));
      opacity: 0;
    }
  }

  @keyframes bellRing {
    0% {
      transform: rotate(0deg);
    }
    4% {
      transform: rotate(15deg);
    }
    8% {
      transform: rotate(-12deg);
    }
    12% {
      transform: rotate(9deg);
    }
    16% {
      transform: rotate(-6deg);
    }
    20% {
      transform: rotate(3deg);
    }
    24% {
      transform: rotate(0deg);
    }
    100% {
      transform: rotate(0deg);
    }
  }

  @keyframes textGlowSweep {
    0% {
      opacity: 0;
      background-position: 160% 0;
    }
    4% {
      opacity: 1;
    }
    16% {
      opacity: 0.85;
    }
    20% {
      opacity: 0;
      background-position: -160% 0;
    }
    24% {
      opacity: 0;
      background-position: -160% 0;
    }
    100% {
      opacity: 0;
      background-position: -160% 0;
    }
  }

  @keyframes pulse {
    0%,
    100% {
      opacity: 1;
    }
    50% {
      opacity: 0.5;
    }
  }

  // Sparkle particles
  .sparkle {
    position: absolute;
    top: 50%;
    width: 3px;
    height: 3px;
    margin-top: -1.5px;
    border-radius: 50%;
    background: radial-gradient(
      circle at 35% 30%,
      #fff9c2,
      #fde68a 60%,
      #facc15 85%
    );
    box-shadow: 0 0 3px 1px rgba(250, 240, 180, 0.9),
      0 0 6px 2px rgba(250, 204, 21, 0.35);
    pointer-events: none;
    opacity: 0;
    transform-origin: center;
    filter: saturate(120%);
    animation: sparkleRise var(--dur) ease-out var(--delay) infinite paused;
  }

  // Bell ring animation for icon
  .ai-summary-btn:not(:hover) .bell-ring-icon {
    animation: bellRing 5s ease-in-out infinite;
    transform-origin: 50% 14%;
    will-change: transform;
  }

  .ai-summary-btn:hover .bell-ring-icon,
  .ai-summary-btn:focus .bell-ring-icon {
    animation: none;
  }

  // Sparkle hover effects
  .ai-summary-btn:not(:hover) .sparkle {
    opacity: 0 !important;
  }

  .ai-summary-btn:hover .sparkle {
    animation-play-state: running;
  }

  // Text glow effect
  .ai-summary-btn .ai-summary-label::after {
    content: attr(data-label);
    position: absolute;
    inset: 0;
    background: linear-gradient(
      115deg,
      transparent 0%,
      transparent 35%,
      var(--ai-summary-glow-color, #bb00ff) 100%,
      transparent 65%,
      transparent 100%
    );
    background-size: 220% 220%;
    background-position: 160% 0;
    -webkit-background-clip: text;
    background-clip: text;
    color: transparent;
    opacity: 0;
    pointer-events: none;
    mix-blend-mode: screen;
  }

  .ai-summary-btn:not(:hover) .ai-summary-label::after {
    animation: textGlowSweep 5s ease-in-out infinite;
    will-change: background-position, opacity;
  }

  .ai-summary-btn:hover .ai-summary-label::after,
  .ai-summary-btn:focus .ai-summary-label::after {
    animation: none;
    opacity: 0;
  }

  // Reduced motion preferences
  @media (prefers-reduced-motion: reduce) {
    .ai-summary-btn .sparkle {
      animation: none;
      opacity: 0;
    }

    .ai-summary-btn:not(:hover) .bell-ring-icon {
      animation: none !important;
    }

    .ai-summary-btn:not(:hover) .ai-summary-label::after {
      animation: none !important;
      opacity: 0;
    }
  }
}

// Prose/markdown styling
.prose {
  line-height: 1.6;
  font-size: 0.95rem;

  h1 {
    font-size: 1.9rem;
    font-weight: 700;
    margin: 0 0 0.6em;
  }

  h2 {
    font-size: 1.5rem;
    font-weight: 600;
    margin: 1.4em 0 0.6em;
  }

  h3 {
    font-size: 1.25rem;
    font-weight: 600;
    margin: 1.2em 0 0.5em;
  }

  h4 {
    font-size: 1.05rem;
    font-weight: 600;
    margin: 1.1em 0 0.4em;
  }

  p {
    margin: 0.9em 0;
  }

  ul,
  ol {
    margin: 0.9em 0;
    padding: 0;
  }

  ul {
    list-style: disc;
    list-style-position: outside;
    padding-left: 1.25em;
    margin-left: 0;
  }

  ol {
    list-style: decimal;
    list-style-position: outside;
    padding-left: 1.25em;
    margin-left: 0;
  }

  ul ul {
    list-style-type: circle;
  }

  ul ul ul {
    list-style-type: square;
  }

  ol ol {
    list-style-type: lower-alpha;
  }

  ol ol ol {
    list-style-type: lower-roman;
  }

  li {
    margin: 0.25em 0;
  }

  code {
    background: rgba(100, 116, 139, 0.15);
    padding: 0.15em 0.4em;
    border-radius: 4px;
    font-size: 0.85em;
  }

  pre {
    background: #1e293b;
    color: #f1f5f9;
    padding: 0.9rem 1rem;
    border-radius: 8px;
    overflow: auto;
    font-size: 0.8rem;
  }

  table {
    border-collapse: collapse;
    width: 100%;
    font-size: 0.85rem;
    margin: 1.25em 0;
  }

  th,
  td {
    border: 1px solid rgba(148, 163, 184, 0.2);
    padding: 0.55em 0.6em;
    text-align: left;
  }

  thead {
    background: rgba(148, 163, 184, 0.08);
  }

  blockquote {
    border-left: 4px solid #6366f1;
    padding-left: 1em;
    margin: 1em 0;
    font-style: italic;
    color: #94a3b8;
  }

  hr {
    border: 0;
    height: 1px;
    background: linear-gradient(
      to right,
      transparent,
      rgba(148, 163, 184, 0.4),
      transparent
    );
    margin: 2.5em 0;
  }

  a {
    color: #818cf8;
    text-decoration: underline;
    position: relative;

    &::before {
      content: "";
      position: absolute;
      width: 100%;
      height: 1px;
      background: currentColor;
      bottom: -2px;
      left: 0;
      transform: scaleX(0);
      transition: transform 0.2s ease-in-out;
    }
  }

  strong {
    font-weight: 600;
  }

  &.dark\\:prose-invert {
    :root.dark & {
      color: #e2e8f0;

      h1,
      h2,
      h3,
      h4 {
        color: #f1f5f9;
      }

      a {
        color: #a5b4fc;
      }
    }
  }
}

// Screen reader only class
.sr-only {
  position: absolute;
  width: 1px;
  height: 1px;
  padding: 0;
  margin: -1px;
  overflow: hidden;
  clip: rect(0, 0, 0, 0);
  white-space: nowrap;
  border: 0;
}
</style>
