// UI helper types (centralized for reuse across components)
import type { BlockNode } from '#strapi-blocks-renderer/types'

/** HTML heading levels used by UI components. */
export type HeadingLevel = 'h1' | 'h2' | 'h3' | 'h4' | 'h5' | 'h6'

/** Common text alignment options for UI. */
export type TextAlignment = 'left' | 'center' | 'right'

/** Renderer-ready rich text node list (from nuxt-strapi-blocks-renderer). */
export type RichTextNodes = BlockNode[]

/** ISO-8601 timestamp string, e.g. "2025-08-20T05:33:11.824Z" */
export type ISODateString = string

/** A minimal localization reference (commonly returned by CMS like Strapi). */
export interface BaseLocalization {
  id: number
  documentId: string
  locale: string
}

/**
 * Base shape for CMS responses.
 * Intentionally omits createdAt unless needed by a specific feature.
 */
export interface BaseResponse<TLocalization = BaseLocalization> {
  id?: number
  documentId?: string
  updatedAt?: ISODateString
  publishedAt?: ISODateString | null
  locale?: string
  localizations?: TLocalization[]
}

/** The proxy returns either a single entity or a collection of entities. */
export type RequestProxyPayload<T = unknown> = T | T[]

// Navigation-specific types

/** Allowed HTML link target values. */
export type NavigationLinkTarget = '_self' | '_blank' | '_parent' | '_top'

/** A single navigation item/link. */
export interface NavigationElement {
  id: number
  title: string
  link: string // could be a path or hash (e.g., "/" or "#skills")
  target?: NavigationLinkTarget
}

/**
 * Navigation payload extending the common base response.
 * localizations follow the same shape as the main type.
 */
export interface NavigationResponse extends BaseResponse<NavigationResponse> {
  brandName?: string
  brandLink?: string
  specialButton?: string
  specialLink?: string
  navigationElements?: NavigationElement[]
}

// Reusable Strapi image shapes (matches common Strapi media object)

/** Image format metadata for different sizes (thumbnail, small, medium, large). */
export interface StrapiImageFormat {
  ext?: string | null
  url?: string
  hash?: string
  mime?: string
  name?: string
  path?: string | null
  size?: number // human-friendly (KB/MB) numeric value if available
  width?: number
  height?: number
  sizeInBytes?: number
}

/** Collection of image formats keyed by size name (e.g., 'thumbnail', 'small'). */
export type StrapiImageFormats = Record<string, StrapiImageFormat | undefined> | undefined

/** Complete Strapi media object containing image metadata and format variants. */
export interface StrapiImage {
  id?: number
  documentId?: string
  name?: string
  alternativeText?: string | null
  caption?: string | null
  width?: number
  height?: number
  formats?: StrapiImageFormats
  hash?: string
  ext?: string | null
  mime?: string | null
  size?: number | null
  url?: string | null
  previewUrl?: string | null
  provider?: string | null
  provider_metadata?: unknown
  createdAt?: ISODateString
  updatedAt?: ISODateString
  publishedAt?: ISODateString | null
}

// Hero section specific types (all fields optional by request)

/** Individual tag/badge displayed in the hero section. */
export interface HeroTag {
  id?: number
  text?: string
}

/** Type of hero link for styling and behavior differentiation. */
export type HeroLinkType = 'button' | 'anchor' | string

/** Interactive link/button element in the hero section. */
export interface HeroLink {
  id?: number
  type?: HeroLinkType
  icon?: string | null
  text?: string | null
  link?: string | null
  target?: NavigationLinkTarget
  tooltip?: string | null
}

/**
 * Hero section payload. Everything is optional to match flexible CMS responses.
 */
export interface HeroSectionResponse extends BaseResponse<HeroSectionResponse> {
  titleBefore?: string
  emphasis?: string
  titleAfter?: string
  text?: RichTextNodes // CMS rich text blocks ready for renderer
  jumpmark?: string
  heroTags?: HeroTag[]
  heroLinks?: HeroLink[]
  image?: StrapiImage | null
}

// Skills section specific types

/** Individual skill item within a skill category. */
export interface SkillItem {
  id?: number
  title?: string
}

/** Skill category card containing multiple skill items. */
export interface SkillCard {
  id?: number
  title?: string
  skillItems?: SkillItem[]
}

/** Interactive filter component for skill search functionality. */
export interface QuickFilter {
  id?: number
  toggle?: string
  icon?: string
  text?: string
  placeholder?: string
  hintDefault?: string
  hintSuccess?: string
  hintError?: string
  buttonTextSuccess?: string
  buttonTextError?: string
  link?: string
  target?: NavigationLinkTarget
}

/**
 * Skills section payload. Everything is optional to match flexible CMS responses.
 */
export interface SkillSectionResponse extends BaseResponse<SkillSectionResponse> {
  title?: string
  text?: RichTextNodes
  footerText?: RichTextNodes
  jumpmark?: string
  quickFilter?: QuickFilter
  skillCards?: SkillCard[]
}

// Personality section specific types

/** Chart type variant for personality cards (polar or bar chart). */
export type PersonalityCardVariant = 'polarChart' | 'barChart' | string

/** Rich text content block structure from CMS */
export interface RichTextBlock {
  type: string
  format?: string
  children?: RichTextBlock[]
  text?: string
}

/** Tooltip data for polar chart segments in personality assessment. */
export interface PolarChartTooltip {
  id: number
  title: string
  text: RichTextBlock[]
  percentage: number
}

/** Tooltip data for bar chart comparisons in personality assessment. */
export interface BarChartTooltip {
  id: number
  title: string
  innerSelf: string
  outerSelf: string
  text: RichTextBlock[]
  innerValue: number
  outerValue: number
}

/** Personality assessment card with chart data and tooltips. */
export interface PersonalityCard {
  id?: number
  title?: string
  variant?: PersonalityCardVariant
  subtitle?: string
  text?: string
  polarChartTooltips?: PolarChartTooltip[]
  barChartTooltips?: BarChartTooltip[]
}

/**
 * Personality section payload. Everything is optional to match flexible CMS responses.
 */
export interface PersonalitySectionResponse extends BaseResponse<PersonalitySectionResponse> {
  title?: string
  text?: RichTextNodes
  jumpmark?: string
  personalityCards?: PersonalityCard[]
}

// Job badge specific types
/**
 * Job badge payload. Mirrors the CMS shape and extends the common base.
 */
export interface JobBadgeResponse extends BaseResponse<JobBadgeResponse> {
  isEnabled?: boolean
  text?: string // display text (e.g., label or icon class depending on CMS usage)
  icon?: string // optional icon name or class
  link?: string // internal route or hash (e.g., "#contact")
}

// Project section specific types

/** Individual project card representing a company/project experience */
export interface ProjectCard {
  id?: number
  title?: string
  text?: string
  tagList?: RichTextBlock[]
  referral?: string
  link?: string
  target?: NavigationLinkTarget
  company?: string
  logo?: StrapiImage | null
  isJobsearch?: boolean
}

/** Item within the last project card content */
export interface LastProjectCardItem {
  name?: string
  type?: string
}

/** Content structure for the last project card */
export interface LastProjectCardContent {
  items?: LastProjectCardItem[]
}

/** Special last project card for honorable mentions */
export interface LastProjectCard {
  id?: number
  title?: string
  text?: string
  content?: LastProjectCardContent
}

/**
 * Project section payload. Everything is optional to match flexible CMS responses.
 */
export interface ProjectSectionResponse extends BaseResponse<ProjectSectionResponse> {
  title?: string
  text?: RichTextNodes
  placeholder?: string
  jumpmark?: string
  projectCards?: ProjectCard[]
  lastProjectCard?: LastProjectCard
  footnote?: RichTextNodes
}

// Experience section specific types

/** Individual experience card representing a professional role */
export interface ExperienceCard {
  id?: number
  period?: string
  company?: string | null
  link?: string | null
  target?: NavigationLinkTarget
  position?: string | null
  text?: RichTextBlock[]
  duty?: RichTextBlock[]
  learning?: RichTextBlock[]
  logo?: StrapiImage | null
  isJobsearch?: boolean
}

/**
 * Experience section payload. Everything is optional to match flexible CMS responses.
 */
export interface ExperienceSectionResponse extends BaseResponse<ExperienceSectionResponse> {
  title?: string
  text?: RichTextNodes
  contactToggle?: string
  expandToggle?: string
  collapseToggle?: string
  jumpmark?: string
  experienceCards?: ExperienceCard[]
}

/** Individual certificate/award card */
export interface CertificateCard {
  id?: number
  title?: string
  text?: RichTextNodes
  linkText?: string
  link?: string
  target?: NavigationLinkTarget
  toolTip?: string // CMS field uses "toolTip" casing
  logo?: StrapiImage | null // similar to ExperienceCard
  bgColor: string
}

/**
 * Certificate section payload. Everything is optional to match flexible CMS responses.
 */
export interface CertificateSectionResponse extends BaseResponse<CertificateSectionResponse> {
  title?: string
  text?: RichTextNodes
  jumpmark?: string
  certificationCards?: CertificateCard[]
}

/** Individual FAQ item */
export interface FaqItem {
  order: number
  id: number
  question: string
  answer: string
}

/**
 * FAQ section payload. Everything is optional to match flexible CMS responses.
 */
export interface FaqSectionResponse extends BaseResponse<FaqSectionResponse> {
  title?: string
  text?: RichTextNodes
  jumpmark?: string
  faqItems?: FaqItem[]
}

// Testimonial section specific types

/** Individual recommendation card from colleagues/clients */
export interface RecommendationCard {
  id?: number
  author?: string
  position?: string
  company?: string
  relation?: string | null
  recommendation?: RichTextNodes
  isTranslated?: boolean | null
  platform?: string
  postDate?: string
  summary?: string
  avatar?: StrapiImage | null
  /** Optional external link to the original feedback (e.g., LinkedIn) */
  sourceUrl?: string
}

/**
 * Testimonial section payload. Everything is optional to match flexible CMS responses.
 */
export interface TestimonialSectionResponse extends BaseResponse<TestimonialSectionResponse> {
  title?: string
  text?: RichTextNodes
  jumpmark?: string
  recommendationCards?: RecommendationCard[]
}

// Contact section specific types

/** Individual contact channel with all required information */
export interface ContactChannel {
  id: string
  label: string
  description: string
  href: string
  icon: string
  external?: boolean
  aria?: string
}

/** Individual contact card with platform-specific information */
export interface ContactCard {
  id?: number
  icon?: string
  title?: string
  text?: RichTextNodes
  link?: string
  target?: NavigationLinkTarget
  buttonText?: string
}

/**
 * Contact section payload. Everything is optional to match flexible CMS responses.
 */
export interface ContactSectionResponse extends BaseResponse<ContactSectionResponse> {
  title?: string
  text?: RichTextNodes
  closingNote?: string
  jumpmark?: string
  contactCards?: ContactCard[]
}

// Imprint section specific types

/**
 * Imprint section payload. Everything is optional to match flexible CMS responses.
 */
export interface ImprintSectionResponse extends BaseResponse<ImprintSectionResponse> {
  title?: string
  jumpmark?: string
  text?: RichTextNodes
  noticeTitle?: string
  noticeText?: string
}

// AI Summary types

/**
 * AI Summary payload returned by the CMS.
 * Mirrors common base fields and adds subtitle, summary and createdAt.
 */
export interface AiSummaryResponse extends BaseResponse<AiSummaryResponse> {
  subtitle?: string
  summary?: string
  createdAt?: ISODateString
}

// Leave Notification types

/**
 * Leave Notification payload returned by the CMS.
 * Contains notification content with title, text, and QR code image.
 */
export interface LeaveNotificationResponse extends BaseResponse<LeaveNotificationResponse> {
  title?: string
  text?: string
  qrcode?: StrapiImage[]
  openWhatsapp?: string
  directMessage?: string
  disclaimer?: string
  createdAt?: ISODateString
}
