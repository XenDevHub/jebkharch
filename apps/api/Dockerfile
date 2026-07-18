# ─── Stage 1: Builder ────────────────────────────────────────────────────────
FROM node:20-alpine AS builder

WORKDIR /app

# Install OpenSSL for Prisma
RUN apk add --no-cache openssl

RUN npm install -g pnpm

COPY package.json pnpm-workspace.yaml pnpm-lock.yaml ./
COPY packages/shared ./packages/shared
COPY apps/api ./apps/api

# Install all dependencies (with scripts for prisma postinstall)
RUN pnpm install --filter @jebkharch/api...

# Generate Prisma client using the LOCAL prisma version (not npx which downloads latest)
RUN cd apps/api && ./node_modules/.bin/prisma generate || \
    node_modules/.bin/prisma generate || \
    npx --no-install prisma generate

# Build the NestJS app
RUN pnpm --filter @jebkharch/api run build

# ─── Stage 2: Production ─────────────────────────────────────────────────────
FROM node:20-alpine AS production

WORKDIR /app

RUN apk add --no-cache openssl

RUN npm install -g pnpm

COPY package.json pnpm-workspace.yaml pnpm-lock.yaml ./
COPY --from=builder /app/packages/shared ./packages/shared
COPY --from=builder /app/apps/api/package.json ./apps/api/
COPY --from=builder /app/apps/api/dist ./apps/api/dist
COPY --from=builder /app/apps/api/prisma ./apps/api/prisma

# Install PRODUCTION deps only (this installs prisma@5.x as a devDep is needed for generate)
RUN pnpm install --filter @jebkharch/api...

# Generate Prisma client using LOCAL version (v5.x, not npx latest)
RUN cd apps/api && ./node_modules/.bin/prisma generate || \
    ../../node_modules/.bin/prisma generate

EXPOSE 3000

# Start: run migrations then start the app
CMD ["sh", "-c", "cd /app/apps/api && ./node_modules/.bin/prisma migrate deploy && node /app/apps/api/dist/main"]
