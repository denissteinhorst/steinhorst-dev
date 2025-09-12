<script setup lang="ts">
const { t } = useI18n()

const currentYear = new Date().getFullYear()
</script>

<template>
  <footer class="footer-section">
    <div class="footer-section__content">
      <div class="footer-section__grid">
        <p class="footer-section__text">
          &copy; {{ currentYear }} Denis Steinhorst.
          {{ t('footer_section.copyright') }}
        </p>
        <div class="footer-section__links">
          <NuxtLink to="/imprint" class="footer-section__link">
            {{ t('footer_section.imprint') }}
          </NuxtLink>
        </div>
      </div>
    </div>
  </footer>
</template>

<style scoped lang="scss">
$block: 'footer-section';

.#{$block} {
  background-color: #000000;
  color: #d1d5db;
  padding: 1.5rem 0;
  border-top: 1px solid #6b7280;

  &__content {
    max-width: 1200px;
    margin: 0 auto;
  }

  &__grid {
    display: grid;
    grid-template-columns: 1fr auto;
    gap: 1rem;
    align-items: center;
    min-height: 2rem;

    // Mobile: vertical layout
    @media (max-width: 768px) {
      grid-template-columns: 1fr;
      text-align: center;
      gap: 0.75rem;
    }
  }

  &__text {
    font-size: 0.875rem;
    color: #9ca3af;
    display: flex;
    align-items: center;
    padding: 0;
  }

  &__links {
    display: flex;
    gap: 1rem;
    align-items: center;
  }

  &__link {
    font-size: 0.875rem;
    color: #9ca3af;
    text-decoration: none;
    transition: color 0.2s ease;
    display: flex;
    align-items: center;

    &:hover {
      color: #d1d5db;
    }
  }
}
</style>
