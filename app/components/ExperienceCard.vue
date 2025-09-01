<script setup lang="ts">
defineProps<{ data: ProjectCard }>();

const { buildImageUrl } = useStrapi();
</script>

<template>
  <div v-if="data" class="experience-card">
    <small>
      <pre>{{ data }}</pre>
    </small>
  </div>
</template>

<style scoped lang="scss">
$block: "experience-card";

.#{$block} {
}
</style>
