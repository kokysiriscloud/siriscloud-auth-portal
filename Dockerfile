# syntax=docker/dockerfile:1

FROM node:22-alpine AS build
WORKDIR /app
ARG NG_BUILD_CONFIGURATION=production
COPY package*.json ./
RUN npm install
COPY . .
# `--configuration=production` aplica `fileReplacements` → `environment.prod.ts` (p. ej. API en https://api-auth…).
RUN npm run build -- --configuration=${NG_BUILD_CONFIGURATION}

FROM nginx:1.27-alpine AS runner
COPY nginx.conf /etc/nginx/conf.d/default.conf
COPY --from=build /app/dist/siriscloud-auth-portal/browser /usr/share/nginx/html
EXPOSE 80
CMD ["nginx", "-g", "daemon off;"]
