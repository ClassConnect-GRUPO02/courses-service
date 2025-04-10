# Usa Node.js LTS con Alpine como base
FROM node:18-alpine

# Crea y usa el directorio de trabajo
WORKDIR /app

# Copia package.json y package-lock.json y instala solo dependencias de producción
COPY package*.json ./
RUN npm install

# Copia todo el código fuente y archivos restantes
COPY . .
RUN npm run build

# Asegura permisos de ejecución del script de entrada
RUN chmod +x ./entrypoint.sh

# Expone el puerto de la app (ajustar si es necesario)
EXPOSE 3000

# Usa el script de entrada
CMD ["./entrypoint.sh"]