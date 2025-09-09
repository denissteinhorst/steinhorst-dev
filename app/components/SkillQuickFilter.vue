<script setup lang="ts">
interface Props {
  quickFilter?: QuickFilter;
  skillCards?: SkillCard[];
  open: boolean;
}

interface Emits {
  (e: "update:open", value: boolean): void;
  (e: "close"): void;
}

const props = defineProps<Props>();
const emit = defineEmits<Emits>();

const { $sanitizeHtml } = useNuxtApp();

const modalId = "skills-filter-modal";
const MODAL_ATTRIBUTE = "data-skill-quickfilter-open";

const skillCardsRef = toRef(props, "skillCards");

// Use skill search composable
const { skillQuery, skillResult, isSearching, resetSearch } =
  useSkillSearch(skillCardsRef);

// Modal state with v-model support
const modalOpen = computed({
  get: () => props.open,
  set: (value) => emit("update:open", value),
});

/**
 * Resets the modal state and emits close event.
 */
const closeOverlay = (): void => {
  modalOpen.value = false;
  resetSearch();
  emit("close");
};

// Manage HTML attribute for modal state using VueUse
watchEffect(() => {
  if (import.meta.client) {
    if (modalOpen.value) {
      document.documentElement.setAttribute(MODAL_ATTRIBUTE, "true");
    } else {
      document.documentElement.removeAttribute(MODAL_ATTRIBUTE);
    }
  }
});

// Cleanup on component unmount
onBeforeUnmount(() => {
  if (import.meta.client) {
    document.documentElement.removeAttribute(MODAL_ATTRIBUTE);
  }
});
</script>

<template>
  <UModal
    :id="modalId"
    v-model:open="modalOpen"
    :title="quickFilter?.toggle || 'Schnellfilter'"
    :description="
      quickFilter?.text ||
      'Gib etwas ein und prüfe, ob ich damit bereits gearbeitet habe.'
    "
    close-icon="i-lucide-x"
    class="skill-quick-filter"
    @close="closeOverlay"
  >
    <template #body>
      <UInput
        id="skill-search"
        v-model="skillQuery"
        :icon="quickFilter?.icon || 'i-lucide-search'"
        size="xl"
        variant="outline"
        :placeholder="quickFilter?.placeholder || 'z.B. Vue.js oder TypeScript'"
        class="skill-quick-filter__search-input"
        aria-describedby="skill-search-desc"
        autofocus
      />

      <div
        class="skill-quick-filter__result-container"
        aria-live="polite"
        role="status"
      >
        <div class="skill-quick-filter__result-wrapper">
          <!-- Default state: no query entered -->
          <UAlert
            v-if="!skillQuery.trim()"
            icon="i-lucide-info"
            color="primary"
            variant="soft"
            title=""
            class="skill-quick-filter__alert"
          >
            <template #description>
              {{ quickFilter?.hintDefault || "Bitte Suchbegriff eingeben" }}
            </template>
          </UAlert>

          <!-- Loading state: query entered but debouncing -->
          <UAlert
            v-else-if="isSearching"
            icon="i-lucide-loader-2"
            color="info"
            variant="soft"
            title=""
            class="skill-quick-filter__alert skill-quick-filter__alert--loading"
          >
            <template #description>
              <span
                v-html="
                  $sanitizeHtml(
                    `Suche nach &quot;${skillQuery.trim()}&quot;...`
                  )
                "
              ></span>
            </template>
          </UAlert>

          <!-- Success state: skill found -->
          <UAlert
            v-else-if="skillResult?.found"
            icon="i-lucide-check-circle"
            color="success"
            variant="soft"
            title=""
            class="skill-quick-filter__alert"
          >
            <template #description>
              <span
                v-if="quickFilter?.hintSuccess"
                v-html="
                  $sanitizeHtml(
                    quickFilter.hintSuccess.includes('%SKILL%')
                      ? quickFilter.hintSuccess.replace(
                          '%SKILL%',
                          skillResult.skill
                        )
                      : quickFilter.hintSuccess
                  )
                "
              ></span>
              <span
                v-else
                v-html="
                  $sanitizeHtml(
                    `Ja, mit ${skillResult.skill} habe ich bereits gearbeitet!`
                  )
                "
              ></span>
            </template>
          </UAlert>

          <!-- Error state: skill not found -->
          <UAlert
            v-else-if="skillResult && !skillResult.found"
            icon="i-lucide-x-circle"
            color="error"
            variant="soft"
            title=""
            class="skill-quick-filter__alert"
          >
            <template #description>
              <span
                v-html="
                  $sanitizeHtml(
                    quickFilter?.hintError
                      ? quickFilter.hintError.includes('%SKILL%')
                        ? quickFilter.hintError.replace(
                            '%SKILL%',
                            skillResult.skill
                          )
                        : quickFilter.hintError
                      : `Nein, mit ${skillResult.skill} habe ich noch nicht gearbeitet oder kenne es nicht gut genug.`
                  )
                "
              ></span>
            </template>
          </UAlert>
        </div>
      </div>
    </template>
    <template #footer>
      <div class="skill-quick-filter__footer">
        <UButton
          v-if="skillQuery.trim()"
          color="secondary"
          size="lg"
          class="skill-quick-filter__button"
          :label="
            skillResult?.found
              ? quickFilter?.buttonTextSuccess || 'Direkt Kontakt aufnehmen'
              : quickFilter?.buttonTextError || 'Trotzdem Kontakt aufnehmen'
          "
          :to="quickFilter?.link || '#contact'"
          :target="quickFilter?.target || '_self'"
          @click="closeOverlay"
        />
      </div>
    </template>
  </UModal>
</template>

<style scoped lang="scss">
$block: "skill-quick-filter";

.#{$block} {
  &__search-input {
    margin-bottom: 1rem;
    width: 100%;
    min-width: 300px;
  }

  &__result-container {
    min-height: 3.5rem;
  }

  &__result-wrapper {
    width: 100%;
  }

  &__alert {
    font-size: 1.125rem;
    font-weight: 600;

    &--loading {
      .i-lucide-loader-2 {
        animation: spin 1s linear infinite;
      }
    }
  }

  &__footer {
    display: flex;
    justify-content: center;
    width: 100%;
    min-height: 48px;
    align-items: center;
  }

  &__button {
    margin-left: auto;
    margin-right: auto;
  }

  :global(.skill-quick-filter h2),
  :global(.skill-quick-filter [id*="dialog-title"]) {
    font-size: 1.5rem !important;
  }

  :global(.skill-quick-filter button) {
    cursor: pointer !important;
  }

  :global(.skill-quick-filter p) {
    font-size: 1rem !important;
  }
}

@keyframes spin {
  from {
    transform: rotate(0deg);
  }
  to {
    transform: rotate(360deg);
  }
}
</style>
