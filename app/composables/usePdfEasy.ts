/**
 * usePdfEasy
 * Minimal composable to generate a PDF from provided markdown content (API-driven).
 * It converts markdown into PDFEasy text primitives (headings, lists, paragraphs) – text-only.
 *
 * Usage example:
 * const { generatePdfFromMarkdown } = usePdfEasy()
 * const blobUrl = await generatePdfFromMarkdown(markdown)
 */

export interface PdfMetadata {
  title?: string
  author?: string
  subject?: string
  keywords?: string[] | string
  creator?: string
  producer?: string
  creationDate?: string | Date
  modificationDate?: string | Date
}

interface PdfGenerateOptions {
  size?: 'a4' | 'a5' | 'letter' | string
  margins?: { top?: number; bottom?: number; left?: number; right?: number }
  clientEmit?: 'blob' | 'save' | 'open-link' | 'none'
  filename?: string
  meta?: PdfMetadata
}

interface TextStyle {
  fontSize?: number
  bold?: boolean
  italic?: boolean
  color?: string
  align?: 'left' | 'center' | 'right' | 'justify'
  font?: string
}

interface TextContent {
  raw: string
  text?: TextStyle
}

interface ListContent {
  raw: string
  list: { style?: 'circle' | 'disc' | 'square' }
  text?: TextStyle
}

interface LineBreak {
  lineBreak: Record<string, never>
}

interface StackContent {
  stack: TextContent[]
}

type PdfEasyContent = TextContent | ListContent | LineBreak | StackContent

interface PdfEasyApi {
  new: (options: {
    size?: string
    margins?: { top?: number; bottom?: number; left?: number; right?: number }
    plugins?: unknown[]
    document?: { info?: Record<string, unknown> }
    exports?: { name?: string }
  }) => void
  add: (content: PdfEasyContent[]) => void
  run: (options: {
    type: 'client' | 'server'
    clientEmit?: 'blob' | 'save' | 'open-link' | 'none'
    serverPath?: string
    colorSchema?: 'CMYK' | 'RBG'
  }) => Promise<string | undefined>
}

const DEFAULT_FILENAME = 'document.pdf'
const DEFAULT_METADATA: PdfMetadata = {
  title: 'steinhorst-dev_zusammenfassung.pdf',
  author: 'Denis Steinhorst',
  subject: 'ai-generated PDF summary from www.steinhorst.dev',
  keywords: [
    'denis',
    'steinhorst',
    'steinhorst-dev',
    'summary',
    'portfolio',
    'developer',
    'frontend',
    'backend',
    'fullstack',
    'software',
    'engineer',
    'web',
    'app',
    'vue',
    'nuxt',
    'javascript',
    'typescript',
    'nodejs',
  ],
  creator: 'www.steinhorst.dev',
  producer: 'PDFKit',
}

export const usePdfEasy = () => {
  const { createSafeFilename, ensurePdfExtension, convertMarkdownToPdfEasy } = usePdfEasyFormatter()

  const generatePdfFromMarkdown = async (
    markdown: string,
    options: PdfGenerateOptions = {},
  ): Promise<string | undefined> => {
    if (!import.meta.client) throw new Error('PDF generation is only available on the client.')

    const nuxtApp = useNuxtApp() as unknown as { $pdf?: PdfEasyApi }
    let $pdf = nuxtApp.$pdf
    if (!$pdf) {
      try {
        const module = (await import('pdfeasy')) as unknown as { default?: PdfEasyApi }
        $pdf = (module.default ?? (module as unknown as PdfEasyApi)) as PdfEasyApi
      } catch {
        // Fallback handled below
      }
    }
    if (!$pdf) throw new Error('PDFEasy is not available. Ensure the client plugin loads pdfeasy.')

    const {
      size = 'a4',
      margins = { top: 5, bottom: 5, left: 5, right: 5 },
      clientEmit = 'blob',
    } = options
    const metadata: PdfMetadata = { ...DEFAULT_METADATA, ...(options.meta ?? {}) }

    let filename = options.filename ?? DEFAULT_FILENAME
    if (
      !options.filename &&
      typeof metadata.title === 'string' &&
      metadata.title.trim().length > 0
    ) {
      filename = ensurePdfExtension(createSafeFilename(metadata.title))
    }

    const documentInfo: Record<string, unknown> = {
      ...(metadata.title ? { Title: String(metadata.title).replace(/\.pdf$/i, '') } : {}),
      ...(metadata.author ? { Author: metadata.author } : {}),
      ...(metadata.subject ? { Subject: metadata.subject } : {}),
      ...(metadata.keywords
        ? {
            Keywords: Array.isArray(metadata.keywords)
              ? metadata.keywords.join(', ')
              : metadata.keywords,
          }
        : {}),
      ...(metadata.creator ? { Creator: metadata.creator } : {}),
      ...(metadata.producer ? { Producer: metadata.producer } : {}),
      ...(metadata.creationDate ? { CreationDate: new Date(metadata.creationDate) } : {}),
      ...(metadata.modificationDate ? { ModDate: new Date(metadata.modificationDate) } : {}),
    }

    $pdf.new({
      size,
      margins,
      document: { info: documentInfo },
      exports: { name: filename.replace(/\.pdf$/i, '') },
    })
    $pdf.add(convertMarkdownToPdfEasy(markdown))

    if (clientEmit === 'save') {
      const url = await $pdf.run({ type: 'client', clientEmit: 'blob' })
      if (url) {
        const a = document.createElement('a')
        a.href = url
        a.download = filename
        a.style.display = 'none'
        document.body.appendChild(a)
        a.click()
        setTimeout(() => {
          try {
            document.body.removeChild(a)
            URL.revokeObjectURL(url)
          } catch (err) {
            console.debug('[usePdfEasy] Cleanup failed', err)
          }
        }, 0)
        return url
      }
      return undefined
    }

    return await $pdf.run({ type: 'client', clientEmit })
  }

  return { generatePdfFromMarkdown }
}
