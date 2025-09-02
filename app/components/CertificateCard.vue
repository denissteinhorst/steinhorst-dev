<script setup lang="ts">
const props = defineProps<{ data: CertificateCard }>();

const { buildImageUrl } = useStrapi();

const logoUrl = computed<string | undefined>(() => {
  const url = buildImageUrl(props.data.logo, "small");
  return url === null ? undefined : url;
});
</script>

<template>
  <BaseCard
    class="certificate-card"
    role="listitem"
    :aria-labelledby="`certificate-${data.id}`"
  >
    <div class="certificate-card__content-wrapper">
      <div class="certificate-card__header">
        <div
          class="certificate-card__logo-container"
          :style="{
            backgroundColor: data.bgColor ? `#${data.bgColor}` : undefined,
          }"
        >
          <img
            v-if="data.logo"
            :src="logoUrl"
            :alt="'Zertifikat Logo von ' + data.title"
            class="certificate-card__logo-image"
          />
          <UIcon
            v-else
            name="i-heroicons-academic-cap"
            class="certificate-card__logo-icon"
            aria-hidden="true"
          />
        </div>
        <div class="certificate-card__content">
          <h6 class="certificate-card__title">
            {{ data.title }}
          </h6>
        </div>
      </div>

      <p class="certificate-card__description">
        {{ data.text }}
      </p>
    </div>

    <div class="certificate-card__actions">
      <UTooltip
        v-if="data.link && data.toolTip"
        :text="data.toolTip"
        :delay-duration="0"
        :content="{ side: 'top', sideOffset: 6 }"
      >
        <UButton
          :to="data.link"
          variant="ghost"
          color="secondary"
          size="xs"
          class="certificate-card__button"
          target="_blank"
          rel="noopener noreferrer"
          :aria-label="`${data.link} (öffnet in neuem Tab)`"
        >
          <UIcon
            name="i-heroicons-arrow-top-right-on-square"
            class="certificate-card__button-icon"
            aria-hidden="true"
          />
          <span class="certificate-card__button-text">Anzeigen</span>
          <span class="sr-only">(öffnet in neuem Tab)</span>
        </UButton>
      </UTooltip>
      <UButton
        v-else-if="data.link"
        :to="data.link"
        variant="ghost"
        color="secondary"
        size="xs"
        class="certificate-card__button"
        target="_blank"
        rel="noopener noreferrer"
        :aria-label="`${data.link} (öffnet in neuem Tab)`"
      >
        <UIcon
          name="i-heroicons-arrow-top-right-on-square"
          class="certificate-card__button-icon"
          aria-hidden="true"
        />
        <span class="certificate-card__button-text">Anzeigen</span>
        <span class="sr-only">(öffnet in neuem Tab)</span>
      </UButton>
    </div>

    <span aria-hidden="true" class="certificate-card__highlight"></span>
  </BaseCard>
</template>

<style scoped lang="scss">
$block: "certificate-card";

.#{$block} {
  position: relative;
  display: flex;
  flex-direction: column;
  height: 100%;

  &__content-wrapper {
    display: flex;
    flex-direction: column;
    flex: 1;
  }

  &__header {
    display: flex;
    align-items: flex-start;
    gap: 1rem;
    height: 4rem;
    margin-bottom: 3rem;
  }

  &__logo-container {
    display: flex;
    height: 4rem;
    width: 4rem;
    flex-shrink: 0;
    align-items: center;
    justify-content: center;
    border-radius: 0.75rem;
    overflow: hidden;
    border: 1px solid rgb(229 231 235 / 0.7);
    box-shadow: 0 1px 2px 0 rgb(0 0 0 / 0.05);
    transition: transform 0.3s ease;

    @at-root .dark #{&} {
      border: 1px solid rgb(55 65 81 / 0.6);
    }

    :global(.group:hover) & {
      transform: scale(1.05);
    }
  }

  &__logo-image {
    height: 100%;
    width: 100%;
    object-fit: contain;
    padding: 0.25rem;
  }

  &__logo-icon {
    width: 1.5rem;
    height: 1.5rem;
    color: rgb(37 99 235);

    @at-root .dark #{&} {
      color: rgb(96 165 250);
    }
  }

  &__content {
    flex: 1;
    min-width: 0;
    display: flex;
    align-items: flex-start;
    height: 100%;
  }

  &__title {
    font-size: 15px;
    font-weight: 600;
    line-height: 1.375;
    color: #111827;
    margin: 0;

    @at-root .dark #{&} {
      color: #ffffff;
    }
  }

  &__description {
    font-size: 1rem;
    line-height: 1.625;
    color: #4b5563;
    margin: 0 0 1rem 0;
    flex: 1;

    @at-root .dark #{&} {
      color: #d1d5db;
    }
  }

  &__actions {
    position: absolute;
    bottom: 25px;
    right: 25px;
    display: flex;
    justify-content: flex-end;
    align-items: flex-end;
  }

  &__button {
    gap: 0.25rem;
  }

  &__button-icon {
    width: 1rem;
    height: 1rem;
  }

  &__button-text {
    font-weight: 500;
  }

  &__highlight {
    pointer-events: none;
    position: absolute;
    left: 0;
    right: 0;
    bottom: 0;
    height: 1px;
    background: linear-gradient(
      to right,
      transparent,
      rgb(37 99 235 / 0.4),
      transparent
    );
    opacity: 0;
    transition: opacity 0.3s ease;

    :global(.group:hover) & {
      opacity: 1;
    }
  }
}
</style>
