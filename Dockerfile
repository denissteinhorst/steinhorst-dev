# Multi-stage Dockerfile for Nuxt 4 app
ARG NODE_VERSION=22.18.0

# Base image with Node.js
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

# Copy only production dependencies
COPY --from=build /app/.output ./.output

# Expose default Nuxt port
EXPOSE 3000

# Start Nitro server
CMD ["node", ".output/server/index.mjs"]
