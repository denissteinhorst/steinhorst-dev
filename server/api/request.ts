// Define a minimal response type for Strapi API
interface StrapiResponse {
  data?: unknown;
  [key: string]: unknown;
}

export default defineEventHandler(async (event) => {
  const config = useRuntimeConfig();
  const API_URL = config.public.api_url as string;
  const API_TOKEN = (config.api_token as string) || '';

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

    // Group populates by parent to handle multiple children under same parent
    const groupedPopulates = new Map<string, string[]>();
    const simplePopulates: string[] = [];
    const complexPopulates: string[] = [];

    populates.forEach((path) => {
      const parts = path.split('.');

      if (parts.length === 1) {
        simplePopulates.push(path);
      } else if (parts.length === 2) {
        const parent = parts[0];
        const child = parts[1];

        if (!groupedPopulates.has(parent)) {
          groupedPopulates.set(parent, []);
        }
        groupedPopulates.get(parent)!.push(child);
      } else {
        complexPopulates.push(path);
      }
    });

    // Handle simple relations
    simplePopulates.forEach((path) => {
      params[`populate[${path}]`] = '*';
    });

    // Handle grouped two-level relations
    groupedPopulates.forEach((children, parent) => {
      if (children.length === 1) {
        // Single child: populate[parent][populate]=child
        params[`populate[${parent}][populate]`] = children[0];
      } else {
        // Multiple children: populate[parent][populate][child1]=* and populate[parent][populate][child2]=*
        children.forEach((child) => {
          params[`populate[${parent}][populate][${child}]`] = '*';
        });
      }
    });

    // Handle complex (3+ level) relations
    complexPopulates.forEach((path) => {
      const parts = path.split('.');
      let paramKey = `populate[${parts[0]}]`;

      for (let i = 1; i < parts.length - 1; i++) {
        paramKey += `[populate][${parts[i]}]`;
      }

      paramKey += `[populate][${parts[parts.length - 1]}]`;
      params[paramKey] = '*';
    });

    return params;
  };

  if (!API_URL) {
    throw createError({ statusCode: 500, statusMessage: 'API base URL is not configured' });
  }

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
  try {
    const headers: Record<string, string> = {};
    if (API_TOKEN) {
      headers.Authorization = `Bearer ${API_TOKEN}`;
    }
    console.log('🔥 url.toString():', url.toString());

    const response: StrapiResponse = await $fetch(url.toString(), {
      method: 'GET',
      headers,
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
  } catch (err: unknown) {
    // Avoid leaking secrets; include minimal info
    const e = err as { status?: number; response?: { status?: number }; message?: string } | undefined;
    console.error('Strapi proxy error', {
      url: url.toString(),
      status: e?.status || e?.response?.status,
      message: e?.message,
    });
    throw createError({
      statusCode: 502,
      statusMessage: 'Upstream CMS request failed',
    });
  }
});
