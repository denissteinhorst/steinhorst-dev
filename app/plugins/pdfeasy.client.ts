// Minimal client-only plugin to expose pdfeasy via nuxtApp.$pdf
export default defineNuxtPlugin(async (nuxtApp) => {
  if (!import.meta.client) return
  try {
    const mod = await import('pdfeasy')
    // Some builds export default, others export the instance directly
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const pdf: any = (mod as any).default ?? (mod as any)
    // Inject as $pdf to be compatible with existing composable lookup
    nuxtApp.provide('pdf', pdf)
  } catch (err) {
    console.warn('[pdfeasy.plugin] Failed to load pdfeasy on client:', err)
  }
})
