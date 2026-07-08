# Docker Architecture

## Overview

Multi-stage Docker builds for production. All images are optimized for minimal size, security, and fast cold starts.

## Frontend (Next.js)

### Dockerfile

```dockerfile
# Stage 1: Dependencies
FROM node:20-alpine AS deps
WORKDIR /app

COPY package.json package-lock.json ./
RUN npm ci --only=production

# Stage 2: Build
FROM node:20-alpine AS builder
WORKDIR /app

COPY --from=deps /app/node_modules ./node_modules
COPY . .

ARG NEXT_PUBLIC_API_URL
ENV NEXT_PUBLIC_API_URL=${NEXT_PUBLIC_API_URL}
ENV NODE_ENV=production

RUN npm run build

# Stage 3: Production runner
FROM node:20-alpine AS runner
WORKDIR /app

RUN addgroup --system --gid 1001 nodejs
RUN adduser --system --uid 1001 nextjs

COPY --from=builder /app/public ./public
COPY --from=builder --chown=nextjs:nodejs /app/.next/standalone ./
COPY --from=builder --chown=nextjs:nodejs /app/.next/static ./.next/static
COPY --from=builder /app/package.json ./package.json

USER nextjs

EXPOSE 3000

ENV NODE_ENV=production
ENV HOSTNAME=0.0.0.0
ENV PORT=3000

CMD ["node", "server.js"]
```

### .dockerignore

```
node_modules
.git
.gitignore
.env*
.next
Dockerfile
.dockerignore
README.md
*.md
coverage
tests
cypress
__tests__
```

### Build

```bash
docker build \
  --build-arg NEXT_PUBLIC_API_URL=https://api.triangleblack.com \
  -t triangleblack/frontend:latest \
  -t triangleblack/frontend:1.0.0 \
  .
```

## Backend (NestJS)

### Dockerfile

```dockerfile
# Stage 1: Dependencies
FROM node:20-alpine AS deps
WORKDIR /app

COPY package.json package-lock.json ./
RUN npm ci --only=production

# Stage 2: Build
FROM node:20-alpine AS builder
WORKDIR /app

COPY --from=deps /app/node_modules ./node_modules
COPY . .

RUN npm run build

# Prisma generate
RUN npx prisma generate

# Stage 3: Production runner
FROM node:20-alpine AS runner
WORKDIR /app

RUN addgroup --system --gid 1001 nodejs
RUN adduser --system --uid 1001 nestjs

# Install libc6-compat for Prisma
RUN apk add --no-cache libc6-compat

# Copy built application
COPY --from=builder /app/dist ./dist
COPY --from=builder /app/node_modules ./node_modules
COPY --from=builder /app/package.json ./package.json
COPY --from=builder /app/prisma ./prisma

USER nestjs

EXPOSE 4000

ENV NODE_ENV=production
ENV PORT=4000

CMD ["node", "dist/main"]
```

### .dockerignore

```
node_modules
.git
.gitignore
.env*
dist
Dockerfile
.dockerignore
README.md
*.md
coverage
tests
e2e
```

### Build

```bash
docker build \
  -t triangleblack/backend:latest \
  -t triangleblack/backend:1.0.0 \
  .
```

## Image Size Targets

| Image | Current Target | Notes |
|-------|---------------|-------|
| Frontend | < 150 MB | Alpine base, standalone output mode |
| Backend | < 250 MB | Includes Prisma engine binary |

## Security Scanning

```bash
# Scan images for vulnerabilities
docker scout quickcheck triangleblack/frontend:latest
docker scout quickcheck triangleblack/backend:latest
```

## Tagging Convention

| Tag | Use | Example |
|-----|-----|---------|
| `latest` | Current production | `triangleblack/frontend:latest` |
| `x.y.z` | Versioned release | `triangleblack/frontend:1.0.0` |
| `git-<sha>` | Specific commit | `triangleblack/frontend:git-a1b2c3d` |

## Layer Caching Strategy

- **deps layer** — cached until `package.json` or `package-lock.json` changes
- **build layer** — cached until any source file changes
- **runner layer** — always thin, rebuilt only when deps or build changes

## Multi-Architecture Support

```bash
# Build for both amd64 and arm64
docker buildx build \
  --platform linux/amd64,linux/arm64 \
  -t triangleblack/frontend:latest \
  --push \
  .
```

AMD64 is the primary target for VPS deployment. ARM64 support enables local development on Apple Silicon.
