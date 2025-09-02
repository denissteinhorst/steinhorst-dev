<script setup lang="ts">
const { cmsRequest } = useStrapi();

const { data, pending, error } = await useLazyAsyncData<ImprintSectionResponse>(
  "imprint",
  () => cmsRequest<ImprintSectionResponse>("imprint-section", [])
);

const imprintText = computed<BlockNode[]>(
  () => (data.value?.text ?? []) as BlockNode[]
);
</script>

<template>
  <section v-if="pending" class="imprint-section">
    <div class="imprint-section__container">
      <p class="imprint-section__loading">Loading imprint-section...</p>
    </div>
  </section>

  <section v-else-if="error" class="imprint-section">
    <div class="imprint-section__container">
      <p class="imprint-section__error">Failed to load imprint-section.</p>
    </div>
  </section>

  <section v-else-if="data" class="imprint-section">
    <div class="imprint-section__container">
      <h1 class="imprint-section__title">{{ data.title }}</h1>
      <hr class="imprint-section__divider" />
      <div class="imprint-section__content">
        <StrapiBlocksText :nodes="imprintText" />
      </div>
    </div>
  </section>
</template>

<style scoped lang="scss">
$block: "imprint-section";

.#{$block} {
  padding: 2rem 0;

  &__container {
    position: relative;
    max-width: 80rem;
    margin: 0 auto;
    padding: 0 1rem;

    @media (min-width: 640px) {
      padding: 0 1.5rem;
    }

    @media (min-width: 1024px) {
      padding: 0 2rem;
    }
  }

  &__loading,
  &__error {
    text-align: center;
    padding: 2rem 0;
  }

  &__error {
    color: var(--color-red-600);
  }

  &__title {
    font-size: 2.25rem;
    font-weight: 700;
    line-height: 1.2;
    margin-bottom: 1.5rem;

    @media (min-width: 768px) {
      font-size: 3rem;
    }
  }

  &__divider {
    border: none;
    border-top: 1px solid var(--color-gray-300);
    margin: 2rem 0;
  }

  &__content {
    line-height: 1.7;
  }
}
</style>
