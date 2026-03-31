FROM node:24-bookworm-slim

WORKDIR /app

# node-pty needs a native build toolchain during npm install.
RUN apt-get update \
  && apt-get install -y --no-install-recommends python3 make g++ openssh-client \
  && rm -rf /var/lib/apt/lists/*

COPY package.json package-lock.json ./
RUN npm ci --omit=dev

COPY . .

ENV NODE_ENV=production
ENV PORT=3000
EXPOSE 3000

CMD ["npm", "start"]
