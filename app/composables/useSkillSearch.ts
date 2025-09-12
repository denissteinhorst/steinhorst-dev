interface SkillSearchResult {
  found: boolean
  skill: string
}

/**
 * Composable for skill search functionality with debounced searching.
 * Handles pipe-separated skills within items (e.g., "Vue.js|React|Angular").
 */
export const useSkillSearch = (skillCards: Ref<SkillCard[] | undefined>) => {
  const skillQuery = ref('')
  const debouncedSkillQuery = refDebounced(skillQuery, 300)

  const allSkills = computed((): string[] => {
    if (!skillCards.value) return []

    return skillCards.value.flatMap((card) =>
      (card.skillItems || []).flatMap((item) =>
        (item.title || '').split('|').map((skill) => skill.trim()),
      ),
    )
  })

  const skillResult = computed((): SkillSearchResult | null => {
    const query = debouncedSkillQuery.value.trim().toLowerCase()
    if (!query) return null

    const matchedSkill = allSkills.value.find((skill) => skill.toLowerCase().includes(query))

    return matchedSkill
      ? { found: true, skill: matchedSkill }
      : { found: false, skill: debouncedSkillQuery.value.trim() }
  })

  const isSearching = computed(() => !!skillQuery.value.trim() && !debouncedSkillQuery.value.trim())

  const resetSearch = (): void => {
    skillQuery.value = ''
  }

  return {
    skillQuery,
    debouncedSkillQuery: readonly(debouncedSkillQuery),
    allSkills: readonly(allSkills),
    skillResult: readonly(skillResult),
    isSearching: readonly(isSearching),
    resetSearch,
  }
}
