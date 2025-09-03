<script setup lang="ts">
// Demo state for SkeletonLoader
const showContent = ref(false);
const selectedSize = ref<"xs" | "sm" | "md" | "lg" | "xl">("md");
const textLines = ref(3);

// Auto-toggle content every 3 seconds
onMounted(() => {
  setInterval(() => {
    showContent.value = !showContent.value;
  }, 3000);
});
</script>

<template>
  <div class="debug">
    <color-selector />
    <div class="container mx-auto px-4 py-8 space-y-12">
      <!-- SkeletonLoader Demo Section -->
      <section class="space-y-6">
        <div class="flex items-center justify-between">
          <h1 class="text-3xl font-bold">SkeletonLoader Demo</h1>
          <div class="flex items-center gap-4">
            <span class="text-sm">Auto-toggle every 3s</span>
            <div class="flex items-center gap-2">
              <span
                class="w-2 h-2 rounded-full bg-green-500 animate-pulse"
              ></span>
              <span class="text-sm">{{
                showContent ? "Content" : "Loading"
              }}</span>
            </div>
          </div>
        </div>

        <!-- Controls -->
        <div
          class="flex flex-wrap gap-4 p-4 bg-gray-50 dark:bg-gray-800 rounded-lg"
        >
          <div class="flex items-center gap-2">
            <label class="text-sm font-medium">Size:</label>
            <select v-model="selectedSize" class="px-2 py-1 rounded border">
              <option value="xs">XS</option>
              <option value="sm">SM</option>
              <option value="md">MD</option>
              <option value="lg">LG</option>
              <option value="xl">XL</option>
            </select>
          </div>
          <div class="flex items-center gap-2">
            <label class="text-sm font-medium">Text Lines:</label>
            <input
              v-model.number="textLines"
              type="number"
              min="1"
              max="10"
              class="w-16 px-2 py-1 rounded border"
            />
          </div>
        </div>

        <!-- Demo Grid -->
        <div class="grid gap-8 md:grid-cols-2 lg:grid-cols-3">
          <!-- Headline Demo -->
          <div class="space-y-4 p-4 border rounded-lg">
            <h3 class="text-lg font-semibold">Headline</h3>
            <div v-if="!showContent">
              <SkeletonLoader variant="headline" :size="selectedSize" />
            </div>
            <div v-else>
              <h1 class="text-3xl font-bold">This is a Sample Headline</h1>
            </div>
          </div>

          <!-- Subheadline Demo -->
          <div class="space-y-4 p-4 border rounded-lg">
            <h3 class="text-lg font-semibold">Subheadline</h3>
            <div v-if="!showContent">
              <SkeletonLoader variant="subheadline" :size="selectedSize" />
            </div>
            <div v-else>
              <h2 class="text-xl font-semibold">This is a subheadline</h2>
            </div>
          </div>

          <!-- Text Demo -->
          <div class="space-y-4 p-4 border rounded-lg">
            <h3 class="text-lg font-semibold">Text ({{ textLines }} lines)</h3>
            <div v-if="!showContent">
              <SkeletonLoader
                variant="text"
                :size="selectedSize"
                :lines="textLines"
              />
            </div>
            <div v-else>
              <p class="text-gray-600 dark:text-gray-300 leading-relaxed">
                This is sample text content that would normally be loaded from
                an API. It can span multiple lines and represents typical
                paragraph content that users would see in your application. Each
                line demonstrates how the skeleton loader adapts to different
                content lengths and maintains proper spacing throughout the
                loading experience.
              </p>
            </div>
          </div>

          <!-- Avatar Demo -->
          <div class="space-y-4 p-4 border rounded-lg">
            <h3 class="text-lg font-semibold">Avatar</h3>
            <div class="flex items-center gap-3">
              <div v-if="!showContent">
                <SkeletonLoader variant="avatar" :size="selectedSize" />
              </div>
              <div
                v-else
                class="w-10 h-10 bg-primary-500 rounded-full flex items-center justify-center"
              >
                <span class="text-white font-semibold">DS</span>
              </div>
              <div v-if="!showContent">
                <SkeletonLoader variant="text" :size="selectedSize" />
              </div>
              <div v-else>
                <span class="font-medium">Denis Steinhorst</span>
              </div>
            </div>
          </div>

          <!-- Button Demo -->
          <div class="space-y-4 p-4 border rounded-lg">
            <h3 class="text-lg font-semibold">Button</h3>
            <div v-if="!showContent">
              <SkeletonLoader variant="button" :size="selectedSize" />
            </div>
            <div v-else>
              <UButton>Click me</UButton>
            </div>
          </div>

          <!-- Card Demo -->
          <div class="space-y-4 p-4 border rounded-lg">
            <h3 class="text-lg font-semibold">Card</h3>
            <div v-if="!showContent">
              <SkeletonLoader variant="card" :size="selectedSize" />
            </div>
            <div v-else>
              <UCard>
                <template #header>
                  <h3 class="font-semibold">Sample Card</h3>
                </template>
                <p class="text-gray-600 dark:text-gray-300">
                  This is a sample card content that would be loaded
                  dynamically.
                </p>
              </UCard>
            </div>
          </div>

          <!-- Input Demo -->
          <div class="space-y-4 p-4 border rounded-lg">
            <h3 class="text-lg font-semibold">Input</h3>
            <div v-if="!showContent">
              <SkeletonLoader variant="input" :size="selectedSize" />
            </div>
            <div v-else>
              <input
                type="text"
                placeholder="Enter your name..."
                class="w-full px-3 py-2 border rounded-md"
              />
            </div>
          </div>

          <!-- Complex Layout Demo -->
          <div
            class="space-y-4 p-4 border rounded-lg md:col-span-2 lg:col-span-3"
          >
            <h3 class="text-lg font-semibold">Complex Layout Example</h3>
            <div v-if="!showContent" class="space-y-4">
              <div class="flex items-start gap-4">
                <SkeletonLoader variant="avatar" size="lg" />
                <div class="flex-1 space-y-2">
                  <SkeletonLoader variant="headline" size="sm" />
                  <SkeletonLoader variant="text" :lines="2" />
                  <div class="flex gap-2">
                    <SkeletonLoader variant="button" size="sm" />
                    <SkeletonLoader variant="button" size="sm" />
                  </div>
                </div>
              </div>
              <SkeletonLoader variant="card" size="sm" />
            </div>
            <div v-else class="space-y-4">
              <div class="flex items-start gap-4">
                <div
                  class="w-12 h-12 bg-primary-500 rounded-full flex items-center justify-center"
                >
                  <span class="text-white font-semibold">JS</span>
                </div>
                <div class="flex-1 space-y-2">
                  <h2 class="text-xl font-semibold">John Smith</h2>
                  <p class="text-gray-600 dark:text-gray-300">
                    Senior Frontend Developer with 5+ years of experience in
                    React and Vue.js. Passionate about creating user-friendly
                    interfaces and modern web applications.
                  </p>
                  <div class="flex gap-2">
                    <UButton size="sm">View Profile</UButton>
                    <UButton size="sm" variant="outline">Send Message</UButton>
                  </div>
                </div>
              </div>
              <UCard>
                <div class="space-y-2">
                  <h3 class="font-semibold">Latest Project</h3>
                  <p class="text-gray-600 dark:text-gray-300">
                    Built a modern e-commerce platform using Nuxt 3, TypeScript,
                    and Tailwind CSS.
                  </p>
                </div>
              </UCard>
            </div>
          </div>
        </div>
      </section>
    </div>
  </div>
</template>

<style scoped lang="scss">
.debug {
  min-height: 100vh;
  background: var(--color-bg);
  color: var(--color-text);

  .container {
    max-width: 1200px;
  }

  h1,
  h2,
  h3 {
    color: var(--color-heading);
  }

  .border {
    border-color: var(--color-border);
  }

  select,
  input {
    background: var(--color-surface);
    color: var(--color-text);
    border-color: var(--color-border);

    &:focus {
      outline: 2px solid var(--color-primary);
      outline-offset: -2px;
    }
  }
}
</style>
