// Define a minimal response type for Strapi API
interface StrapiResponse {
  data?: unknown;
  [key: string]: unknown;
}

export default defineEventHandler(async (event) => {
  const config = useRuntimeConfig();
  const API_URL = config.public.api_url;
  const API_TOKEN = config.public.api_token;

  // Get query parameters from request
  const query = getQuery(event);
  const endpoint = query.endpoint as string;
  const fields = query.fields ? (Array.isArray(query.fields) ? query.fields : [query.fields]) : [];
  const locale = query.locale as string | undefined;
  const isCollection = query.isCollection === 'true' || query.isCollection === true;
  const populates = query.populates ? (Array.isArray(query.populates) ? query.populates : [query.populates]) : [];

  if (!endpoint) {
    throw createError({
      statusCode: 400,
      message: 'Missing endpoint parameter'
    });
  }

  /**
   * Convert dot notation populate array to Strapi populate query parameters
   * @param populates - Array of dot notation strings like ['quickFilter', 'skillCards.skillItems']
   * @returns Object with Strapi populate parameters
   */
  const buildPopulateParams = (populates: string[]): Record<string, string> => {
    const params: Record<string, string> = {};

    if (populates.length === 0) {
      // Default to populate all first-level relations
      params['populate'] = '*';
      return params;
    }

    populates.forEach((path) => {
      // Special case for projectCards.logo to generate populate[projectCards][populate]=logo
      if (path === 'projectCards.logo') {
        params['populate[projectCards][populate]'] = 'logo';
        return;
      }

      const parts = path.split('.');

      if (parts.length === 1) {
        // Simple relation: populate[relation]=*
        params[`populate[${parts[0]}]`] = '*';
      } else {
        // Nested relation: populate[parent][populate][child]=*
        let paramKey = `populate[${parts[0]}]`;

        for (let i = 1; i < parts.length - 1; i++) {
          paramKey += `[populate][${parts[i]}]`;
        }

        paramKey += `[populate][${parts[parts.length - 1]}]`;
        params[paramKey] = '*';
      }
    });

    return params;
  };

  // Construct URL
  const url = new URL(`${API_URL}/${endpoint}`);

  // Add locale parameter if provided
  if (locale) {
    url.searchParams.append('locale', locale);
  }

  // Add populate parameters
  const populateParams = buildPopulateParams(populates);
  Object.entries(populateParams).forEach(([key, value]) => {
    url.searchParams.append(key, value);
  });

  // Make the request to Strapi with the token
  const response: StrapiResponse = await $fetch(url.toString(), {
    method: 'GET',
    headers: {
      Authorization: `Bearer ${API_TOKEN}`
    },
    timeout: 8000 // Same timeout as in original useStrapi
  });

  // Normalize response payload
  const rawData = response?.data ?? response;

  // Helper to pick only requested fields from an object
  const pickFields = (obj: unknown): unknown => {
    if (!obj || typeof obj !== 'object') return obj;
    if (fields.length === 0) return obj;
    const picked: Record<string, unknown> = {};
    for (const key of fields as string[]) {
      if (Object.prototype.hasOwnProperty.call(obj, key)) {
        picked[key] = (obj as Record<string, unknown>)[key];
      }
    }
    return picked;
  };

  // Process response based on whether it's a collection or single type
  if (isCollection) {
    const arr = Array.isArray(rawData) ? rawData : [];
    // If fields requested, filter each item; otherwise return as-is
    return fields.length > 0 ? arr.map(item => pickFields(item)) : arr;
  } else {
    // Single type: optionally filter top-level fields
    return fields.length > 0 ? pickFields(rawData) : rawData;
  }
});
