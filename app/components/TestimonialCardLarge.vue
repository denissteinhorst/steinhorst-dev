<script setup lang="ts">
const props = defineProps<{ data: RecommendationCard }>();

const { buildImageUrl } = useStrapi();

const avatarUrl = computed<string | undefined>(() => {
  const url = buildImageUrl(props.data.avatar, "small");
  return url === null ? undefined : url;
});

const recommendationText = computed<BlockNode[]>(
  () => (props.data.recommendation ?? []) as BlockNode[]
);
</script>

<template>
  <BaseCard
    class="testimonial-card-large"
    role="listitem"
    :aria-labelledby="`project-${data.id}`"
  >
    <div class="testimonial-card-large__body">
      <!-- AVATAR -->
      <img :src="avatarUrl" alt="Avatar" />

      <!-- RECOMMENDATION -->
      <StrapiBlocksText :nodes="recommendationText" />
    </div>
  </BaseCard>
</template>

<style scoped lang="scss">
$block: "testimonial-card-large";

.#{$block} {
}
</style>
