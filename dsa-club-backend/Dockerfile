FROM node:22-alpine

ENV NODE_ENV=production

WORKDIR /app

COPY package*.json ./
RUN npm ci --omit=dev

COPY . .
RUN chown -R node:node /app
USER node

EXPOSE 5000

CMD ["node", "--import", "newrelic/esm-loader.mjs", "server.js"]
