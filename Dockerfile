# Multi-stage Dockerfile for Nuxt 4 app
# Build with (override version if needed):
#   docker build --build-arg NODE_VERSION=22.18.0 -t steinhorst-dev .

ARG NODE_VERSION=22.18.0
FROM node:${NODE_VERSION}-alpine AS base

# Set production env (can be overridden at runtime)
ENV NODE_ENV=production \
    # Prevent telemetry etc (adjust if you want it)
    NUXT_TELEMETRY_DISABLED=1

# Prefer /app working directory
WORKDIR /app

# -----------------------------
# Builder stage
# -----------------------------
FROM base AS build

# Enable corepack (good if you later switch to pnpm/yarn)
RUN corepack enable || true

# Copy only files needed for dependency install first (better cache)
COPY package.json package-lock.json* npm-shrinkwrap.json* .npmrc* .nvmrc* ./

# Install deps (clean, reproducible)
RUN npm ci

# Copy the rest of the source
COPY . .

# Build (produces .output for Nuxt 4 / Nitro)
RUN npm run build

# -----------------------------
# Runner stage - minimal runtime image
# -----------------------------
FROM node:${NODE_VERSION}-alpine AS runner
ENV NODE_ENV=production \
    NUXT_TELEMETRY_DISABLED=1
WORKDIR /app

# Copy only the built output + (optionally) any runtime assets needed at root
# If you rely on public/ at runtime, copy it too (Nitro copies by default when building, but keep explicit if needed)
COPY --from=build /app/.output ./.output
# If you have server side runtime config files, uncomment below:
# COPY --from=build /app/nuxt.config.* /app/package.json ./
# COPY --from=build /app/public ./public

# Expose default Nuxt port
EXPOSE 3000

# A simple healthcheck (optional)
HEALTHCHECK --interval=30s --timeout=5s --start-period=10s --retries=3 CMD node -e 'fetch("http://127.0.0.1:3000").then(r=>{if(r.ok)process.exit(0);process.exit(1)}).catch(()=>process.exit(1))' || exit 1

# Start Nitro server
CMD ["node", ".output/server/index.mjs"]
