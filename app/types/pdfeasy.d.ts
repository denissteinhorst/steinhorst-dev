// Augment NuxtApp to include $pdf provided by our client plugin
export {}
declare module '#app' {
  interface NuxtApp {
    // minimal surface used by usePdfEasy
    $pdf?: {
      new: (opts: {
        size?: string
        margins?: { top?: number; bottom?: number; left?: number; right?: number }
        plugins?: unknown[]
        document?: { info?: Record<string, unknown> }
        exports?: { name?: string }
      }) => void
      add: (content: unknown[]) => void
      run: (opts: {
        type: 'client' | 'server'
        clientEmit?: 'blob' | 'save' | 'open-link' | 'none'
        serverPath?: string
        colorSchema?: 'CMYK' | 'RBG'
      }) => Promise<string | undefined>
    }
  }
}
