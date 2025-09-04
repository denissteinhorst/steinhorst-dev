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
    :description="
      quickFilter?.text ||
      'Gib etwas ein und prüfe, ob ich damit bereits gearbeitet habe.'
    "
    close-icon="i-lucide-x"
    @close="closeOverlay"
  >
    <template #header="{ close }">
      <div class="skill-quick-filter__header">
        <div class="skill-quick-filter__header-content">
          <h3 class="skill-quick-filter__custom-title">
            {{ quickFilter?.toggle || "Schnellfilter" }}
          </h3>
          <p class="skill-quick-filter__description">
            {{
              quickFilter?.text ||
              "Gib etwas ein und prüfe, ob ich damit bereits gearbeitet habe."
            }}
          </p>
        </div>
        <button
          type="button"
          class="skill-quick-filter__close-button"
          @click="close"
        >
          <UIcon name="i-lucide-x" class="skill-quick-filter__close-icon" />
        </button>
      </div>
    </template>
    <template #body>
      <label for="skill-search" class="visually-hidden"
        >Skill eingeben zum Prüfen</label
      >
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
      <p id="skill-search-desc" class="visually-hidden">
        Tippe einen Begriff ein. Ergebnisse erscheinen live darunter.
      </p>
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
              Suche nach "{{ skillQuery.trim() }}"...
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
              {{
                quickFilter?.hintSuccess
                  ? quickFilter.hintSuccess.includes("%SKILL%")
                    ? quickFilter.hintSuccess.replace(
                        "%SKILL%",
                        skillResult.skill
                      )
                    : quickFilter.hintSuccess
                  : `Ja, mit ${skillResult.skill} habe ich bereits gearbeitet!`
              }}
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
              {{
                quickFilter?.hintError
                  ? quickFilter.hintError.includes("%SKILL%")
                    ? quickFilter.hintError.replace(
                        "%SKILL%",
                        skillResult.skill
                      )
                    : quickFilter.hintError
                  : `Nein, mit ${skillResult.skill} habe ich noch nicht gearbeitet oder kenne es nicht gut genug.`
              }}
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
  &__header {
    display: flex;
    justify-content: space-between;
    align-items: flex-start;
    gap: 1rem;
  }

  &__header-content {
    flex: 1;
  }

  &__custom-title {
    font-size: 1.25rem;
    font-weight: 600;
    margin: 0 0 0.5rem 0;
    color: inherit;
  }

  &__description {
    font-size: 0.875rem;
    color: #6b7280;
    margin: 0;
    line-height: 1.5;

    @at-root .dark #{&} {
      color: #9ca3af;
    }
  }

  &__close-button {
    display: flex;
    align-items: center;
    justify-content: center;
    width: 2rem;
    height: 2rem;
    border-radius: 0.375rem;
    border: none;
    background: transparent;
    color: #6b7280;
    cursor: pointer;
    transition: all 0.15s ease;
    flex-shrink: 0;

    &:hover {
      background: #f3f4f6;
      color: #374151;
    }

    @at-root .dark #{&} {
      color: #9ca3af;

      &:hover {
        background: #374151;
        color: #f9fafb;
      }
    }
  }

  &__close-icon {
    width: 1.25rem;
    height: 1.25rem;
  }

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
