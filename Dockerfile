# ========================
# STAGE 1: Development
# ========================
FROM node:20 AS development
WORKDIR /app

COPY package*.json ./
RUN npm ci \
    && npm install --no-save prisma ts-node

COPY . .

EXPOSE 3000

COPY docker-entrypoint.sh /app/docker-entrypoint.sh
RUN chmod +x /app/docker-entrypoint.sh

CMD ["/app/docker-entrypoint.sh"]

# ========================
# STAGE 2: Builder (para produção)
# ========================
FROM node:20 AS builder
WORKDIR /app

COPY package*.json ./
RUN npm ci

COPY . .
RUN npm run build

# ========================
# STAGE 3: Production (runner)
# ========================
FROM node:20-alpine AS production
WORKDIR /app

COPY --from=builder /app/package*.json ./

RUN npm ci --omit=dev

RUN npm install --no-save prisma \
    && npm cache clean --force

COPY --from=builder /app/dist ./dist
COPY --from=builder /app/prisma ./prisma

ENV NODE_ENV=production
ENV PORT=3000

RUN addgroup -S appgroup && adduser -S appuser -G appgroup
USER appuser

EXPOSE 3000

CMD ["node", "dist/main.js"]