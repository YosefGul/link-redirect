# Stage 1: Dependencies
FROM node:20-alpine AS deps
WORKDIR /app
COPY package*.json ./
RUN npm ci

# Stage 2: Builder
FROM node:20-alpine AS builder
WORKDIR /app

# Install OpenSSL for Prisma (both build and runtime compatibility)
RUN apk add --no-cache openssl openssl-dev

## Build-time environment for Next.js/Prisma (env validation runs during build)
ARG DATABASE_URL
ARG JWT_SECRET
ARG JWT_EXPIRES_IN=24h
ENV DATABASE_URL=$DATABASE_URL
ENV JWT_SECRET=$JWT_SECRET
ENV JWT_EXPIRES_IN=$JWT_EXPIRES_IN

# Force Prisma to use OpenSSL 3.x
ENV PRISMA_ENGINES_CHECKSUM_IGNORE_MISSING=1

COPY --from=deps /app/node_modules ./node_modules
COPY . .
RUN npx prisma generate
RUN npm run build

# Stage 3: Runner
FROM node:20-alpine AS runner
WORKDIR /app

ENV NODE_ENV=production

# Install OpenSSL 3.x for Prisma compatibility
RUN apk add --no-cache openssl openssl-dev libgcc libstdc++

RUN addgroup --system --gid 1001 nodejs
RUN adduser --system --uid 1001 nextjs

COPY --from=builder /app/public ./public
COPY --from=builder /app/.next/standalone ./
COPY --from=builder /app/.next/static ./.next/static
COPY --from=builder /app/node_modules/.prisma ./node_modules/.prisma
COPY --from=builder /app/node_modules/@prisma ./node_modules/@prisma
COPY --from=builder /app/prisma ./prisma

USER nextjs

EXPOSE 3000

ENV PORT=3000
ENV HOSTNAME="0.0.0.0"

CMD ["node", "server.js"]



