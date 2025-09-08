import { useDebounceFn, useIntersectionObserver } from '@vueuse/core'

interface ScrollHashesOptions {
  selector?: string
  threshold?: number
  heroIds?: string[]
  rootMargin?: string
}

/**
 * Observe sections and keep the URL hash in sync with the section that is ≥ threshold visible in the viewport.
 * Chooses the section with the highest viewport coverage above threshold.
 * Uses data-scroll-hash when present, otherwise falls back to element id.
 * Values matching heroIds or '/' clear the hash (keeps just '/path').
 * Uses history.replaceState to avoid scroll jumps and history spam.
 */
export const useScrollHashes = (options: ScrollHashesOptions = {}) => {
  const selector = options.selector ?? '[data-scroll-hash], section[id]'
  const threshold = options.threshold ?? 0.5
  const heroIds = new Set(options.heroIds ?? ['hero'])
  const rootMargin = options.rootMargin ?? '0px'

  const elements = shallowRef<HTMLElement[]>([])
  const activeHash = ref<string>('')
  const visibilityRatios = new Map<Element, number>()
  let intersectionObserverStop: (() => void) | undefined
  let mutationObserver: MutationObserver | undefined

  const resolveHash = (element: Element): string => {
    const htmlElement = element as HTMLElement
    const rawHash = (htmlElement.dataset?.scrollHash ?? htmlElement.id ?? '').trim()

    if (!rawHash || rawHash === '/' || heroIds.has(rawHash)) return ''

    const cleanId = rawHash.startsWith('#') ? rawHash.slice(1) : rawHash
    return `#${cleanId}`
  }

  const updateUrlHash = (hash: string): void => {
    if (!import.meta.client) return

    const currentHash = window.location.hash || ''
    if (hash === currentHash) return

    const baseUrl = `${window.location.pathname}${window.location.search}`
    const newUrl = hash ? `${baseUrl}${hash}` : baseUrl

    try {
      window.history.replaceState(window.history.state, '', newUrl)
    } catch {
      if (!hash) window.history.replaceState(window.history.state, '', baseUrl)
    }
  }

  const findMostVisibleElement = (): Element | null => {
    let bestElement: { element: Element; ratio: number } | null = null

    for (const [element, ratio] of visibilityRatios.entries()) {
      if (ratio >= threshold && (!bestElement || ratio > bestElement.ratio)) {
        bestElement = { element, ratio }
      }
    }

    return bestElement?.element ?? null
  }

  const handleIntersectionEntries: IntersectionObserverCallback = (entries) => {
    for (const entry of entries) {
      if (!entry.isIntersecting) {
        visibilityRatios.set(entry.target, 0)
        continue
      }

      const rootHeight = entry.rootBounds?.height ?? window.innerHeight
      const viewportRatio = rootHeight > 0
        ? Math.min(1, Math.max(0, entry.intersectionRect.height / rootHeight))
        : 0

      visibilityRatios.set(entry.target, viewportRatio)
    }

    const mostVisibleElement = findMostVisibleElement()
    if (!mostVisibleElement) return

    const newHash = resolveHash(mostVisibleElement)
    if (newHash !== activeHash.value) {
      activeHash.value = newHash
      updateUrlHash(newHash)
    }
  }

  const observeElements = (): void => {
    if (!import.meta.client) return

    const queriedElements = Array.from(document.querySelectorAll(selector))
      .filter((element): element is HTMLElement => element instanceof HTMLElement)

    elements.value = queriedElements
    if (!elements.value.length) return

    intersectionObserverStop?.()
    visibilityRatios.clear()

    const { stop } = useIntersectionObserver(
      () => elements.value,
      handleIntersectionEntries,
      {
        threshold: [0, 0.1, 0.25, 0.5, 0.75, 1],
        rootMargin,
      }
    )

    intersectionObserverStop = stop

    queueMicrotask(() => {
      const mostVisibleElement = findMostVisibleElement()
      if (!mostVisibleElement) return

      const newHash = resolveHash(mostVisibleElement)
      if (newHash !== activeHash.value) {
        activeHash.value = newHash
        updateUrlHash(newHash)
      }
    })
  }

  const debouncedObserve = useDebounceFn(observeElements, 50)

  onMounted(() => {
    requestAnimationFrame(() => observeElements())

    if (import.meta.client && typeof MutationObserver !== 'undefined') {
      mutationObserver = new MutationObserver(() => debouncedObserve())

      try {
        mutationObserver.observe(document.body, { childList: true, subtree: true })
      } catch {
        // Ignore if document.body isn't available
      }
    }
  })

  const route = useRoute?.()
  if (route) {
    watch(
      () => route.fullPath,
      () => {
        if (import.meta.client) {
          nextTick(() => observeElements())
        }
      }
    )
  }

  onBeforeUnmount(() => {
    intersectionObserverStop?.()
    mutationObserver?.disconnect()
  })

  return {
    activeHash: computed(() => activeHash.value),
    refresh: observeElements,
    stop: () => intersectionObserverStop?.(),
  }
}
