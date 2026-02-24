FROM node:20-alpine AS deps
WORKDIR /app
COPY package.json pnpm-lock.yaml ./
RUN corepack enable && pnpm install --frozen-lockfile

FROM node:20-alpine AS builder
WORKDIR /app
COPY --from=deps /app/node_modules ./node_modules
COPY . .
RUN corepack enable
RUN pnpm build

FROM node:20-alpine
WORKDIR /app
RUN adduser --disabled-password --no-create-home appuser
USER appuser
COPY --from=builder --chown=appuser:appsuser /app/.next/standalone ./
COPY --from=builder --chown=appuser:appsuser /app/.next/static ./.next/static
COPY --from=builder --chown=appuser:appsuser /app/public ./public
EXPOSE 3000
CMD ["node", "server.js"]