FROM cgr.dev/chainguard/node:latest-dev AS base
WORKDIR /app

FROM base AS deps
COPY --chown=node:node package*.json ./
RUN npm ci

FROM deps AS build
COPY --chown=node:node tsconfig.json drizzle.config.ts ./
COPY --chown=node:node src ./src
RUN npm run build

FROM base AS prod-deps
COPY --chown=node:node package*.json ./
RUN npm ci --omit=dev && npm cache clean --force

FROM cgr.dev/chainguard/node:latest AS runner
WORKDIR /app
ENV NODE_ENV=production
ENV PORT=8080
COPY --from=prod-deps --chown=node:node /app/node_modules ./node_modules
COPY --from=build --chown=node:node /app/dist ./dist
CMD ["dist/index.js"]
