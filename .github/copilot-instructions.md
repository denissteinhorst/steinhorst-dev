# GitHub Copilot Guidelines

These instructions are designed to guide GitHub Copilot in making appropriate code suggestions for the Nuxt 4 project, ensuring adherence to best practices and project conventions.

## Assistant operating mode

- Communication style
  - Keep responses concise, impersonal, and pragmatic. Prefer short paragraphs, headings, and bullets. Avoid heavy formatting unless explicitly requested.
  - Start actionable replies with a one‑sentence preamble stating what you will do next, followed by a tiny checklist (for complex tasks) capturing explicit/implicit requirements.
- Agent workflow and cadence
  - Extract explicit and implicit requirements into a short checklist at the beginning of complex tasks and keep it updated.
  - Gather context first; read larger, meaningful chunks. Avoid repo‑wide scans unless explicitly asked.
  - Take action end‑to‑end; only ask clarifying questions when truly blocked.
  - Before batches of tool calls or significant edits, add a one‑line preface; checkpoint progress after ~3–5 tool calls or when creating/editing >3 files.
  - After substantive changes, run quick quality gates (Build/Lint/Tests) where applicable and report PASS/FAIL deltas. For markdown‑only changes, a lint/build skip is acceptable.
  - Security and side‑effects: Don’t exfiltrate secrets or make network calls unless explicitly required by the task; prefer local actions.
  - Validation and green‑before‑done: run relevant builds/tests/linters after edits; if failures occur, attempt up to three targeted fixes before summarizing status.
  - Verification preference: never invent file paths/APIs/commands; verify with tools when uncertain.
- Output hygiene
  - Don’t print file diffs or terminal commands unless explicitly requested. If commands are shown for documentation, keep them optional and one per line.
- Triggers (force behavior)
  - Repo default: Treat prompts in this repository as MAX MODE by default for multi‑step or ambiguous tasks. Use "brevity" to opt out and request the smallest adequate answer.
  - Max depth: Include "MAX MODE" or "go-deep" to explicitly force the full engineering workflow (thorough context gathering, tests, terminal runs, and parallel read‑only calls when helpful).
  - Default: Operate efficiently and proactively; escalate depth automatically based on task complexity.

## Core Rules:

- Only modify files explicitly named in prompts; avoid global scans unless explicitly asked to “look around”.
- You will not peek at any files unless explicitly asked to do so. (This includes README.md, other documentation files and the packages.)
- Before making changes, confirm the file(s) you intend to edit; if not specified, ask which file to modify.
- Base all changes on: Nuxt 4 (pages layouts), Vue 3 Composition API, TypeScript
- Follow project ESLint/Prettier config automatically

## Recommended Approach:

1. Make minimal, targeted changes with clear reasoning
2. Prioritize built-in tools:
   - Use `@nuxt/ui` for UI components
   - Use `@vueuse/nuxt` for composables
   - Use `@nuxt/image` for optimized images

## Important working rules

- Prefer minimal, targeted changes with clear reasoning. Avoid adding dependencies, APIs, or background services unless requested.
- Avoid unnecessary API calls and checks; implement caching/deduping and server-first data fetching by default.
- Keep responses concise and pragmatic. Ask a clarifying question only when truly blocked.
- Do not recreate functionality that already exists in Nuxt 4 or Vue 3. Use built-in features and composables.
- Check NuxtUI Components when available to leverage existing UI components and avoid reinventing the wheel.
- If implementing/fixing a dynamic function that is not covered by Nuxt, NuxtUI or Vue itself, always check VueUse first to see if it already exists as a composable.
- always summarize the changes made in a concise manner.
- Use `@nuxt/image` for optimized images (already installed). Prefer responsive images with proper alt text.
- Use Nuxt's built-in asset handling for CSS, fonts, and other static assets.
- Always have Accessibility in mind: use semantic HTML, provide alt text for images, and ensure keyboard navigation works (WCAG standards).

## References

- Nuxt 4 Guide: https://nuxt.com/docs/guide
- Vue 3 Guide (Composition API): https://vuejs.org/guide/introduction.html
- TypeScript Handbook: https://www.typescriptlang.org/docs/handbook/intro.html
- NuxtUI: https://ui.nuxt.com/components
- VueUse: https://vueuse.org/functions.html
- NuxtAOS: https://github.com/egidiusmengelberg/nuxt-aos#readme
- AOS: https://michalsnik.github.io/aos/
- Vue-Chartjs: https://vue-chartjs.org/guide/
- Chart.js: https://www.chartjs.org/docs/latest/
- Nuxt SEO: https://nuxtseo.com/docs/nuxt-seo/getting-started/introduction
- Nuxt Color Mode: https://color-mode.nuxtjs.org/
- Nuxt Image: https://image.nuxt.com/
- Data-Fetching: https://nuxt.com/docs/4.x/getting-started/data-fetching

## Coding standards (Vue 3 + TypeScript)

- Use `<script setup lang="ts">` and the Composition API exclusively; avoid the Options API and mixins.
- Always use arrow functions, `const` by default, and explicit return types for exported functions/composables.
- Use `defineProps`/`defineEmits` with typed interfaces. Name events in kebab-case, props in camelCase.
- Use `ref` and `computed` over `reactive` when possible; avoid deep reactive structures if not needed.
- Watchers: prefer derived `computed` values; use `watch` only when side-effects are required; always clean up.
- Template: stable `:key` on lists, avoid unnecessary wrappers, and keep markup accessible (semantic elements, labels, alt text).
- Imports: use Nuxt aliases (`~/`, `@/`) and rely on auto-imports for composables and Vue helpers when available.

## Nuxt 4 conventions

- Structure
  - All directories derive from `/app`: Pages in `pages/`, layout(s) in `layouts/`, components in `components/`, composables in `composables/`, utilities in `utils/`, server routes in `server/api/`, middleware in `middleware/`, plugins in `plugins/`.
  - Public assets in `public/` (served as-is). Use `assets/` for processed assets (CSS, images used by Vite).
- Data fetching
  - Prefer `useFetch` for HTTP endpoints and `useAsyncData` for custom async sources.
  - Default to server-first fetching (SSR). Use `{ server: true }` unless there’s a clear client-only need. Use `{ lazy: true }` for non-blocking data.
  - Deduplicate requests with stable keys: e.g., `useFetch('/api/foo', { key: 'foo:list', ... })`.
  - Transform responses close to the source with `transform` and type them.
  - Handle errors via `createError` on the server and Nuxt error boundaries on the client. Avoid leaking stack traces.
- Runtime config
  - Keep secrets in `runtimeConfig` (server-only). Only expose safe values via `public:`. Access via `useRuntimeConfig()`.
- Server routes (Nitro / h3)
  - Use `defineEventHandler` with typed responses. Validate input before doing work. Return minimal payloads.
  - Coalesce similar endpoints; avoid chatty APIs. If not asked, do not call external services.
- Rendering
  - SSR by default. Use `client:only` and `process.client` checks sparingly. Prefer `<Suspense>` for async UI and avoid hydration mismatches.

## Performance and network hygiene

- Cache and dedupe
  - Use stable `key` in `useFetch`/`useAsyncData`. Set `staleTime` where appropriate to reduce refetching.
  - Co-locate repeated data access in a composable; reuse the same key to dedupe.
- Avoid unnecessary requests
  - Fetch on the server where possible. Avoid client refetch unless the user action requires it (`immediate: false`, `lazy: true`).
  - Prefer aggregating multiple needs into one server/API call when feasible.
- Route rules and caching
  - Use `routeRules` and headers for static-like content. Consider `isr` when appropriate. Only add if requested.
- Images and assets
  - Use Nuxt’s built-in tooling. Only introduce `@nuxt/image` or similar if already present or explicitly requested.

Error handling and UX

- Surface friendly messages; log details on the server only.
- Use safe fallbacks (`default` in `useFetch`). Never crash the page for a non-critical error.
- Validate user input early (client) and definitively (server). Return consistent error shapes.

## Testing and verification

- Run lint/type checks before declaring done when the task modifies TypeScript code.

## Implementation checklist for Copilot

1. Confirm the file(s) to edit are explicitly provided; otherwise, ask which file to modify.
2. Apply minimal, typed, SSR-safe, hydration-safe changes using Composition API and arrow functions.
3. Prefer `useFetch`/`useAsyncData` with keys, server-first, caching, and error handling.
4. Keep network and file-system access to the minimum; no repo-wide scans unless asked.
5. Provide a short rationale and list any assumptions made.

## Composable and component Layout-Structure (concise examples)

```ts
// composables/useUsers.ts
/**
 * (Insert proper JSDOC)
 * Explain what this composable does, its purpose, and a minimal example on how to use it.
 */
export const useUsers = () => {
  // add explicit types for better type safety
  interface UserConfig {
    apiUrl: string;
  }

  // Always add explicit typings on custom composables
  const useUsersConfig = ref<UserConfig>({
    apiUrl: "/api/users",
  });

  // Short and simple inline comment to explain the function quickly.
  const someFunction = (): string => {
    // ...
  };

  // Short and simple inline comment to explain the function quickly.
  const someOtherFunction = (): boolean => {
    // ...
  };

  return {
    someFunction,
    someOtherFunction,
  };
};
```

```vue
<!-- pages/users.vue -->
<script setup lang="ts">
const { someFunction, someOtherFunction } = useUsers();

// order the script contents like this:
// 1. Imports
// 2. Props
// 3. Emits
// 4. Composable / Helper calls
// 5. Reactive state (refs, computed)
// 6. Methods
// 7. Lifecycle hooks
// 8. Watchers
</script>

<template>
  <section class="some-section">
    <h1 class="some-section-title">Users</h1>
  </section>
</template>

<style scoped lang="scss">
$block: "some-section";

.#{$block} {
  // Scoped styles for the section
}
</style>
```

## Project structure

```text
steinhorst-dev/
├── app/                   # Nuxt 4 app directory
│   ├── app.vue           # Main app component
│   ├── assets/           # Processed assets (SCSS, images)
│   │   └── scss/
│   │       └── app.scss  # Global SCSS styles
│   ├── pages/            # Route pages (auto-generated routes)
│   ├── components/       # Vue components (PascalCase SFCs)
│   ├── composables/      # useX composables
│   ├── layouts/          # Layout components
│   ├── middleware/       # Route middleware
│   ├── plugins/          # Nuxt plugins
│   │   └── chartjs.client.ts  # Chart.js client plugin
│   ├── server/           # Server-side code
│   │   ├── api/          # API endpoints
│   │   └── middleware/   # Server middleware
│   ├── utils/            # Pure TS utilities (no Vue imports)
│   └── types/            # Shared TypeScript definitions
├── public/               # Static files served as-is
│   ├── favicon.ico
│   └── _robots.txt
├── nuxt.config.ts        # Nuxt configuration
├── package.json          # Dependencies and scripts
├── tsconfig.json         # TypeScript configuration
├── eslint.config.mjs     # ESLint configuration
└── README.md
```

## Assumptions

- Treat unprovided context as unknown; don’t infer external services or schemas.
- Prefer progressive enhancement; avoid breaking existing behavior.
- If a Vue component requires external data, always add a v-if in the `<section>` to ensure it only renders when the data is available.
- Modules available: @nuxt/ui, @nuxt/image, @vueuse/nuxt, nuxt-aos, @nuxtjs/seo, @nuxtjs/color-mode, chart.js, vue-chartjs.

## When in doubt

- If your internal data is not sufficient or in doubt, ask to fetch the documentation of the specific module or composable you are working on.
- Ask one focused question to proceed any further,
- Explain where you see issues or gaps - complement with a minimal example,
- otherwise implement the smallest reasonable solution that fits the above rules.
