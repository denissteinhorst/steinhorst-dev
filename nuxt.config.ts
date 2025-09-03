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
    '@nuxtjs/mdc',
    'nuxt-pdfeasy'
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
  },
  app: {
    head: {
      htmlAttrs: { lang: 'de' },
      title: 'Denis Steinhorst – Fullstack Developer',
      meta: [
        { charset: 'utf-8' },
        {
          name: 'description',
          // German description (page content is German to avoid language mismatch warnings)
          content:
            'Portfolio & Erfahrungen von Denis Steinhorst – Fullstack / Vue & Nuxt fokussierter Entwickler. Projekte, Skills, Referenzen & Kontakt.',
        },
        { property: 'og:type', content: 'website' },
        {
          property: 'og:title',
          content: 'Denis Steinhorst – Fullstack Developer',
        },
        {
          property: 'og:description',
          content:
            'Portfolio & Erfahrungen von Denis Steinhorst – Fullstack / Vue & Nuxt fokussierter Entwickler. Projekte, Skills, Referenzen & Kontakt.',
        },
        {
          property: 'og:image',
          content:
            'https://www.steinhorst.dev/images/og_image.png',
        },
        {
          property: 'og:url',
          content: 'https://www.steinhorst.dev',
        },
        {
          name: 'twitter:card', content: 'summary_large_image'
        },
        {
          name: 'twitter:image', content: 'https://www.steinhorst.dev/images/og_image.png'
        },
        {
          name: 'keywords',
          content:
            'Full Stack Entwickler, Vue.js, Nuxt.js, Node.js, JavaScript, Webentwicklung, Frontend, Backend, Software Engineer, Portfolio, Erfahrungen, Projekte, Referenzen',
        },
        { name: 'robots', content: 'index, follow' },
        { name: 'theme-color', content: '#141517' },
      ],
      link: [
        { rel: 'canonical', href: 'https://www.steinhorst.dev' },
        { rel: 'icon', type: 'image/x-icon', href: '/favicon.ico' }
      ],
      script: [],
    },
  }
})
