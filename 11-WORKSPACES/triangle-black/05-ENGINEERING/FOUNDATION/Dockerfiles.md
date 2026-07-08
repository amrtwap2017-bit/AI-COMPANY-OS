# APP-005 — Dockerfiles

## `apps/api/Dockerfile`

```dockerfile
# Multi-stage build
FROM node:22-alpine AS base
RUN corepack enable && corepack prepare pnpm@latest --activate
WORKDIR /app

# Dependencies
FROM base AS deps
COPY pnpm-lock.yaml pnpm-workspace.yaml ./
COPY package.json ./
COPY apps/api/package.json ./apps/api/package.json
COPY packages/ ./packages/
RUN pnpm fetch --frozen-lockfile

# Build
FROM deps AS build
COPY . .
RUN pnpm install --offline
RUN pnpm build --filter=@tb/api
RUN pnpm prune --prod --filter=@tb/api

# Development
FROM base AS development
COPY --from=deps /app/node_modules /app/node_modules
COPY . .
EXPOSE 4000
CMD ["pnpm", "--filter=@tb/api", "dev"]

# Production
FROM node:22-alpine AS production
WORKDIR /app
COPY --from=build /app/apps/api/dist ./dist
COPY --from=build /app/node_modules ./node_modules
COPY --from=build /app/apps/api/package.json ./
EXPOSE 4000
CMD ["node", "dist/main"]
```

## `apps/web/Dockerfile`

```dockerfile
FROM node:22-alpine AS base
RUN corepack enable && corepack prepare pnpm@latest --activate
WORKDIR /app

FROM base AS deps
COPY pnpm-lock.yaml pnpm-workspace.yaml ./
COPY package.json ./
COPY apps/web/package.json ./apps/web/package.json
COPY packages/ ./packages/
RUN pnpm fetch --frozen-lockfile

FROM deps AS build
COPY . .
RUN pnpm install --offline
RUN pnpm build --filter=@tb/web

FROM base AS development
COPY --from=deps /app/node_modules /app/node_modules
COPY . .
EXPOSE 3000
CMD ["pnpm", "--filter=@tb/web", "dev"]

FROM node:22-alpine AS production
WORKDIR /app
COPY --from=build /app/apps/web/.next ./.next
COPY --from=build /app/apps/web/public ./public
COPY --from=build /app/apps/web/package.json ./
COPY --from=build /app/node_modules ./node_modules
EXPOSE 3000
CMD ["pnpm", "--filter=@tb/web", "start"]
```

## `apps/worker/Dockerfile`

```dockerfile
FROM node:22-alpine AS base
RUN corepack enable && corepack prepare pnpm@latest --activate
WORKDIR /app

FROM base AS deps
COPY pnpm-lock.yaml pnpm-workspace.yaml ./
COPY package.json ./
COPY apps/worker/package.json ./apps/worker/package.json
COPY packages/ ./packages/
RUN pnpm fetch --frozen-lockfile

FROM deps AS build
COPY . .
RUN pnpm install --offline
RUN pnpm build --filter=@tb/worker
RUN pnpm prune --prod --filter=@tb/worker

FROM base AS development
COPY --from=deps /app/node_modules /app/node_modules
COPY . .
CMD ["pnpm", "--filter=@tb/worker", "dev"]

FROM node:22-alpine AS production
WORKDIR /app
COPY --from=build /app/apps/worker/dist ./dist
COPY --from=build /app/node_modules ./node_modules
CMD ["node", "dist/main"]
```
