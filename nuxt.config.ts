// https://nuxt.com/docs/api/configuration/nuxt-config
export default defineNuxtConfig({
  ssr: true,
  compatibilityDate: '2025-07-15',
  devtools: { enabled: true },
  modules: [
    '@nuxt/eslint',
    '@nuxt/image',
    '@nuxt/ui',
    '@vueuse/nuxt',
    'nuxt-aos',
    '@nuxtjs/seo',
    '@nuxtjs/color-mode',
    'nuxt-strapi-blocks-renderer',
    '@nuxtjs/mdc'
  ],
  colorMode: {
    preference: 'light',
    storageKey: 'nuxt-color-mode'
  },
  runtimeConfig: {
    public: {
      api_base: process.env.STRAPI_BASE || 'http://localhost:1337',
      api_url: process.env.STRAPI_URL || 'http://localhost:1337',
      api_token: process.env.STRAPI_TOKEN || 'public',
    }
  },
  imports: {
    dirs: ['types'],
    imports: [
      {
        from: '#strapi-blocks-renderer/types',
        name: 'BlockNode',
        type: true
      }
    ]
  },
  vite: {
    css: {
      preprocessorOptions: {
        scss: {
          additionalData: '@use "~/assets/scss/theme.scss" as *;'
        }
      }
    }
  }
})