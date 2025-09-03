import { useIntersectionObserver } from '@vueuse/core'

interface ScrollHashesOptions {
  // CSS selector for sections to observe. Defaults to elements with data-scroll-hash or section[id].
  selector?: string
  // Intersection threshold at which a section becomes active (0.5 = 50%).
  threshold?: number
  // IDs or data-scroll-hash values that should map to root path (no hash), e.g., 'hero'.
  heroIds?: string[]
  // Root margin for the observer (account for sticky headers), e.g., '0px 0px -64px 0px'.
  rootMargin?: string
}

type StopFn = (() => void) | undefined

/**
 * Observe sections and keep the URL hash in sync with the section that is ≥ threshold visible in the viewport.
 * - Chooses the section with the highest viewport coverage above threshold.
 * - Uses data-scroll-hash when present, otherwise falls back to element id.
 * - Values matching heroIds or '/' clear the hash (keeps just '/path').
 * - Uses history.replaceState to avoid scroll jumps and history spam.
 */
export const useScrollHashes = (options: ScrollHashesOptions = {}) => {
  const selector = options.selector ?? '[data-scroll-hash], section[id]'
  const threshold = options.threshold ?? 0.5
  const heroIds = new Set(options.heroIds ?? ['hero'])
  const rootMargin = options.rootMargin ?? '0px'

  // no route usage needed; we operate on window.location to avoid navigation side-effects

  const elements = ref<HTMLElement[]>([])
  const activeHash = ref<string>('')
  // Stores visibility ratio relative to the viewport (not the element)
  const ratios = new Map<Element, number>()
  let stopObserver: StopFn

  const resolveHash = (el: Element): string => {
    const node = el as HTMLElement
    const raw = (node.dataset?.scrollHash ?? node.id ?? '').trim()
    if (!raw) return ''
    if (raw === '/' || heroIds.has(raw)) return ''
    const id = raw.startsWith('#') ? raw.slice(1) : raw
    return `#${id}`
  }

  const replaceHash = (hash: string) => {
    if (!import.meta.client) return
    const current = window.location.hash || ''
    if (hash === current) return

    // Build URL without causing navigation/scroll
    const base = `${window.location.pathname}${window.location.search}`
    const next = hash ? `${base}${hash}` : base
    try {
      window.history.replaceState(window.history.state, '', next)
    } catch {
      // As a last resort, assign without hash when clearing to avoid scroll jump
      if (!hash) window.history.replaceState(window.history.state, '', base)
    }
  }

  const pickActiveFromRatios = (): Element | null => {
    let best: { el: Element; ratio: number } | null = null
    for (const [el, r] of ratios.entries()) {
      if (r >= threshold) {
        if (!best || r > best.ratio) best = { el, ratio: r }
      }
    }
    return best?.el ?? null
  }

  const handleEntries: IntersectionObserverCallback = (entries) => {
    for (const e of entries) {
      if (!e.isIntersecting) {
        ratios.set(e.target, 0)
        continue
      }
      // Compute how much of the viewport height this element covers
      const rootH = e.rootBounds?.height ?? window.innerHeight
      const vRatio = rootH > 0 ? Math.min(1, Math.max(0, e.intersectionRect.height / rootH)) : 0
      ratios.set(e.target, vRatio)
    }
    const el = pickActiveFromRatios()
    if (!el) return
    const nextHash = resolveHash(el)
    if (nextHash !== activeHash.value) {
      activeHash.value = nextHash
      replaceHash(nextHash)
    }
  }

  const observe = () => {
    if (!import.meta.client) return
    elements.value = Array.from(document.querySelectorAll(selector)).filter((n): n is HTMLElement => n instanceof HTMLElement)
    if (!elements.value.length) return

    // Clean previous observer
    if (stopObserver) stopObserver()
    ratios.clear()

    const { stop } = useIntersectionObserver(
      () => elements.value,
      handleEntries,
      {
        // Use a few steps so entries fire as coverage changes; we compute viewport ratio ourselves
        threshold: [0, 0.1, 0.25, 0.5, 0.75, 1],
        rootMargin,
      }
    )
    stopObserver = stop

    // Prime initial selection on the next microtask if any element already intersects
    queueMicrotask(() => {
      const el = pickActiveFromRatios()
      if (!el) return
      const nextHash = resolveHash(el)
      if (nextHash !== activeHash.value) {
        activeHash.value = nextHash
        replaceHash(nextHash)
      }
    })
  }

  onMounted(() => {
    // Defer to ensure DOM is ready
    requestAnimationFrame(() => observe())
  })

  onBeforeUnmount(() => {
    if (stopObserver) stopObserver()
  })

  const refresh = () => observe()

  return {
    activeHash: computed(() => activeHash.value),
    refresh,
    stop: () => stopObserver?.(),
  }
}
