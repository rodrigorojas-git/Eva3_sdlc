# Imagen base liviana de Node 22
FROM node:26-alpine

RUN apk upgrade --no-cache
WORKDIR /app

# Primero copiamos solo package.json para aprovechar la caché de Docker
COPY package*.json ./
RUN npm ci --omit=dev

# Copiamos el código de la aplicación
COPY src ./src

# No ejecutamos como root por seguridad
USER node

EXPOSE 3000
CMD ["node", "src/server.js"]

