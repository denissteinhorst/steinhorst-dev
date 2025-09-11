/**
 * useFocusHelper
 *
 * When the user clicks inside a section (blank area or non-focusable content),
 * focus moves to the first focusable element within that section. If none exist,
 * the section itself is made programmatically focusable and focused.
 * Also lightly supports in‑page hash anchor clicks: after clicking a nav anchor,
 * the destination section (or its first focusable) is focused.
 */
export const useFocusHelper = () => {
  if (!import.meta.client) return { focusCurrentHash: () => { }, focusById: (_: string) => { } }

  let lastUserHash: string | null = null
  let lastUserHashTimestamp = 0
  const USER_HASH_WINDOW = 2000

  const focusableSelector = [
    'a[href]:not([tabindex="-1"]):not(.a11y-helper__skip-link)',
    'button:not([disabled]):not([tabindex="-1"])',
    'input:not([disabled]):not([tabindex="-1"])',
    'select:not([disabled]):not([tabindex="-1"])',
    'textarea:not([disabled]):not([tabindex="-1"])',
    'details summary',
    'audio[controls]',
    'video[controls]',
    '[tabindex]:not([tabindex="-1"]):not(.a11y-helper__skip-link)'
  ].join(',')

  const isElementVisible = (el: HTMLElement): boolean => {
    if (!(el.offsetWidth || el.offsetHeight || el.getClientRects().length)) return false
    if (el.hasAttribute('hidden')) return false
    const style = window.getComputedStyle(el)
    if (style.visibility === 'hidden' || style.display === 'none') return false
    if (el.getAttribute('aria-hidden') === 'true') return false
    return true
  }

  const isNaturallyFocusable = (el: HTMLElement): boolean => {
    if (el.tabIndex >= 0) return true
    if (el.hasAttribute('contenteditable')) return true
    return ['A', 'BUTTON', 'INPUT', 'SELECT', 'TEXTAREA', 'IFRAME', 'SUMMARY'].includes(el.tagName)
  }

  const findFirstFocusableInSection = (section: HTMLElement): HTMLElement | null => {
    const nodes = Array.from(section.querySelectorAll<HTMLElement>(focusableSelector))
    for (const node of nodes) {
      if (isElementVisible(node)) return node
    }
    return null
  }

  const focusElement = (el: HTMLElement): void => {
    if (!isNaturallyFocusable(el)) el.setAttribute('tabindex', '-1')
    requestAnimationFrame(() => { try { el.focus({ preventScroll: true }) } catch { /* ignore */ } })
  }

  const focusById = (id: string): void => {
    if (!id) return
    const section = document.getElementById(id)
    if (!section) return
    const first = findFirstFocusableInSection(section)
    focusElement(first ?? section)
  }

  const focusCurrentHash = (): void => {
    const hash = window.location.hash
    if (!hash) return
    if (Date.now() - lastUserHashTimestamp > USER_HASH_WINDOW) return
    if (hash !== lastUserHash) return
    focusById(hash.slice(1))
  }

  const handleUserAnchorActivation = (hash: string): void => {
    lastUserHash = hash
    lastUserHashTimestamp = Date.now()
    setTimeout(() => focusCurrentHash(), 140)
  }

  const clickListener = (e: Event): void => {
    const target = e.target as HTMLElement | null
    if (!target) return
    // Anchor navigation
    const anchor = target.closest('a:not(.a11y-helper__skip-link), a[href^="#"], area[href^="#"]') as (HTMLAnchorElement | HTMLAreaElement) | null
    if (anchor?.hash && anchor.hash !== '#') {
      handleUserAnchorActivation(anchor.hash)
      return
    }
    // Section blank-area click
    const focusableAncestor = target.closest(
      'a:not(.a11y-helper__skip-link),button,input,select,textarea,[tabindex]:not([tabindex="-1"]):not(.a11y-helper__skip-link)'
    )
    if (focusableAncestor) return // Let native focus happen
    const section = target.closest('section[id], [data-scroll-hash]') as HTMLElement | null
    if (!section) return
    focusElement(section)
  }

  const keyListener = (e: KeyboardEvent): void => {
    if (e.key !== 'Enter' && e.key !== ' ') return
    const target = e.target as HTMLElement | null
    if (!target) return
    if (target instanceof HTMLAnchorElement && target.hash && target.hash !== '#') {
      handleUserAnchorActivation(target.hash)
    }
  }

  const hashChangeListener = () => focusCurrentHash()

  onMounted(() => {
    document.addEventListener('click', clickListener, true)
    document.addEventListener('keydown', keyListener, true)
    window.addEventListener('hashchange', hashChangeListener)
  })

  onBeforeUnmount(() => {
    document.removeEventListener('click', clickListener, true)
    document.removeEventListener('keydown', keyListener, true)
    window.removeEventListener('hashchange', hashChangeListener)
  })

  return { focusCurrentHash, focusById }
}
