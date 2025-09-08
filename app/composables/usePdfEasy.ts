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
  run: (options: { type: 'client' | 'server'; clientEmit?: 'blob' | 'save' | 'open-link' | 'none'; serverPath?: string; colorSchema?: 'CMYK' | 'RBG' }) => Promise<string | undefined>
}

const DEFAULT_FILENAME = 'document.pdf'
const DEFAULT_METADATA: PdfMetadata = {
  title: 'steinhorst-dev_zusammenfassung.pdf',
  author: 'Denis Steinhorst',
  subject: 'ai-generated PDF summary from www.steinhorst.dev',
  keywords: ['denis', 'steinhorst', 'steinhorst-dev', 'summary', 'portfolio', 'developer', 'frontend', 'backend', 'fullstack', 'software', 'engineer', 'web', 'app', 'vue', 'nuxt', 'javascript', 'typescript', 'nodejs'],
  creator: 'www.steinhorst.dev',
  producer: 'PDFKit'
}

export const usePdfEasy = () => {

  const normalizeSymbols = (text: string): string =>
    text
      .replace(/`/g, '')
      .replace(/[⭐🌟✨★☆✦✧✪✫✬✭✮✯]/gu, '•')
  const replaceParsedLine = (line: string): PdfEasyContent[] => {
    const trimmed = line.trimEnd()

    const blockquoteMatch = /^>\s+(.*)$/.exec(trimmed)
    if (blockquoteMatch) {
      const text = normalizeSymbols((blockquoteMatch[1] ?? '').trim())
      if (text) return [{ raw: text, text: { fontSize: 12, color: '#6b7280', align: 'left', font: 'Helvetica' } }, { lineBreak: {} }]
      return [{ lineBreak: {} }]
    }

    if (/^\s*---\s*$/.test(trimmed)) {
      return []
    }

    const h3Match = /^#{3}\s+(.*)$/.exec(trimmed)
    if (h3Match) {
      const title = normalizeSymbols((h3Match[1] ?? '').trim())
      if (title) return [{ raw: `\n${title}\n`, text: { bold: true, fontSize: 18, align: 'left', font: 'Helvetica' } }]
      return [{ lineBreak: {} }]
    }

    const h2Match = /^#{2}\s+(.*)$/.exec(trimmed)
    if (h2Match) {
      const title = normalizeSymbols((h2Match[1] ?? '').trim())
      if (title) return [{ raw: `${title}\n`, text: { bold: true, fontSize: 20, align: 'left', font: 'Helvetica' } }]
      return [{ lineBreak: {} }]
    }

    const h1Match = /^#{1}\s+(.*)$/.exec(trimmed)
    if (h1Match) {
      const title = normalizeSymbols((h1Match[1] ?? '').trim())
      if (title) return [{ raw: `${title}\n`, text: { bold: true, fontSize: 24, align: 'left', font: 'Helvetica' } }]
      return [{ lineBreak: {} }]
    }

    if (trimmed === '') return [{ lineBreak: {} }]

    let sourceLine = line
    const listItemMatch = /^-\s+(.*)$/.exec(trimmed)
    if (listItemMatch) {
      sourceLine = `• ${listItemMatch[1] ?? ''}`
    }

    sourceLine = normalizeSymbols(sourceLine)

    const segments: { text: string; bold: boolean }[] = []
    let lastIndex = 0
    const boldRegex = /\*\*([^*]+?)\*\*/g
    let match: RegExpExecArray | null
    while ((match = boldRegex.exec(sourceLine)) !== null) {
      if (match.index > lastIndex) segments.push({ text: sourceLine.slice(lastIndex, match.index), bold: false })
      segments.push({ text: (match[1] ?? ''), bold: true })
      lastIndex = match.index + match[0].length
    }
    if (lastIndex < sourceLine.length) segments.push({ text: sourceLine.slice(lastIndex), bold: false })

    if (segments.length === 0) {
      return [{ raw: `${sourceLine}\n`, text: { align: 'left', font: 'Helvetica', fontSize: 14 } }]
    }

    const lastSegment = segments[segments.length - 1]
    if (lastSegment) lastSegment.text += '\n'
    return [
      {
        stack: segments.map((segment) => ({
          raw: segment.text,
          text: segment.bold
            ? { bold: true, align: 'left', font: 'Helvetica', fontSize: 14 }
            : { align: 'left', font: 'Helvetica', fontSize: 14 }
        }))
      }
    ]
  }

  const convertMarkdownToPdfEasy = (markdown: string): PdfEasyContent[] => {
    const lines = markdown.replace(/\r\n/g, '\n').split('\n')
    const output: PdfEasyContent[] = []

    const isTableDivider = (line: string): boolean => {
      const trimmed = line.trim()
      if (!trimmed.includes('|')) return false

      const parts = trimmed
        .split('|')
        .map((part) => part.trim())
        .filter((part) => part.length > 0)

      if (parts.length === 0) return false
      return parts.every((part) => /^:?-{3,}:?$/.test(part))
    }

    const splitTableRow = (line: string): string[] => {
      const rawParts = line
        .trim()
        .split('|')
        .map((part) => part.trim())

      return rawParts.filter((_, index) => {
        if (index === 0 && rawParts[0] === '') return false
        if (index === rawParts.length - 1 && rawParts[rawParts.length - 1] === '') return false
        return true
      })
    }

    const normalizeTableCell = (text: string): string => {
      return text
        .replace(/`/g, '')
        .replace(/\*\*([^*]+?)\*\*/g, '$1')
        .replace(/\*([^*]+?)\*/g, '$1')
        .replace(/[⭐🌟✨★☆✦✧✪✫✬✭✮✯]/gu, '•')
    }

    const padText = (text: string, width: number, align: 'left' | 'center' | 'right' = 'left'): string => {
      const length = [...text].length
      if (length >= width) return text

      const spaces = ' '.repeat(width - length)
      if (align === 'right') return spaces + text
      if (align === 'center') {
        const left = Math.floor((width - length) / 2)
        const right = width - length - left
        return ' '.repeat(left) + text + ' '.repeat(right)
      }
      return text + spaces
    }

    const parseTableBlock = (startIndex: number): { content: PdfEasyContent[]; nextIndex: number } => {
      const headerCells = splitTableRow(lines[startIndex] ?? '')
      const dividerLine = lines[startIndex + 1] ?? ''

      const alignments = splitTableRow(dividerLine).map((cell) => {
        const hasLeft = cell.startsWith(':')
        const hasRight = cell.endsWith(':')
        if (hasLeft && hasRight) return 'center' as const
        if (hasRight) return 'right' as const
        return 'left' as const
      })

      const rows: string[][] = []
      let currentIndex = startIndex + 2

      while (currentIndex < lines.length) {
        const line = lines[currentIndex] ?? ''
        const trimmed = line.trim()

        if (trimmed === '') break
        if (!trimmed.includes('|') || isTableDivider(trimmed)) break

        rows.push(splitTableRow(line))
        currentIndex++
      }

      const columnCount = headerCells.length

      const data = rows.map((row) => {
        const normalizedRow = new Array(columnCount).fill('') as string[]
        for (let columnIndex = 0; columnIndex < columnCount; columnIndex++) {
          normalizedRow[columnIndex] = normalizeTableCell(row[columnIndex] ?? '')
        }
        return normalizedRow
      })

      const header = headerCells.map((cell) => normalizeTableCell(cell))

      const columnWidths = new Array(columnCount).fill(0).map((_, columnIndex) => {
        const headerCell = header[columnIndex] ?? ''
        const headerLength = [...headerCell].length
        const maxDataLength = Math.max(0, ...data.map((row) => ([...(row[columnIndex] ?? '')].length)))
        return Math.max(headerLength, maxDataLength)
      })

      const createTableLine = (cells: string[], isBold = false): TextContent[] => {
        const tableRow = cells
          .map((cell, index) => padText(cell, columnWidths[index] ?? cell.length, alignments[index] ?? 'left'))
          .join(' | ')

        return [{
          raw: tableRow + '\n',
          text: {
            font: 'Courier',
            fontSize: 12,
            align: 'left',
            ...(isBold ? { bold: true } : {})
          }
        }]
      }

      const separatorLength = columnWidths.reduce((accumulator, width) => accumulator + width, 0) + (columnCount - 1) * 3
      const separator = '-'.repeat(Math.max(3, separatorLength))

      const content: PdfEasyContent[] = []

      content.push({ lineBreak: {} })
      content.push(...createTableLine(header, true))
      content.push({ raw: separator + '\n', text: { font: 'Courier', fontSize: 12, align: 'left' } })

      for (const row of data) {
        content.push(...createTableLine(row))
      }

      content.push({ lineBreak: {} })

      return { content, nextIndex: currentIndex }
    }

    for (let lineIndex = 0; lineIndex < lines.length; lineIndex++) {
      const line = lines[lineIndex] ?? ''
      const trimmed = line.trim()

      if (
        trimmed.includes('|') &&
        lineIndex + 1 < lines.length &&
        isTableDivider(lines[lineIndex + 1] ?? '')
      ) {
        const { content, nextIndex } = parseTableBlock(lineIndex)
        output.push(...content)
        lineIndex = nextIndex - 1
        continue
      }

      if (trimmed === '' && lineIndex + 1 < lines.length) {
        const nextLine = lines[lineIndex + 1]?.trim() ?? ''
        if (/^#{1,3}\s+/.test(nextLine)) {
          continue
        }
      }

      const parsedContent = replaceParsedLine(line)
      output.push(...parsedContent)
    }

    return output
  }

  const generateFromMarkdown = async (
    markdown: string,
    options: PdfGenerateOptions = {}
  ): Promise<string | undefined> => {
    if (!import.meta.client) {
      throw new Error('PDF generation is only available on the client.')
    }

    const nuxtApp = useNuxtApp() as unknown as { $pdf?: PdfEasyApi }
    let $pdf = nuxtApp.$pdf
    if (!$pdf) {
      try {
        const module = (await import('pdfeasy')) as unknown as { default?: PdfEasyApi }
        $pdf = (module.default ?? (module as unknown as PdfEasyApi)) as PdfEasyApi
      } catch {
        // Ignore to throw unified error below
      }
    }
    if (!$pdf) {
      throw new Error('PDFEasy ($pdf) is not available. Ensure the client plugin loads pdfeasy and you are calling this on the client.')
    }

    const { size = 'a4', margins = { top: 5, bottom: 5, left: 5, right: 5 }, clientEmit = 'blob' } = options
    const metadata: PdfMetadata = { ...DEFAULT_METADATA, ...(options.meta ?? {}) }

    const createSafeFilename = (text: string): string => text
      .replace(/[\0<>:"/\\|?*\n\r]+/g, '')
      .trim()
      .replace(/\s+/g, '_')
      .slice(0, 200)

    const ensurePdfExtension = (text: string): string => (text.toLowerCase().endsWith('.pdf') ? text : `${text}.pdf`)

    let filename = options.filename ?? DEFAULT_FILENAME
    if (!options.filename && typeof metadata.title === 'string' && metadata.title.trim().length > 0) {
      filename = ensurePdfExtension(createSafeFilename(metadata.title))
    }
    const exportName = filename.replace(/\.pdf$/i, '')

    const documentInfo: Record<string, unknown> = {
      ...(metadata.title ? { Title: String(metadata.title).replace(/\.pdf$/i, '') } : {}),
      ...(metadata.author ? { Author: metadata.author } : {}),
      ...(metadata.subject ? { Subject: metadata.subject } : {}),
      ...(metadata.keywords ? { Keywords: Array.isArray(metadata.keywords) ? metadata.keywords.join(', ') : metadata.keywords } : {}),
      ...(metadata.creator ? { Creator: metadata.creator } : {}),
      ...(metadata.producer ? { Producer: metadata.producer } : {}),
      ...(metadata.creationDate ? { CreationDate: new Date(metadata.creationDate) } : {}),
      ...(metadata.modificationDate ? { ModDate: new Date(metadata.modificationDate) } : {}),
    }

    $pdf.new({ size, margins, document: { info: documentInfo }, exports: { name: exportName } })
    $pdf.add(convertMarkdownToPdfEasy(markdown))

    // Work around pdfeasy's default `save` name (it prefixes with '/') by doing a controlled download.
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
            console.debug('[usePdfEasy] Cleanup after download failed', err)
          }
        }, 0)
        return url
      }
      return undefined
    }

    // returns a blob URL when clientEmit === 'blob'
    return await $pdf.run({ type: 'client', clientEmit })
  }

  const generatePdfFromMarkdown = async (
    markdown: string,
    options: PdfGenerateOptions = {}
  ): Promise<string | undefined> => {
    return generateFromMarkdown(markdown, options)
  }

  return {
    generatePdfFromMarkdown,
  }
}
