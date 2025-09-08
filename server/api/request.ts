interface StrapiResponse {
  data?: unknown;
  [key: string]: unknown;
}

interface QueryParams {
  endpoint: string;
  fields?: string | string[];
  locale?: string;
  isCollection?: string | boolean;
  populates?: string | string[];
}

export default defineEventHandler(async (event) => {
  const config = useRuntimeConfig();
  const apiUrl = config.public.api_url as string;
  const apiToken = config.api_token as string;

  const query = getQuery(event) as QueryParams;
  const { endpoint, fields: rawFields, locale, isCollection: rawIsCollection, populates: rawPopulates } = query;

  const fields = rawFields ? (Array.isArray(rawFields) ? rawFields : [rawFields]) : [];
  const isCollection = rawIsCollection === 'true' || rawIsCollection === true;
  const populates = rawPopulates ? (Array.isArray(rawPopulates) ? rawPopulates : [rawPopulates]) : [];

  if (!endpoint) {
    throw createError({
      statusCode: 400,
      statusMessage: 'Missing endpoint parameter'
    });
  }

  if (!apiUrl) {
    throw createError({
      statusCode: 500,
      statusMessage: 'API base URL is not configured'
    });
  }

  const buildPopulateParams = (populates: string[]): Record<string, string> => {
    if (populates.length === 0) {
      return { populate: '*' };
    }

    const params: Record<string, string> = {};
    const groupedPopulates = new Map<string, string[]>();
    const simplePopulates: string[] = [];
    const complexPopulates: string[] = [];

    populates.forEach((path) => {
      const parts = path.split('.');

      if (parts.length === 1) {
        simplePopulates.push(path);
      } else if (parts.length === 2) {
        const [parent, child] = parts;
        if (!groupedPopulates.has(parent)) {
          groupedPopulates.set(parent, []);
        }
        groupedPopulates.get(parent)!.push(child);
      } else {
        complexPopulates.push(path);
      }
    });

    simplePopulates.forEach((path) => {
      params[`populate[${path}]`] = '*';
    });

    groupedPopulates.forEach((children, parent) => {
      if (children.length === 1) {
        params[`populate[${parent}][populate]`] = children[0];
      } else {
        children.forEach((child) => {
          params[`populate[${parent}][populate][${child}]`] = '*';
        });
      }
    });

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

  const pickFields = (obj: unknown, fields: string[]): unknown => {
    if (!obj || typeof obj !== 'object' || fields.length === 0) return obj;

    const picked: Record<string, unknown> = {};
    for (const key of fields) {
      if (Object.prototype.hasOwnProperty.call(obj, key)) {
        picked[key] = (obj as Record<string, unknown>)[key];
      }
    }
    return picked;
  };

  const url = new URL(`${apiUrl}/${endpoint}`);

  if (locale) {
    url.searchParams.append('locale', locale);
  }

  const populateParams = buildPopulateParams(populates);
  Object.entries(populateParams).forEach(([key, value]) => {
    url.searchParams.append(key, value);
  });

  try {
    const headers: Record<string, string> = {};
    if (apiToken) {
      headers.Authorization = `Bearer ${apiToken}`;
    }

    const response = await $fetch<StrapiResponse>(url.toString(), {
      method: 'GET',
      headers,
      timeout: 8000
    });

    const rawData = response?.data ?? response;

    if (isCollection) {
      const dataArray = Array.isArray(rawData) ? rawData : [];
      return fields.length > 0
        ? dataArray.map(item => pickFields(item, fields))
        : dataArray;
    }

    return pickFields(rawData, fields);
  } catch (error: unknown) {
    const err = error as { status?: number; response?: { status?: number }; message?: string };

    console.error('CMS proxy error', {
      url: url.toString(),
      status: err?.status || err?.response?.status,
      message: err?.message,
    });

    throw createError({
      statusCode: 502,
      statusMessage: 'Upstream CMS request failed',
    });
  }
});
