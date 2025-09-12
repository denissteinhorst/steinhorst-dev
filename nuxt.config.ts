// https://nuxt.com/docs/api/configuration/nuxt-config
export default defineNuxtConfig({
  ssr: true,
  compatibilityDate: '2025-07-15',
  devtools: { enabled: false },
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
    'nuxt-i18n-micro'
  ],
  colorMode: {
    preference: 'light',
    storageKey: 'nuxt-color-mode'
  },
  components: [
    { path: '~/components/sections' },
    { path: '~/components/cards' },
    '~/components'
  ],
  runtimeConfig: {
    api_token: '',
    // Public values (available on client). These can be overridden at runtime via
    // env vars NUXT_PUBLIC_API_BASE and NUXT_PUBLIC_API_URL.
    public: {
      api_base: 'https://cms.steinhorst.dev',
      api_url: 'https://cms.steinhorst.dev/api',
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
  aos: {
    once: true,
  },
  image: {
    quality: 80,
    format: ['webp', 'avif'],
    screens: {
      xs: 320,
      sm: 640,
      md: 768,
      lg: 1024,
      xl: 1280,
      xxl: 1536,
    },
  },
  routeRules: {
    // Static assets with long cache lifetime (1 year)
    '/images/**': {
      headers: {
        'Cache-Control': 'public, max-age=31536000, immutable'
      }
    },
    // Favicon and robots with moderate cache (1 week)
    '/favicon.ico': {
      headers: {
        'Cache-Control': 'public, max-age=604800'
      }
    },
    '/_robots.txt': {
      headers: {
        'Cache-Control': 'public, max-age=604800'
      }
    },
    // General static assets (fonts, etc.) with long cache (1 year)
    '/_nuxt/**': {
      headers: {
        'Cache-Control': 'public, max-age=31536000, immutable'
      }
    }
  },
  i18n: {
    locales: [
      { code: 'de', iso: 'de-DE', dir: 'ltr' },
      { code: 'en', iso: 'en-US', dir: 'ltr' },
    ],
    defaultLocale: 'de',
    translationDir: 'locales',
    meta: true,
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
      script: process.env.NODE_ENV === 'production' ? [
        {
          id: 'usercentrics-cmp',
          src: 'https://web.cmp.usercentrics.eu/ui/loader.js',
          'data-settings-id': 'h94zxBp1utgWJs',
          async: true
        },
        {
          type: 'text/plain',
          'data-usercentrics': 'Hotjar',
          innerHTML: `
            (function(h,o,t,j,a,r){
              h.hj=h.hj||function(){(h.hj.q=h.hj.q||[]).push(arguments)};
              h._hjSettings={hjid:6513298,hjsv:6};
              a=o.getElementsByTagName('head')[0];
              r=o.createElement('script');r.async=1;
              r.src=t+h._hjSettings.hjid+j+h._hjSettings.hjsv;
              a.appendChild(r);
            })(window,document,'https://static.hotjar.com/c/hotjar-','.js?sv=');
          `
        }
      ] : [],
    },
  }
})