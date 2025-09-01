<script setup lang="ts">
const { cmsRequest } = useStrapi();

const { data, pending, error } =
  await useLazyAsyncData<ExperienceSectionResponse>("experience", () =>
    cmsRequest<ExperienceSectionResponse>(
      "experience-section",
      [
        "title",
        "text",
        "contactToggle",
        "expandToggle",
        "collapseToggle",
        "jumpmark",
        "experienceCards",
      ],
      undefined,
      false,
      ["experienceCards.logo"]
    )
  );
</script>

<template>
  <small v-if="pending" class="experience-section">
    Loading experience-section...
  </small>
  <small v-else-if="error" class="experience-section">
    Failed to load experience-section.
  </small>
  <section v-else-if="data" class="experience-section" aria-label="Main">
    <small>
      <pre>{{ data }}</pre>
    </small>
  </section>
</template>

<style scoped lang="scss">
$block: "experience-section";

.#{$block} {
}
</style>
