<script setup lang="ts">
/* eslint-disable vue/no-v-html */

/**
 * Option type for project count dropdown
 */
type ProjectFilterOptions = {
  label: string // Display label for the option
  value: number // Number of projects to show
}

/**
 * Component props interface
 */
interface Props {
  projectCount?: number // Total number of projects available
  allTags?: string[] // All available tags for filtering
  filteredCount?: number // Count of projects after filtering
}

const props = withDefaults(defineProps<Props>(), {
  projectCount: 0,
  allTags: () => [],
  filteredCount: 0,
})

/**
 * Event emitters for two-way binding
 */
const emit = defineEmits<{
  'update:show-count': [value: number] // Number of projects to display
  'update:selected-tags': [value: string[]] // Active filter tags
  'update:is-filtering': [value: boolean] // Whether filtering is active
}>()

const { t } = useI18n()
const { $sanitizeHtml } = useNuxtApp()

// Controls whether all projects are shown
const isShowingAllProjects = ref(false)

/**
 * Generates dropdown options for project count selector
 * Creates increments of 2 up to the total project count
 */
const availableProjectCountOptions = computed<ProjectFilterOptions[]>(() => {
  return Array.from({ length: Math.ceil(props.projectCount / 2) }, (_, index) => {
    const displayCount = (index + 1) * 2
    const isMaxCount = displayCount >= props.projectCount

    return {
      label: isMaxCount ? (t('project_section.filter.all') as string) : displayCount.toString(),
      value: isMaxCount ? props.projectCount : displayCount,
    }
  })
})

// Currently selected number of projects to display
const visibleProjectCount = ref<number>(4)

// Update visibility when project count changes
watch(visibleProjectCount, (newCount: number): void => {
  isShowingAllProjects.value = newCount === props.projectCount
  emit('update:show-count', newCount)
})

// User-selected filter tags
const selectedFilterTags = ref<string[]>([])

// Current input value that hasn't been committed as a tag
const currentFilterInput = ref('')

/**
 * Normalized version of selected tags (trimmed, lowercase)
 */
const normalizedFilterTags = computed<string[]>(() => {
  return selectedFilterTags.value.map((tag) => tag.trim().toLowerCase()).filter(Boolean)
})

/**
 * All active filters - both committed tags and current input
 */
const activeFilterTerms = computed(() => {
  const currentInputNormalized = currentFilterInput.value.trim().toLowerCase()
  return currentInputNormalized
    ? [...normalizedFilterTags.value, currentInputNormalized]
    : [...normalizedFilterTags.value]
})

/**
 * Whether any filters are currently active
 */
const isFilterActive = computed(() => activeFilterTerms.value.length > 0)

// Handle filter state changes
watch(isFilterActive, (filteringIsActive: boolean): void => {
  emit('update:is-filtering', filteringIsActive)

  if (filteringIsActive) {
    // When filtering, show all projects
    isShowingAllProjects.value = true
  } else {
    // When clearing filters, revert to default count
    visibleProjectCount.value = getDefaultVisibleCount()
    isShowingAllProjects.value = visibleProjectCount.value === props.projectCount
    emit('update:show-count', visibleProjectCount.value)
  }
})

// Update parent when filters change
watch([normalizedFilterTags, currentFilterInput], () => {
  emit('update:selected-tags', activeFilterTerms.value)
})

/**
 * Determines default number of visible projects based on screen size
 */
const getDefaultVisibleCount = (): number => {
  if (typeof window !== 'undefined' && window.innerWidth <= 640) {
    return 2 // Show fewer projects on mobile
  }
  return 4 // Default for larger screens
}

// Initialize with appropriate count for current device
onMounted((): void => {
  visibleProjectCount.value = getDefaultVisibleCount()
  emit('update:show-count', visibleProjectCount.value)
})

/**
 * Clears all active filters
 */
const clearAllFilters = (): void => {
  selectedFilterTags.value = []
  currentFilterInput.value = ''
}

/**
 * Handles input changes in the filter field
 */
const handleFilterInputChange = (event: Event): void => {
  const target = event.target as HTMLInputElement | null
  if (target && typeof target.value === 'string') {
    currentFilterInput.value = target.value
  }
}
</script>

<template>
  <div class="project-filter">
    <!-- Actions -->
    <div class="project-filter__actions">
      <!-- Project count selector -->
      <div class="project-filter__count-selector">
        <template v-if="!isFilterActive">
          <span class="project-filter__label">
            {{ t('project_section.filter.projects_to_show') }}
          </span>
          <USelect
            v-model="visibleProjectCount"
            :items="availableProjectCountOptions"
            size="sm"
            class="project-filter__select project-filter__select--wider"
            style="min-width: 6rem; width: 6rem"
            :aria-label="t('project_section.filter.projects_to_show') as string"
            aria-describedby="project-count-instructions"
          />
          <span id="project-count-instructions" class="sr-only">
            {{ t('project_section.filter.select_project_count') }}
          </span>
        </template>
        <template v-else>
          <span
            class="project-filter__count-info"
            v-html="
              $sanitizeHtml(
                t('project_section.filter.showing_count', {
                  filtered: props.filteredCount,
                  total: props.projectCount,
                }) as string,
              )
            "
          >
          </span>
          <button type="button" class="project-filter__reset-button" @click="clearAllFilters">
            {{ t('project_section.filter.reset_filters') }}
            <UIcon name="i-lucide-x" class="project-filter__reset-icon" aria-hidden="true" />
          </button>
        </template>
      </div>

      <!-- Tag filter -->
      <div class="project-filter__tag-container">
        <label for="project-tags-filter" class="project-filter__label">
          {{ t('project_section.filter.filter_projects') }}
        </label>
        <UInputTags
          id="project-tags-filter"
          v-model="selectedFilterTags"
          :items="props.allTags"
          :placeholder="t('project_section.filter.placeholder') as string"
          :add-on-tab="true"
          :add-on-enter="true"
          :add-on-blur="true"
          :add-on-comma="true"
          icon="i-lucide-search"
          class="project-filter__input"
          trailing
          :ui="{
            root: 'project-filter__input-root',
            input: 'project-filter__input-field',
            item: 'project-filter__input-item',
            trailing: 'project-filter__input-trailing',
          }"
          aria-describedby="project-tags-instructions project-status"
          @input="handleFilterInputChange"
        >
          <template v-if="selectedFilterTags.length || currentFilterInput" #trailing>
            <UButton
              color="neutral"
              variant="link"
              size="sm"
              icon="i-lucide-circle-x"
              :aria-label="t('project_section.filter.clear_filters') as string"
              @click="clearAllFilters"
            />
          </template>
        </UInputTags>
      </div>
      <p id="project-tags-instructions" class="sr-only">
        {{ t('project_section.filter.filter_instructions') }}
      </p>
    </div>

    <!-- Screen reader status -->
    <p id="project-status" class="sr-only" aria-live="polite">
      {{
        t('project_section.filter.current_status', {
          showing: isFilterActive ? props.filteredCount : visibleProjectCount,
          total: props.projectCount,
        })
      }}
    </p>
  </div>
</template>

<style scoped lang="scss">
$block: 'project-filter';

.#{$block} {
  width: 100%;
  margin-bottom: 1.75rem;

  &__actions {
    display: flex;
    flex-direction: column;
    gap: 1rem;

    @media (min-width: 768px) {
      flex-direction: row;
      align-items: center;
    }
  }

  &__count-selector {
    display: flex;
    flex-direction: row;
    align-items: center;
    gap: 0.5rem;
    width: 100%;

    @media (min-width: 768px) {
      width: 50%;
    }
  }

  &__label {
    font-size: 0.875rem;
    font-weight: 500;
    white-space: nowrap;
    width: auto;
    flex: none;
    color: #4d5868;

    @at-root .dark #{&} {
      color: #cfd2d9;
    }
  }

  &__select {
    min-width: 6rem !important;
    width: 6rem !important;
    flex-shrink: 0;

    :deep(.u-select-button) {
      min-width: 6rem !important;
      padding-left: 0.75rem;
      padding-right: 0.75rem;
    }

    :deep(.u-select-dropdown) {
      min-width: 6rem !important;
    }

    &--wider {
      min-width: 7rem !important;
      width: 7rem !important;

      :deep(.u-select) {
        min-width: 7rem !important;
        width: 7rem !important;
      }

      :deep(.u-select-button) {
        min-width: 7rem !important;
        width: 7rem !important;
      }

      :deep(.u-select-dropdown) {
        min-width: 7rem !important;
        width: 7rem !important;
      }
    }
  }

  &__count-info {
    font-size: 0.875rem;
    color: #6b7483;

    @at-root .dark #{&} {
      color: #98a0ad;
    }
  }

  &__count-highlight {
    font-weight: 600;
    color: #101828;

    @at-root .dark #{&} {
      color: #e5e7eb;
    }
  }

  &__reset-button {
    display: inline-flex;
    align-items: center;
    gap: 0.25rem;
    padding: 0.25rem 0.5rem;
    border-radius: 0.375rem;
    font-size: 0.875rem;
    background-color: #f5f5f7;
    color: #4d5868;
    transition: background-color 0.2s;

    &:hover {
      background-color: #e9e9ec;
    }

    @at-root .dark #{&} {
      background-color: #232935;
      color: #cfd2d9;

      &:hover {
        background-color: #2d3441;
      }
    }
  }

  &__reset-icon {
    width: 0.875rem;
    height: 0.875rem;
  }

  &__tag-container {
    display: flex;
    flex-direction: row;
    align-items: center;
    gap: 0.5rem;
    width: 100%;

    @media (min-width: 768px) {
      width: 50%;
      justify-content: flex-end;
    }
  }

  &__input {
    flex: 1;
    min-width: 0;
    max-width: 100%;

    @media (min-width: 768px) {
      width: 50%;
      max-width: 24rem;
    }
  }

  &__input-root {
    flex-wrap: nowrap;
    overflow: hidden;
  }

  &__input-field {
    white-space: nowrap;
    text-overflow: ellipsis;
    overflow: hidden;
  }

  &__input-item {
    text-overflow: ellipsis;
    overflow: hidden;
  }

  &__input-trailing {
    padding-right: 0.25rem;
  }
}

@media (max-width: 640px) {
  .#{$block} {
    &__label {
      width: auto;
      text-align: left;
    }

    &__input {
      padding-right: 0.5rem;

      &::placeholder {
        font-size: 0.95rem;
        text-overflow: ellipsis;
        white-space: nowrap;
        overflow: hidden;
        max-width: 100%;
        display: block;
      }
    }
  }
}
</style>
