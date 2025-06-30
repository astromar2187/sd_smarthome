# Stage 1: Build a Next.js application
FROM node:20-alpine AS builder

WORKDIR /app

COPY package.json pnpm-lock.yaml ./
RUN npm install -g pnpm && pnpm fetch --prod && pnpm install --frozen-lockfile
COPY . .
RUN NEXT_TELEMETRY_DISABLED=1 pnpm build

# Stage 2: Run the Next.js application
FROM node:20-alpine AS runner

WORKDIR /app

# Adicione esta linha para instalar pnpm na fase runner
# Isso garante que o executável 'pnpm' esteja disponível no PATH
RUN npm install -g pnpm

ENV PORT 3000

COPY --from=builder /app/.next ./.next
COPY --from=builder /app/node_modules ./node_modules
COPY --from=builder /app/package.json ./package.json
COPY --from=builder /app/public ./public

EXPOSE 3000

CMD ["pnpm", "start"]