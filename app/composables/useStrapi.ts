import type { StrapiImage } from '~/types/types';

interface StrapiResponseData {
  [key: string]: unknown;
}

interface CmsQueryParams {
  endpoint: string;
  isCollection: boolean;
  fields?: string[];
  populates?: string[];
  locale: string;
}

/**
 * Strapi CMS composable with locale-aware API requests and image URL building
 */
export const useStrapi = () => {
  const { $getLocale } = useI18n();
  const route = useRoute();
  const config = useRuntimeConfig();

  const currentLocale = computed((): string => {
    const locale = $getLocale();
    if (locale) return locale;

    return route.path.startsWith('/en') ? 'en' : 'de';
  });

  const filterFields = <T>(data: Record<string, unknown>, fields: string[]): T => {
    if (fields.length === 0) return data as T;

    return fields.reduce((filtered, field) => {
      if (data[field] !== undefined) {
        filtered[field] = data[field];
      }
      return filtered;
    }, {} as Record<string, unknown>) as T;
  };

  const cmsRequest = async <T = unknown>(
    endpoint: string,
    fields: string[] = [],
    isCollection: boolean = false,
    populates: string[] = []
  ): Promise<T> => {
    if (!endpoint) {
      throw new Error('Invalid endpoint provided');
    }

    const queryParams: CmsQueryParams = {
      endpoint,
      isCollection,
      locale: currentLocale.value
    };

    if (fields.length > 0) queryParams.fields = fields;
    if (populates.length > 0) queryParams.populates = populates;

    try {
      const response = await $fetch<StrapiResponseData>('/api/request', {
        method: 'GET',
        query: queryParams,
        timeout: 8000
      });

      if (isCollection) {
        if (!Array.isArray(response)) return [] as unknown as T;

        return (fields.length > 0
          ? response.map(item => filterFields<Record<string, unknown>>(item as Record<string, unknown>, fields))
          : response
        ) as T;
      }

      return filterFields<T>(response as Record<string, unknown>, fields);
    } catch (error) {
      console.error(`CMS request failed for endpoint "${endpoint}":`, error);
      throw error;
    }
  };

  const buildImageUrl = (image?: StrapiImage | null, format: string = 'small'): string | null => {
    if (!image) return null;

    const baseUrl = config.public?.api_base || config.public?.api_url || '';
    const formats = image.formats as Record<string, { url?: string }> | undefined;
    const imageUrl = formats?.[format]?.url || image.url;

    if (!imageUrl) return null;
    if (/^https?:\/\//.test(imageUrl) || imageUrl.startsWith('//')) return imageUrl;

    const cleanBase = baseUrl.replace(/\/+$/, '');
    const cleanUrl = imageUrl.startsWith('/') ? imageUrl : `/${imageUrl}`;

    return cleanBase ? `${cleanBase}${cleanUrl}` : cleanUrl;
  };

  return {
    cmsRequest,
    buildImageUrl,
    currentLocaleString: currentLocale
  };
};
