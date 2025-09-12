import type { StrapiImage } from '~/types/types'

interface StrapiResponseData {
  [key: string]: unknown
}

interface CmsQueryParams {
  endpoint: string
  isCollection: boolean
  fields?: string[]
  populates?: string[]
  locale: string
}

/**
 * Strapi CMS integration composable for fetching content via server proxy
 *
 * @example
 * const { cmsRequest, buildImageUrl } = useStrapi()
 *
 * * // Fetch single content type
 * const page = await cmsRequest<PageData>('api/home-page', [])
 *
 * * // Fetch single content type with specific fields
 * const page = await cmsRequest<PageData>('api/home-page', ["text", "title"])
 *
 * * // Fetch collection with deep populates (card.image, author.avatar)
 * const posts = await cmsRequest<Post[]>('api/blog-posts', ["text", "title", "card"], true, ["card.image", "author.avatar"])
 *
 * @returns Object containing CMS request functions and utilities
 */
export const useStrapi = () => {
  const { $getLocale } = useI18n()
  const route = useRoute()
  const config = useRuntimeConfig()

  /**
   * Computed locale value based on i18n or route path
   * Falls back to route-based detection if i18n locale is unavailable
   */
  const currentLocale = computed((): string => {
    const locale = $getLocale()
    if (locale) return locale

    // Fallback: detect locale from route path
    return route.path.startsWith('/en') ? 'en' : 'de'
  })

  /**
   * Filters object to include only specified fields
   *
   * @param data - Source data object to filter
   * @param fields - Array of field names to include (empty = return all)
   * @returns Filtered object with only requested fields
   */
  const filterFields = <T>(data: Record<string, unknown>, fields: string[]): T => {
    if (fields.length === 0) return data as T

    return fields.reduce(
      (filtered, field) => {
        if (data[field] !== undefined) {
          filtered[field] = data[field]
        }
        return filtered
      },
      {} as Record<string, unknown>,
    ) as T
  }

  /**
   * Fetches content from Strapi CMS via server proxy
   *
   * @param endpoint - Strapi API endpoint path (e.g., 'api/home-page', 'api/articles')
   * @param fields - Array of field names to include in response (default: all fields)
   * @param isCollection - Whether endpoint returns array (collection) or single object
   * @param populates - Array of relation fields to populate (e.g., ['image', 'author.avatar'])
   * @returns Promise resolving to typed CMS content
   *
   * @example
   * * // Single content type with specific fields
   * const page = await cmsRequest<PageData>('api/home-page', ['title', 'content'])
   *
   * * // Collection with relations populated
   * const posts = await cmsRequest<Post[]>('api/blog-posts', [], true, ['image', 'author'])
   */
  const cmsRequest = async <T = unknown>(
    endpoint: string,
    fields: string[] = [],
    isCollection: boolean = false,
    populates: string[] = [],
  ): Promise<T> => {
    if (!endpoint) {
      throw new Error('Invalid endpoint provided')
    }

    // Build query parameters for server proxy
    const queryParams: CmsQueryParams = {
      endpoint,
      isCollection,
      locale: currentLocale.value,
    }

    // Add optional parameters if provided
    if (fields.length > 0) queryParams.fields = fields
    if (populates.length > 0) queryParams.populates = populates

    try {
      const response = await $fetch<StrapiResponseData>('/api/request', {
        method: 'GET',
        query: queryParams,
        timeout: 8000,
      })

      if (isCollection) {
        if (!Array.isArray(response)) return [] as unknown as T

        // Apply field filtering to each item in collection if requested
        return (
          fields.length > 0
            ? response.map((item) =>
                filterFields<Record<string, unknown>>(item as Record<string, unknown>, fields),
              )
            : response
        ) as T
      }

      // Apply field filtering for single content type
      return filterFields<T>(response as Record<string, unknown>, fields)
    } catch (error) {
      console.error(`CMS request failed for endpoint "${endpoint}":`, error)
      throw error
    }
  }

  /**
   * Builds optimized image URL from Strapi image object
   *
   * @param image - Strapi image object with formats
   * @param format - Image format size ('thumbnail', 'small', 'medium', 'large')
   * @returns Full image URL or null if image/format not found
   *
   * @example
   * const imageUrl = buildImageUrl(strapiImage, 'medium')
   * const thumbnailUrl = buildImageUrl(strapiImage, 'thumbnail')
   */
  const buildImageUrl = (image?: StrapiImage | null, format: string = 'small'): string | null => {
    if (!image) return null

    const baseUrl = config.public?.api_base || config.public?.api_url || ''
    const formats = image.formats as Record<string, { url?: string }> | undefined

    // Try to get specific format, fallback to original URL
    const imageUrl = formats?.[format]?.url || image.url

    if (!imageUrl) return null

    // Return absolute URLs as-is
    if (/^https?:\/\//.test(imageUrl) || imageUrl.startsWith('//')) return imageUrl

    // Build full URL for relative paths
    const cleanBase = baseUrl.replace(/\/+$/, '')
    const cleanUrl = imageUrl.startsWith('/') ? imageUrl : `/${imageUrl}`

    return cleanBase ? `${cleanBase}${cleanUrl}` : cleanUrl
  }

  return {
    cmsRequest,
    buildImageUrl,
    currentLocaleString: currentLocale,
  }
}
