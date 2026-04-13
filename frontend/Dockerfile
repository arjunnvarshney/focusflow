# Build Stage
FROM node:18-alpine as build-stage

WORKDIR /app

# Copy package files
COPY package*.json ./
RUN npm install

# Copy source and build
COPY . .
RUN npm run build

# Production Stage: Serving with Nginx
FROM nginx:stable-alpine as production-stage

# Copy custom Nginx config
COPY nginx.conf /etc/nginx/conf.d/default.conf

# Copy the build output to Nginx's serve directory
COPY --from=build-stage /app/dist /usr/share/nginx/html

# Copy custom Nginx config if needed, or use default
# EXPOSE 80

CMD ["nginx", "-g", "daemon off;"]
