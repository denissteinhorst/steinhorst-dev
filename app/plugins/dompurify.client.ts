import DOMPurify from 'dompurify'

interface SanitizeOptions {
  ALLOWED_TAGS?: string[]
  ALLOWED_ATTR?: string[]
  [key: string]: unknown
}

declare module '#app' {
  interface NuxtApp {
    $sanitizeHtml: (html: string, options?: SanitizeOptions) => string
  }
}

export default defineNuxtPlugin(() => {
  return {
    provide: {
      sanitizeHtml: (html: string, options?: SanitizeOptions): string => {
        const defaultConfig: SanitizeOptions = {
          ALLOWED_TAGS: ['strong', 'em', 'span', 'b', 'i'],
          ALLOWED_ATTR: ['class'],
        }

        return DOMPurify.sanitize(html, { ...defaultConfig, ...options }) as unknown as string
      },
    },
  }
})
