<script setup lang="ts">
const { cmsRequest } = useStrapi();

const { data, pending, error } =
  await useLazyAsyncData<CertificateSectionResponse>("certificates", () =>
    cmsRequest<CertificateSectionResponse>(
      "certificate-section",
      ["title", "text", "jumpmark", "certificationCards"],
      undefined,
      false,
      ["certificationCards.logo"]
    )
  );

const headerText = computed<BlockNode[]>(
  () => (data.value?.text ?? []) as BlockNode[]
);
</script>

<template>
  <section v-if="pending" class="certificate-section">
    Loading certificate-section...
  </section>

  <section v-else-if="error" class="certificate-section">
    Failed to load certificate-section.
  </section>

  <section-wrapper
    v-else-if="data"
    :jumpmark="data.jumpmark || 'certificates'"
    variant="h2"
    :header-title="data.title || ''"
    :header-text="headerText"
  >
    <template #content>
      <div class="certificate-section" aria-label="Main">
        <div class="certificate-section__grid">
          <certificate-card
            v-for="(card, index) in data.certificationCards"
            :key="index"
            :data="card"
          />
        </div>
      </div>
    </template>
  </section-wrapper>
</template>

<style scoped lang="scss">
$block: "certificate-section";

.#{$block} {
  &__grid {
    display: grid;
    gap: 1.5rem;
    grid-template-columns: repeat(1, minmax(0, 1fr));

    // sm
    @media (min-width: 640px) {
      gap: 1.75rem; // gap-7
      grid-template-columns: repeat(2, minmax(0, 1fr));
    }

    // lg
    @media (min-width: 1024px) {
      gap: 2rem; // gap-8
      grid-template-columns: repeat(4, minmax(0, 1fr));
    }
  }
}
</style>
