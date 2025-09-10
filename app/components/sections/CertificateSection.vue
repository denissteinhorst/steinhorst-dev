<script setup lang="ts">
const { cmsRequest, currentLocaleString } = useStrapi();

const { data, pending, error } =
  await useLazyAsyncData<CertificateSectionResponse>(
    `certificates-${currentLocaleString.value}`,
    () =>
      cmsRequest<CertificateSectionResponse>(
        "certificate-section",
        ["title", "text", "jumpmark", "certificationCards"],
        false,
        ["certificationCards.logo"]
      )
  );

const headerText = computed<RichTextNodes>(() => data.value?.text ?? []);
</script>

<template>
  <template v-if="pending">
    <section class="certificate-section">
      Loading certificate-section...
    </section>
  </template>

  <template v-else-if="error">
    <section class="certificate-section">
      Failed to load certificate-section.
    </section>
  </template>

  <SectionWrapper
    v-else-if="data"
    :jumpmark="data.jumpmark || 'certificates'"
    variant="h2"
    :header-title="data.title || ''"
    :header-text="headerText"
    :next-section="'faq'"
  >
    <template #content>
      <div class="certificate-section" aria-label="Main">
        <div class="certificate-section__grid">
          <div
            v-for="(certificateCard, cardIndex) in data.certificationCards"
            :key="cardIndex"
            data-aos="fade-up"
            :data-aos-delay="Math.min(cardIndex, 5) * 100"
            class="certificate-section__card-wrapper"
          >
            <CertificateCard :data="certificateCard" />
          </div>
        </div>
      </div>
    </template>
  </SectionWrapper>
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

  &__card-wrapper {
    height: 100%;
    display: flex;
    flex-direction: column;
  }
}
</style>
