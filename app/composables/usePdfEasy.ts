/**
 * usePdfEasy
 * Minimal composable to generate a PDF from provided markdown content (API-driven).
 * It converts markdown into PDFEasy text primitives (headings, lists, paragraphs) – text-only.
 *
 * Usage example:
 * const { generatePdfFromMarkdown } = usePdfEasy()
 * const blobUrl = await generatePdfFromMarkdown(markdown)
 */
export const usePdfEasy = () => {
  type ClientEmit = 'blob' | 'save' | 'open-link' | 'none'

  interface GenerateOptions {
    size?: 'a4' | 'a5' | 'letter' | string
    margins?: { top?: number; bottom?: number; left?: number; right?: number }
    clientEmit?: ClientEmit
  }

  type TextStyle = {
    fontSize?: number
    bold?: boolean
    italic?: boolean
    color?: string
    align?: 'left' | 'center' | 'right' | 'justify'
    font?: string
  }

  type TextContent = { raw: string; text?: TextStyle }
  type ListContent = { raw: string; list: { style?: 'circle' | 'disc' | 'square' }; text?: TextStyle }
  type LineBreak = { lineBreak: Record<string, never> }
  type StackContent = { stack: TextContent[] }
  type PdfEasyContent = TextContent | ListContent | LineBreak | StackContent

  interface PdfEasyApi {
    new: (opts: { size?: string; margins?: { top?: number; bottom?: number; left?: number; right?: number }; plugins?: unknown[] }) => void
    add: (content: PdfEasyContent[]) => void
    run: (opts: { type: 'client' | 'server'; clientEmit?: ClientEmit; serverPath?: string; colorSchema?: 'CMYK' | 'RBG' }) => Promise<string | undefined>
  }

  // No formatting helpers used in raw-line mode

  // Replace a single parsed line. Map markdown ATX headings to sized bold text.
  const replaceParsedLine = (line: string): PdfEasyContent[] => {
    const normalizeSymbols = (s: string): string =>
      s
        // remove backticks entirely
        .replace(/`/g, '')
        // replace star-like emojis and star chars with ASCII asterisk for compatibility
        .replace(new RegExp('[⭐🌟✨★☆✦✧✪✫✬✭✮✯]', 'gu'), '•')

    const trimmed = line.trimEnd()
    // Blockquote: lines starting with '> ' become smaller and gray
    const bq = /^>\s+(.*)$/.exec(trimmed)
    if (bq) {
      const text = normalizeSymbols((bq[1] ?? '').trim())
      if (text) return [{ raw: text, text: { fontSize: 12, color: '#6b7280', align: 'left', font: 'Helvetica' } }, { lineBreak: {} }]
      return [{ lineBreak: {} }]
    }
    // Remove horizontal rules: lines that are just '---'
    if (/^\s*---\s*$/.test(trimmed)) {
      return []
    }
    // Order matters: check H3 before H2 before H1 to avoid partial matches
    const h3 = /^#{3}\s+(.*)$/.exec(trimmed)
    if (h3) {
      const title = normalizeSymbols((h3[1] ?? '').trim())
      if (title) return [{ raw: `\n${title}\n`, text: { bold: true, fontSize: 18, align: 'left', font: 'Helvetica' } }]
      return [{ lineBreak: {} }]
    }
    const h2 = /^#{2}\s+(.*)$/.exec(trimmed)
    if (h2) {
      const title = normalizeSymbols((h2[1] ?? '').trim())
      if (title) return [{ raw: `${title}\n`, text: { bold: true, fontSize: 20, align: 'left', font: 'Helvetica' } }]
      return [{ lineBreak: {} }]
    }
    const h1 = /^#{1}\s+(.*)$/.exec(trimmed)
    if (h1) {
      const title = normalizeSymbols((h1[1] ?? '').trim())
      if (title) return [{ raw: `${title}\n`, text: { bold: true, fontSize: 24, align: 'left', font: 'Helvetica' } }]
      return [{ lineBreak: {} }]
    }
    // Blank lines => line break
    if (trimmed === '') return [{ lineBreak: {} }]
    // List items that begin with a single dash: replace '-' with a bullet '• '
    let sourceLine = line
    const li = /^-\s+(.*)$/.exec(trimmed)
    if (li) {
      sourceLine = `• ${li[1] ?? ''}`
    }
    // Normalize inline symbols (remove backticks, fix stars)
    sourceLine = normalizeSymbols(sourceLine)
    // Default: support inline bold with **...** and preserve newline at end
    const segments: { text: string; bold: boolean }[] = []
    let lastIndex = 0
    const re = /\*\*([^*]+?)\*\*/g
    let m: RegExpExecArray | null
    while ((m = re.exec(sourceLine)) !== null) {
      if (m.index > lastIndex) segments.push({ text: sourceLine.slice(lastIndex, m.index), bold: false })
      segments.push({ text: (m[1] ?? ''), bold: true })
      lastIndex = m.index + m[0].length
    }
    if (lastIndex < sourceLine.length) segments.push({ text: sourceLine.slice(lastIndex), bold: false })

    if (segments.length === 0) {
      return [{ raw: `${sourceLine}\n`, text: { align: 'left', font: 'Helvetica', fontSize: 14 } }]
    }
    // append newline to the last segment to keep original line endings
    const tail = segments[segments.length - 1]
    if (tail) tail.text += '\n'
    return [
      {
        stack: segments.map((s) => ({
          raw: s.text,
          text: s.bold
            ? { bold: true, align: 'left', font: 'Helvetica', fontSize: 14 }
            : { align: 'left', font: 'Helvetica', fontSize: 14 }
        }))
      }
    ]
  }

  // Convert markdown line-by-line, using replaceParsedLine
  const mdToPdfEasy = (markdown: string): PdfEasyContent[] => {
    const lines = markdown.replace(/\r\n/g, '\n').split('\n')
    const out: PdfEasyContent[] = []

    // Helpers to parse GitHub-flavored markdown tables
    const isDivider = (line: string): boolean => {
      const trimmed = line.trim()
      if (!trimmed.includes('|')) return false
      // Split by pipe and check each part contains at least 3 hyphens possibly with leading/trailing colons
      const parts = trimmed
        .split('|')
        .map((p) => p.trim())
        .filter((p) => p.length > 0)
      if (parts.length === 0) return false
      return parts.every((p) => /^:?-{3,}:?$/.test(p))
    }

    const splitRow = (line: string): string[] => {
      // allow leading/trailing pipes; collapse internal multiple spaces around cell content
      const rawParts = line
        .trim()
        // Ensure there's at least one pipe to be considered a table row
        .split('|')
        .map((p) => p.trim())
      // Drop leading/trailing empty cell if caused by outer pipes
      const parts = rawParts.filter((_, idx) => {
        if (idx === 0 && rawParts[0] === '') return false
        if (idx === rawParts.length - 1 && rawParts[rawParts.length - 1] === '') return false
        return true
      })
      return parts
    }

    const normalizeCell = (s: string): string => {
      return s
        // remove inline code ticks
        .replace(/`/g, '')
        // remove bold/italic markers
        .replace(/\*\*([^*]+?)\*\*/g, '$1')
        .replace(/\*([^*]+?)\*/g, '$1')
        // replace fancy stars with bullets to avoid width issues
        .replace(new RegExp('[⭐🌟✨★☆✦✧✪✫✬✭✮✯]', 'gu'), '•')
    }

    const pad = (text: string, width: number, align: 'left' | 'center' | 'right' = 'left'): string => {
      const len = [...text].length
      if (len >= width) return text
      const spaces = ' '.repeat(width - len)
      if (align === 'right') return spaces + text
      if (align === 'center') {
        const left = Math.floor((width - len) / 2)
        const right = width - len - left
        return ' '.repeat(left) + text + ' '.repeat(right)
      }
      return text + spaces
    }

    const parseTableBlock = (start: number): { content: PdfEasyContent[]; nextIndex: number } => {
      // Expect: header row at lines[start], divider at lines[start+1], then 0..N data rows
      const headerCells = splitRow(lines[start] ?? '')
      // divider is at start+1 (already validated by caller)
      // Parse divider/alignments
      const dividerLine = lines[start + 1] ?? ''
      const alignments = splitRow(dividerLine).map((cell) => {
        const hasLeft = cell.startsWith(':')
        const hasRight = cell.endsWith(':')
        if (hasLeft && hasRight) return 'center' as const
        if (hasRight) return 'right' as const
        return 'left' as const
      })

      // Collect data rows until a blank line or a non-table-looking line
      const rows: string[][] = []
      let i = start + 2
      while (i < lines.length) {
        const ln = lines[i] ?? ''
        const trimmed = ln.trim()
        if (trimmed === '') break
        // consider a line part of the table if it has at least one pipe and not a divider
        if (!trimmed.includes('|') || isDivider(trimmed)) break
        rows.push(splitRow(ln))
        i++
      }

      const cols = headerCells.length
      // Normalize all rows to the same number of columns
      const data = rows.map((r) => {
        const arr = new Array(cols).fill('') as string[]
        for (let c = 0; c < cols; c++) arr[c] = normalizeCell(r[c] ?? '')
        return arr
      })
      const header = headerCells.map((c) => normalizeCell(c))

      // Compute column widths based on header and data
      const widths = new Array(cols).fill(0).map((_, c) => {
        const hc = header[c] ?? ''
        const headerLen = [...hc].length
        const maxData = Math.max(0, ...data.map((r) => ([...(r[c] ?? '')].length)))
        return Math.max(headerLen, maxData)
      })

      // Build a monospace ascii table
      const makeLine = (cells: string[], bold = false): TextContent[] => {
        const parts: TextContent[] = []
        const body = cells
          .map((cell, idx) => pad(cell, widths[idx] ?? cell.length, alignments[idx] ?? 'left'))
          .join(' | ')
        parts.push({ raw: body + '\n', text: { font: 'Courier', fontSize: 12, align: 'left', ...(bold ? { bold: true } : {}) } })
        return parts
      }

      const sepLen = widths.reduce((acc, w) => acc + w, 0) + (cols - 1) * 3
      const separator = '-'.repeat(Math.max(3, sepLen))

      const content: PdfEasyContent[] = []
      // spacing before table
      content.push({ lineBreak: {} })
      content.push(...makeLine(header, true))
      content.push({ raw: separator + '\n', text: { font: 'Courier', fontSize: 12, align: 'left' } })
      for (const row of data) {
        content.push(...makeLine(row))
      }
      // spacing after table
      content.push({ lineBreak: {} })

      return { content, nextIndex: i }
    }

    for (let i = 0; i < lines.length; i++) {
      const line = lines[i] ?? ''
      const trimmed = line.trim()
      // Detect markdown table blocks: header | header ... followed by a divider row with ---, :---, ---:, :---:
      if (
        trimmed.includes('|') &&
        i + 1 < lines.length &&
        isDivider(lines[i + 1] ?? '')
      ) {
        const { content, nextIndex } = parseTableBlock(i)
        out.push(...content)
        i = nextIndex - 1 // for-loop will i++
        continue
      }
      // Shrink spacing before headings: skip blank lines immediately before a heading
      if (trimmed === '' && i + 1 < lines.length) {
        const next = lines[i + 1]?.trim() ?? ''
        if (/^#{1,3}\s+/.test(next)) {
          continue
        }
      }
      const parts = replaceParsedLine(line)
      out.push(...parts)
    }
    return out
  }

  const generateFromMarkdown = async (
    markdown: string,
    options: GenerateOptions = {}
  ): Promise<string | undefined> => {
    if (!import.meta.client) {
      throw new Error('PDF generation is only available on the client.')
    }

    // Try to get from Nuxt injection first; fallback to dynamic core import
    const nuxtApp = useNuxtApp() as unknown as { $pdf?: PdfEasyApi }
    let $pdf = nuxtApp.$pdf
    if (!$pdf) {
      try {
        const mod = (await import('pdfeasy')) as unknown as { default?: PdfEasyApi }
        $pdf = (mod.default ?? (mod as unknown as PdfEasyApi)) as PdfEasyApi
      } catch {
        // ignore to throw unified error below
      }
    }
    if (!$pdf) throw new Error('PDFEasy ($pdf) is not available. Is nuxt-pdfeasy installed?')

    const { size = 'a4', margins = { top: 5, bottom: 5, left: 5, right: 5 }, clientEmit = 'blob' } = options

    $pdf.new({ size, margins })
    $pdf.add(mdToPdfEasy(markdown))

    // returns a blob URL when clientEmit === 'blob'
    return await $pdf.run({ type: 'client', clientEmit })
  }

  const generatePdfFromMarkdown = async (
    markdown: string,
    options: GenerateOptions = {}
  ): Promise<string | undefined> => {
    return generateFromMarkdown(markdown, options)
  }

  return {
    generatePdfFromMarkdown,
  }
}
