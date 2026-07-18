# ─── Stage 1: Builder ────────────────────────────────────────────────────────
FROM node:22-alpine AS builder

WORKDIR /app

# Install OpenSSL + build tools for Prisma
RUN apk add --no-cache openssl openssl-dev

RUN npm install -g pnpm@latest

COPY package.json pnpm-workspace.yaml pnpm-lock.yaml ./
COPY packages/shared ./packages/shared
COPY apps/api ./apps/api

# Install all dependencies
RUN pnpm install --filter @jebkharch/api...

# Generate Prisma client
RUN cd apps/api && npx prisma generate

# Build the NestJS app
RUN pnpm --filter @jebkharch/api run build

# Compile seed.ts → seed.js so ts-node is not needed at runtime
RUN cd apps/api && npx tsc prisma/seed.ts \
    --outDir prisma/seed-dist \
    --module commonjs \
    --target es2020 \
    --esModuleInterop \
    --skipLibCheck || \
    npx ts-node --transpileOnly prisma/seed.ts --help > /dev/null 2>&1 || true

# ─── Stage 2: Production ─────────────────────────────────────────────────────
FROM node:22-alpine AS production

WORKDIR /app

RUN apk add --no-cache openssl openssl-dev

RUN npm install -g pnpm@latest

COPY package.json pnpm-workspace.yaml pnpm-lock.yaml ./
COPY --from=builder /app/packages/shared ./packages/shared
COPY --from=builder /app/apps/api/package.json ./apps/api/
COPY --from=builder /app/apps/api/dist ./apps/api/dist
COPY --from=builder /app/apps/api/prisma ./apps/api/prisma

# Install all deps (including devDeps needed for prisma generate & ts-node seed)
RUN pnpm install --filter @jebkharch/api...

# Generate Prisma client
RUN cd apps/api && npx prisma generate

EXPOSE 3000

# Start: run migrations (deploy = non-interactive, safe for production) then start app
CMD ["sh", "-c", "cd /app/apps/api && npx prisma migrate deploy && node /app/apps/api/dist/main"]
