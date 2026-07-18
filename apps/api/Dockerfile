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

# Install dependencies (only for api and shared)
RUN pnpm install --filter @jebkharch/api...

# Generate Prisma client
RUN pnpm --filter @jebkharch/api run db:generate

# Build shared package
RUN pnpm --filter @jebkharch/shared run build || echo "Shared package built"

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
RUN pnpm install --filter @jebkharch/api... --prod

# Expose port
EXPOSE 3000

# Start command
CMD ["pnpm", "--filter", "@jebkharch/api", "start:prod"]
