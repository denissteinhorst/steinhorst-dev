/**
 * Composable for skill search functionality.
 * Handles debounced searching through skill cards and provides search results.
 */
export const useSkillSearch = (skillCards: Ref<SkillCard[] | undefined>) => {
  const DEBOUNCE_DELAY = 300;

  // Reactive state
  const skillQuery = ref("");

  // VueUse debounced query
  const debouncedSkillQuery = refDebounced(skillQuery, DEBOUNCE_DELAY);

  /**
   * Extracts and flattens all individual skills from skill cards.
   * Handles pipe-separated skills within items (e.g., "Vue.js|React|Angular").
   */
  const extractAllSkills = (): string[] => {
    if (!skillCards.value) return [];

    return skillCards.value.flatMap((card) =>
      (card.skillItems || []).flatMap((item) =>
        (item.title || "").split("|").map((skill) => skill.trim())
      )
    );
  };

  // All available skills computed from skill cards
  const allSkills = computed(extractAllSkills);

  /**
   * Result shape for skill search operations.
   */
  interface SkillSearchResult {
    found: boolean;
    skill: string;
  }

  /**
   * Searches for a skill match using partial, case-insensitive matching.
   * Returns null if no query is provided.
   */
  const skillResult = computed((): SkillSearchResult | null => {
    const query = debouncedSkillQuery.value.trim().toLowerCase();
    if (!query) return null;

    const matchedSkill = allSkills.value.find((skill) =>
      skill.toLowerCase().includes(query)
    );

    return matchedSkill
      ? { found: true, skill: matchedSkill }
      : { found: false, skill: debouncedSkillQuery.value.trim() };
  });

  /**
   * Determines if the search is currently in a loading/debouncing state.
   */
  const isSearching = computed(() =>
    skillQuery.value.trim() && !debouncedSkillQuery.value.trim()
  );

  /**
   * Resets the search query to its initial state.
   */
  const resetSearch = (): void => {
    skillQuery.value = "";
  };

  return {
    skillQuery,
    debouncedSkillQuery: readonly(debouncedSkillQuery),
    allSkills: readonly(allSkills),
    skillResult: readonly(skillResult),
    isSearching: readonly(isSearching),
    resetSearch,
  };
};
