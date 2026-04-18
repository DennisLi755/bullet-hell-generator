# Stage 1: Build the webpack bundle
FROM node:20-alpine AS builder
WORKDIR /app
COPY package*.json ./
RUN npm ci
COPY . .
RUN npx webpack

# Stage 2: Serve static files with nginx
FROM nginx:alpine
COPY nginx.conf /etc/nginx/conf.d/default.conf
COPY --from=builder /app/hosted/bundle.js /usr/share/nginx/html/hosted/bundle.js
COPY --from=builder /app/src/client/client.html /usr/share/nginx/html/index.html
COPY --from=builder /app/src/client/style.css /usr/share/nginx/html/style.css
EXPOSE 80
