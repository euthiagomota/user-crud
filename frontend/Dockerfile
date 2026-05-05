# ===== Etapa de build (Node 20 + Vite) =====
FROM node:20-alpine AS build
WORKDIR /app
COPY package*.json ./
RUN npm ci
COPY . .
# Gera o build estático (Vite cria /dist por padrão)
RUN npm run build

# ===== Etapa de runtime (Nginx) =====
FROM nginx:alpine
# Configuração do Nginx com proxy /api → backend:8080
COPY ./nginx.conf /etc/nginx/conf.d/default.conf
# Copia o build do Vite para a raiz web do Nginx
COPY --from=build /app/dist /usr/share/nginx/html
EXPOSE 80
