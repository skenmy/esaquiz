FROM node:22-slim

WORKDIR /app

COPY package.json package-lock.json* ./
RUN npm ci --omit=dev && npm cache clean --force

COPY relay.js ./
COPY source.html control.html ./

ENV NODE_ENV=production
ENV PORT=8080

EXPOSE 8080

CMD ["node", "relay.js"]
