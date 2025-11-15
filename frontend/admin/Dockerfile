# 1. Install dependencies
FROM node:22-bullseye AS deps
WORKDIR /app
COPY package.json package-lock.json ./
# Install system build dependencies required by some native modules
RUN apt-get update \
	&& apt-get install -y --no-install-recommends python3 build-essential make g++ \
	&& rm -rf /var/lib/apt/lists/*

# Install dependencies using npm
RUN npm ci

# 2. Development image
FROM node:22-bullseye AS runner
WORKDIR /app

COPY --from=deps /app/node_modules ./node_modules
COPY . .

EXPOSE 3000
ENV PORT=3000
ENV HOSTNAME=0.0.0.0

CMD ["npm", "run", "dev"]
