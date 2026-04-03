FROM node:20-slim AS builder

RUN corepack enable && corepack prepare pnpm@10.33.0 --activate

WORKDIR /app
COPY package.json pnpm-lock.yaml ./
RUN pnpm install --frozen-lockfile
COPY tsconfig.json ./
COPY src/ ./src/
RUN pnpm run build

FROM node:20-slim

RUN corepack enable && corepack prepare pnpm@10.33.0 --activate

WORKDIR /app
COPY package.json pnpm-lock.yaml ./
RUN pnpm install --frozen-lockfile --prod --ignore-scripts
COPY --from=builder /app/node_modules/.pnpm/better-sqlite3@*/node_modules/better-sqlite3/build /app/node_modules/.pnpm/better-sqlite3@*/node_modules/better-sqlite3/build
COPY --from=builder /app/dist ./dist

CMD ["node", "dist/index.js"]
