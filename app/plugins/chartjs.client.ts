/**
 * Nuxt (client-only) plugin for Chart.js v3+ that registers all controllers, elements,
 * scales and plugins used across the application.
 *
 * Why this exists:
 * - Since Chart.js v3, tree-shaking is enabled and nothing is registered globally by default.
 *   You must explicitly register the parts you use. Doing so in one place avoids duplicated
 *   registration logic in components and prevents runtime errors like
 *   "controller is not a constructor" or "Scale not registered".
 *
 * What it does:
 * - Imports Chart.js core and the required parts, then calls `Chart.register(...)` once on
 *   client startup. This mutates the global Chart.js registry for the current bundle/runtime.
 *
 * Where it runs:
 * - The filename suffix `.client.ts` ensures the plugin only runs in the browser (no SSR).
 *
 * Usage in components (example):
 *
 *   import { Chart } from 'chart.js'
 *
 *   const chart = new Chart(ctx, {
 *     type: 'bar',
 *     data: { … },
 *     options: { … }
 *   })
 *
 * Notes:
 * - You can safely add more Chart.js parts to the registration list as new chart types
 *   or features are introduced in the app.
 * - If you rely on a Vue wrapper (e.g. vue-chartjs), this plugin still helps by ensuring
 *   required parts are registered before the wrapper initializes charts.
 *
 * @see https://www.chartjs.org/docs/latest/getting-started/integration.html#bundlers-webpack-rollup-etc
 */
import {
  ArcElement,
  BarController,
  BarElement,
  CategoryScale,
  Chart,
  Filler,
  Legend,
  LineElement,
  LinearScale,
  PointElement,
  PolarAreaController,
  RadarController,
  RadialLinearScale,
  Title,
  Tooltip,
} from 'chart.js'

/**
 * Registers the required Chart.js parts at Nuxt app start (client-side only).
 */
export default defineNuxtPlugin(() => {
  Chart.register(
    CategoryScale,
    LinearScale,
    BarController,
    BarElement,
    ArcElement,
    Title,
    Legend,
    Tooltip,
    RadarController,
    PolarAreaController,
    RadialLinearScale,
    PointElement,
    LineElement,
    Filler
  )
})
