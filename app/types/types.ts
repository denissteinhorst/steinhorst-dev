/** Query shape accepted by the request proxy endpoint. */
export interface RequestProxyQuery {
  endpoint: string;
  fields?: string[];
  locale?: string;
  isCollection?: boolean;
}

/** Raw Strapi response wrapper shape (before our proxy unwraps .data). */
export interface StrapiRawResponse<T = unknown> {
  data?: T;
  [key: string]: unknown;
}

/** ISO-8601 timestamp string, e.g. "2025-08-20T05:33:11.824Z" */
export type ISODateString = string;

/** A minimal localization reference (commonly returned by CMS like Strapi). */
export interface BaseLocalization {
  id: number;
  documentId: string;
  locale: string;
}

/**
 * Base shape for CMS responses.
 * Intentionally omits createdAt unless needed by a specific feature.
 */
export interface BaseResponse<TLocalization = BaseLocalization> {
  id?: number;
  documentId?: string;
  updatedAt?: ISODateString;
  publishedAt?: ISODateString | null;
  locale?: string;
  localizations?: TLocalization[];
}

/** The proxy returns either a single entity or a collection of entities. */
export type RequestProxyPayload<T = unknown> = T | T[];

// Navigation-specific types

/** Allowed HTML link target values. */
export type NavigationLinkTarget = '_self' | '_blank' | '_parent' | '_top';

/** A single navigation item/link. */
export interface NavigationElement {
  id: number;
  title: string;
  link: string; // could be a path or hash (e.g., "/" or "#skills")
  target?: NavigationLinkTarget;
}

/**
 * Navigation payload extending the common base response.
 * localizations follow the same shape as the main type.
 */
export interface NavigationResponse
  extends BaseResponse<NavigationResponse> {
  brandName?: string;
  brandLink?: string;
  specialButton?: string;
  specialLink?: string;
  navigationElements?: NavigationElement[];
}
