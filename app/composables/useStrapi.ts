/**
 * Strapi API helper functions
 * @returns {object} - Strapi API helper functions
 */
import type { StrapiImage } from '~/types/types';

export const useStrapi = () => {

  const locale = ref('de'); // TODO: Replace with useI18n() when i18n is set up

  interface IStrapiResponseData {
    [key: string]: unknown;
  }

  /**
   * Retrieve data from Strapi API endpoint via server proxy
   * @param {string} endpoint - API endpoint to fetch from
   * @param {string[]} fields - Optional array of fields to include
   * @param {string} locale - Optional locale parameter (e.g. 'en', 'de'). If not provided, uses the current i18n locale
   * @param {boolean} isCollection - Whether the endpoint is a collection type (default: false)
   * @returns Filtered JSON response from Strapi
   */
  const cmsRequest = async <T = unknown>(
    endpoint: string,
    fields: string[] = [],
    customLocale?: string,
    isCollection: boolean = false
  ): Promise<T> => {
    try {
      // Input validation for endpoint parameter
      if (!endpoint || typeof endpoint !== 'string') {
        throw new Error('Invalid endpoint provided');
      }

      // Create query parameters for the proxy
      const query: Record<string, string | string[] | boolean> = {
        endpoint,
        isCollection
      };

      // Add fields to query if provided
      if (fields.length > 0) {
        query.fields = fields;
      }

      // Add locale to query, preferring:
      // 1. Custom locale if provided
      // 2. Current i18n locale if available
      if (customLocale) {
        query.locale = customLocale;
      } else if (locale.value) {
        query.locale = locale.value;
      }

      // Fetch data through our server proxy
      const response: IStrapiResponseData = await $fetch('/api/request-proxy', {
        method: 'GET',
        query,
        timeout: 8000
      });

      // Process response based on whether it's a collection or single type
      if (isCollection) {
        // For collection types, we expect an array of items
        if (!response || !Array.isArray(response)) {
          return [] as unknown as T;
        }

        // If fields were specified, filter each item in the collection
        if (fields.length > 0) {
          return response.map(item => {
            const filteredItem: Record<string, unknown> = {};
            fields.forEach(field => {
              if (item[field] !== undefined) {
                filteredItem[field] = item[field];
              }
            });
            return filteredItem;
          }) as unknown as T;
        }

        return response as T;
      } else {
        // Original single type handling
        // If fields were specified, filter the response
        if (fields.length > 0 && response) {
          const filteredData: Record<string, unknown> = {};
          fields.forEach(field => {
            if (response[field] !== undefined) {
              filteredData[field] = response[field];
            }
          });
          return filteredData as T;
        }

        return response as T;
      }
    } catch (error) {
      console.error(`Strapi fetch error for endpoint "${endpoint}":`, error);
      throw error;
    }
  };

  /**
   * Build a full image URL from a Strapi image object and desired format key.
   * Uses runtimeConfig public.api_base (or public.api_url) as the base.
   * Falls back to the image.url value if formats are missing.
   */
  const buildImageUrl = (
    image?: StrapiImage | null,
    format: string = 'small'
  ): string | null => {
    if (!image) return null;

    const runtime = useRuntimeConfig();
    const base = (runtime.public && (runtime.public.api_base || runtime.public.api_url)) || '';

    // Try formats first (e.g. image.formats.small.url), then fallback to image.url
    const formats = image.formats as Record<string, { url?: string } | undefined> | undefined;
    const formatObj = formats ? formats[format] : undefined;
    const relative = formatObj?.url ?? image.url ?? null;
    if (!relative) return null;

    // If the URL is already absolute, return it
    if (/^https?:\/\//i.test(relative) || /^\/\//.test(relative)) {
      return relative;
    }

    // Ensure proper slashes when concatenating
    const baseTrim = base.replace(/\/+$/g, '');
    const rel = relative.startsWith('/') ? relative : `/${relative}`;
    return baseTrim ? `${baseTrim}${rel}` : rel;
  };

  return {
    cmsRequest,
    buildImageUrl,
  };
};
