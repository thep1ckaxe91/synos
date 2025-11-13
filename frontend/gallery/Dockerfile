# 1. Install dependencies
FROM node:22-bullseye AS deps
WORKDIR /app
COPY package.json yarn.lock ./
# Install system build dependencies required by some native modules
RUN apt-get update \
	&& apt-get install -y --no-install-recommends python3 build-essential make g++ \
	&& rm -rf /var/lib/apt/lists/*

# Ensure Yarn Classic (v1) is available and active via corepack, then install
RUN corepack prepare yarn@1.22.19 --activate
RUN yarn install

# 2. Build the app
FROM node:20-bullseye AS builder
WORKDIR /app
COPY --from=deps /app/node_modules ./node_modules
COPY . .
RUN yarn build

# 3. Production image
FROM node:20-bullseye AS runner
WORKDIR /app

COPY --from=builder /app/public ./public
COPY --from=builder /app/.next/standalone ./
COPY --from=builder /app/.next/static ./.next/static

EXPOSE 3000
ENV PORT=3000
ENV HOSTNAME=0.0.0.0

CMD ["node", "server.js"]