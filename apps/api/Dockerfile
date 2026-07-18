# Base image
FROM node:20-alpine AS builder

# Create app directory
WORKDIR /app

# Install pnpm
RUN npm install -g pnpm

# Copy root workspace configs
COPY package.json pnpm-workspace.yaml pnpm-lock.yaml ./

# Copy shared package and api package
COPY packages/shared ./packages/shared
COPY apps/api ./apps/api

# Install dependencies
RUN pnpm install --filter @jebkharch/api... --ignore-scripts

# Allow Prisma build scripts explicitly
RUN pnpm approve-builds --filter @jebkharch/api... || true

# Generate Prisma client directly (bypass pnpm script lookup)
RUN cd apps/api && npx prisma generate

# Build API
RUN pnpm --filter @jebkharch/api run build

# ---

# Production image
FROM node:20-alpine AS production

WORKDIR /app

RUN npm install -g pnpm

# Copy root configs
COPY package.json pnpm-workspace.yaml pnpm-lock.yaml ./

# Copy packages
COPY --from=builder /app/packages/shared ./packages/shared
COPY --from=builder /app/apps/api/package.json ./apps/api/
COPY --from=builder /app/apps/api/dist ./apps/api/dist
COPY --from=builder /app/apps/api/prisma ./apps/api/prisma

# Install production dependencies only
RUN pnpm install --filter @jebkharch/api... --prod --ignore-scripts

# Re-generate Prisma client in production image
RUN cd apps/api && npx prisma generate

# Expose port
EXPOSE 3000

# Start command: run migrations then start the app
CMD ["sh", "-c", "cd apps/api && npx prisma migrate deploy && node /app/apps/api/dist/main"]
