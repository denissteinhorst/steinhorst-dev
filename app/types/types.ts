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

// Reusable Strapi image shapes (matches common Strapi media object)
export interface StrapiImageFormat {
  ext?: string | null;
  url?: string;
  hash?: string;
  mime?: string;
  name?: string;
  path?: string | null;
  size?: number; // human-friendly (KB/MB) numeric value if available
  width?: number;
  height?: number;
  sizeInBytes?: number;
}

export type StrapiImageFormats = Record<string, StrapiImageFormat | undefined> | undefined;

export interface StrapiImage {
  id?: number;
  documentId?: string;
  name?: string;
  alternativeText?: string | null;
  caption?: string | null;
  width?: number;
  height?: number;
  formats?: StrapiImageFormats;
  hash?: string;
  ext?: string | null;
  mime?: string | null;
  size?: number | null;
  url?: string | null;
  previewUrl?: string | null;
  provider?: string | null;
  provider_metadata?: unknown;
  createdAt?: ISODateString;
  updatedAt?: ISODateString;
  publishedAt?: ISODateString | null;
}

// Hero section specific types (all fields optional by request)
export interface HeroTag {
  id?: number;
  text?: string;
}

export type HeroLinkType = 'button' | 'anchor' | string;

export interface HeroLink {
  id?: number;
  type?: HeroLinkType;
  icon?: string | null;
  text?: string | null;
  link?: string | null;
  target?: NavigationLinkTarget;
  tooltip?: string | null;
}

/**
 * Hero section payload. Everything is optional to match flexible CMS responses.
 */
export interface HeroSectionResponse extends BaseResponse<HeroSectionResponse> {
  titleBefore?: string;
  emphasis?: string;
  titleAfter?: string;
  text?: unknown[]; // rich text blocks - keep generic to avoid coupling
  jumpmark?: string;
  heroTags?: HeroTag[];
  heroLinks?: HeroLink[];
  image?: StrapiImage | null;
}

// Skills section specific types
export interface SkillItem {
  id?: number;
  title?: string;
}

export interface SkillCard {
  id?: number;
  title?: string;
  skillItems?: SkillItem[];
}

export interface QuickFilter {
  id?: number;
  toggle?: string;
  icon?: string;
  text?: string;
  placeholder?: string;
  hintDefault?: string;
  hintSuccess?: string;
  hintError?: string;
  buttonTextSuccess?: string;
  buttonTextError?: string;
  link?: string;
  target?: NavigationLinkTarget;
}

/**
 * Skills section payload. Everything is optional to match flexible CMS responses.
 */
export interface SkillSectionResponse extends BaseResponse<SkillSectionResponse> {
  title?: string;
  text?: unknown[];
  footerText?: unknown[];
  jumpmark?: string;
  quickFilter?: QuickFilter;
  skillCards?: SkillCard[];
}

// Personality section specific types
export type PersonalityCardVariant = 'polarChart' | 'barChart' | string;

/** Rich text content block structure from CMS */
export interface RichTextBlock {
  type: string;
  format?: string;
  children?: RichTextBlock[];
  text?: string;
}

export interface PolarChartTooltip {
  id: number;
  title: string;
  text: RichTextBlock[];
  percentage: number;
}

export interface BarChartTooltip {
  id: number;
  title: string;
  innerSelf: string;
  outerSelf: string;
  text: RichTextBlock[];
  innerValue: number;
  outerValue: number;
}

export interface PersonalityCard {
  id?: number;
  title?: string;
  variant?: PersonalityCardVariant;
  subtitle?: string;
  text?: string;
  polarChartTooltips?: PolarChartTooltip[];
  barChartTooltips?: BarChartTooltip[];
}

/**
 * Personality section payload. Everything is optional to match flexible CMS responses.
 */
export interface PersonalitySectionResponse extends BaseResponse<PersonalitySectionResponse> {
  title?: string;
  text?: unknown[]; // rich text blocks - keep generic to avoid coupling
  jumpmark?: string;
  personalityCards?: PersonalityCard[];
}

// Job badge specific types
/**
 * Job badge payload. Mirrors the CMS shape and extends the common base.
 */
export interface JobBadgeResponse extends BaseResponse<JobBadgeResponse> {
  isEnabled?: boolean;
  text?: string; // display text (e.g., label or icon class depending on CMS usage)
  icon?: string; // optional icon name or class
  link?: string; // internal route or hash (e.g., "#contact")
}

// Project section specific types

/** Individual project card representing a company/project experience */
export interface ProjectCard {
  id?: number;
  title?: string;
  text?: string;
  tagList?: RichTextBlock[];
  referral?: string;
  link?: string;
  target?: NavigationLinkTarget;
  company?: string;
  logo?: StrapiImage | null;
}

/** Item within the last project card content */
export interface LastProjectCardItem {
  name?: string;
  type?: string;
}

/** Content structure for the last project card */
export interface LastProjectCardContent {
  items?: LastProjectCardItem[];
}

/** Special last project card for honorable mentions */
export interface LastProjectCard {
  id?: number;
  title?: string;
  text?: string;
  content?: LastProjectCardContent;
}

/**
 * Project section payload. Everything is optional to match flexible CMS responses.
 */
export interface ProjectSectionResponse extends BaseResponse<ProjectSectionResponse> {
  title?: string;
  text?: unknown[]; // rich text blocks - keep generic to avoid coupling
  placeholder?: string;
  jumpmark?: string;
  projectCards?: ProjectCard[];
  lastProjectCard?: LastProjectCard;
  footnote?: unknown[]; // rich text blocks - keep generic to avoid coupling
}

// Experience section specific types

/** Individual experience card representing a professional role */
export interface ExperienceCard {
  id?: number;
  period?: string;
  company?: string | null;
  link?: string | null;
  target?: NavigationLinkTarget;
  position?: string | null;
  text?: RichTextBlock[];
  duty?: RichTextBlock[];
  learning?: RichTextBlock[];
  logo?: StrapiImage | null;
}

/**
 * Experience section payload. Everything is optional to match flexible CMS responses.
 */
export interface ExperienceSectionResponse extends BaseResponse<ExperienceSectionResponse> {
  title?: string;
  text?: unknown[]; // rich text blocks - keep generic to avoid coupling
  contactToggle?: string;
  expandToggle?: string;
  collapseToggle?: string;
  jumpmark?: string;
  experienceCards?: ExperienceCard[];
}

/** Individual certificate/award card */
export interface CertificateCard {
  id?: number;
  title?: string;
  text?: unknown[];
  linkText?: string;
  link?: string;
  target?: NavigationLinkTarget;
  toolTip?: string; // CMS field uses "toolTip" casing
  logo?: StrapiImage | null; // similar to ExperienceCard
  bgColor: string;
}

/**
 * Certificate section payload. Everything is optional to match flexible CMS responses.
 */
export interface CertificateSectionResponse extends BaseResponse<CertificateSectionResponse> {
  title?: string;
  text?: unknown[]; // rich text blocks - keep generic to avoid coupling
  jumpmark?: string;
  certificationCards?: CertificateCard[];
}

/** Individual FAQ item */
export interface FaqItem {
  order: number;
  id: number;
  question: string;
  answer: string;
}

/**
 * FAQ section payload. Everything is optional to match flexible CMS responses.
 */
export interface FaqSectionResponse extends BaseResponse<FaqSectionResponse> {
  title?: string;
  text?: unknown[]; // rich text blocks - keep generic to avoid coupling
  jumpmark?: string;
  faqItems?: FaqItem[];
}

// Testimonial section specific types

/** Individual recommendation card from colleagues/clients */
export interface RecommendationCard {
  id?: number;
  author?: string;
  position?: string;
  company?: string;
  relation?: string | null;
  recommendation?: unknown[];
  isTranslated?: boolean | null;
  platform?: string;
  postDate?: string;
  summary?: string;
  avatar?: StrapiImage | null;
}

/**
 * Testimonial section payload. Everything is optional to match flexible CMS responses.
 */
export interface TestimonialSectionResponse extends BaseResponse<TestimonialSectionResponse> {
  title?: string;
  text?: unknown[]; // rich text blocks - keep generic to avoid coupling
  jumpmark?: string;
  recommendationCards?: RecommendationCard[];
}
