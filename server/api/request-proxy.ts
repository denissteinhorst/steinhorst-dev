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

  if (!endpoint) {
    throw createError({
      statusCode: 400,
      message: 'Missing endpoint parameter'
    });
  }

  // Construct URL
  const url = new URL(`${API_URL}/${endpoint}`);

  // Add locale parameter if provided
  if (locale) {
    url.searchParams.append('locale', locale);
  }

  // Always add populate=* to get related content
  url.searchParams.append('populate', '*');

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
