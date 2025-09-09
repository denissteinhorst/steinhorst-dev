// Types for PDF content
type TextStyle = {
  fontSize?: number
  bold?: boolean
  italic?: boolean
  color?: string
  align?: 'left' | 'center' | 'right' | 'justify'
  font?: string
}

type TextContent = {
  raw: string
  text?: TextStyle
}

type StackContent = {
  stack: TextContent[]
}

type LineBreak = {
  lineBreak: Record<string, never>
}

type PdfEasyContent = TextContent | StackContent | LineBreak

/**
 * usePdfEasyFormatter
 *
 * Handles markdown-to-PDF conversion and text formatting utilities.
 * Converts markdown content into PDFEasy-compatible format.
 *
 * @returns Object containing markdown conversion and text utilities
 */
export const usePdfEasyFormatter = () => {

  /**
   * Normalizes markdown symbols and removes unsupported characters
   */
  const normalizeSymbols = (text: string): string =>
    text
      .replace(/`/g, '')
      .replace(/[⭐🌟✨★☆✦✧✪✫✬✭✮✯]/gu, '•')

  /**
   * Creates safe filename from text
   */
  const createSafeFilename = (text: string): string =>
    text
      .replace(/[\0<>:"/\\|?*\n\r]+/g, '')
      .trim()
      .replace(/\s+/g, '_')
      .slice(0, 200)

  /**
   * Ensures filename has .pdf extension
   */
  const ensurePdfExtension = (text: string): string =>
    text.toLowerCase().endsWith('.pdf') ? text : `${text}.pdf`

  /**
   * Converts markdown content to PDFEasy format
   */
  const convertMarkdownToPdfEasy = (markdown: string): PdfEasyContent[] => {
    const lines = markdown.replace(/\r\n/g, '\n').split('\n')
    const output: PdfEasyContent[] = []

    // Helper functions for table processing
    const isTableDivider = (line: string): boolean => {
      const trimmed = line.trim()
      if (!trimmed.includes('|')) return false
      const parts = trimmed.split('|').map(p => p.trim()).filter(p => p.length > 0)
      return parts.length > 0 && parts.every(part => /^:?-{3,}:?$/.test(part))
    }

    const splitTableRow = (line: string): string[] => {
      const rawParts = line.trim().split('|').map(p => p.trim())
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

      const separatorLength = columnWidths.reduce((acc, width) => acc + width, 0) + (columnCount - 1) * 3
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

    for (let i = 0; i < lines.length; i++) {
      const line = lines[i] ?? ''
      const trimmed = line.trim()

      // Handle tables
      if (trimmed.includes('|') && i + 1 < lines.length && isTableDivider(lines[i + 1] ?? '')) {
        const { content, nextIndex } = parseTableBlock(i)
        output.push(...content)
        i = nextIndex - 1
        continue
      }

      // Blockquotes
      const blockquote = /^>\s+(.*)$/.exec(trimmed)
      if (blockquote) {
        const text = normalizeSymbols((blockquote[1] ?? '').trim())
        if (text) output.push({ raw: text, text: { fontSize: 12, color: '#6b7280', align: 'left', font: 'Helvetica' } }, { lineBreak: {} })
        else output.push({ lineBreak: {} })
        continue
      }

      // Horizontal rules
      if (/^\s*---\s*$/.test(trimmed)) continue

      // Headings
      const h3 = /^#{3}\s+(.*)$/.exec(trimmed)
      if (h3) {
        const title = normalizeSymbols((h3[1] ?? '').trim())
        if (title) output.push({ raw: `\n${title}\n`, text: { bold: true, fontSize: 18, align: 'left', font: 'Helvetica' } })
        else output.push({ lineBreak: {} })
        continue
      }

      const h2 = /^#{2}\s+(.*)$/.exec(trimmed)
      if (h2) {
        const title = normalizeSymbols((h2[1] ?? '').trim())
        if (title) output.push({ raw: `${title}\n`, text: { bold: true, fontSize: 20, align: 'left', font: 'Helvetica' } })
        else output.push({ lineBreak: {} })
        continue
      }

      const h1 = /^#{1}\s+(.*)$/.exec(trimmed)
      if (h1) {
        const title = normalizeSymbols((h1[1] ?? '').trim())
        if (title) output.push({ raw: `${title}\n`, text: { bold: true, fontSize: 24, align: 'left', font: 'Helvetica' } })
        else output.push({ lineBreak: {} })
        continue
      }

      // Empty lines
      if (trimmed === '') {
        // Skip empty lines before headings
        if (i + 1 < lines.length && /^#{1,3}\s+/.test(lines[i + 1]?.trim() ?? '')) continue
        output.push({ lineBreak: {} })
        continue
      }

      // Lists and text
      let text = line
      const listMatch = /^-\s+(.*)$/.exec(trimmed)
      if (listMatch) text = `• ${listMatch[1] ?? ''}`

      text = normalizeSymbols(text)

      // Handle bold formatting
      const segments: { text: string; bold: boolean }[] = []
      let lastIndex = 0
      const boldRegex = /\*\*([^*]+?)\*\*/g
      let match: RegExpExecArray | null
      while ((match = boldRegex.exec(text)) !== null) {
        if (match.index > lastIndex) segments.push({ text: text.slice(lastIndex, match.index), bold: false })
        segments.push({ text: match[1] ?? '', bold: true })
        lastIndex = match.index + match[0].length
      }
      if (lastIndex < text.length) segments.push({ text: text.slice(lastIndex), bold: false })

      if (segments.length === 0) {
        output.push({ raw: `${text}\n`, text: { align: 'left', font: 'Helvetica', fontSize: 14 } })
      } else {
        const lastSegment = segments[segments.length - 1]
        if (lastSegment) lastSegment.text += '\n'
        output.push({
          stack: segments.map(seg => ({
            raw: seg.text,
            text: seg.bold ? { bold: true, align: 'left', font: 'Helvetica', fontSize: 14 } : { align: 'left', font: 'Helvetica', fontSize: 14 }
          }))
        })
      }
    }

    return output
  }

  return {
    normalizeSymbols,
    createSafeFilename,
    ensurePdfExtension,
    convertMarkdownToPdfEasy
  }
}
