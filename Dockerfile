# Usa Node.js LTS con Alpine como base
FROM node:18-alpine

# Instala netcat (necesario para esperar la DB)
RUN apk add --no-cache netcat-openbsd

# Crea y usa el directorio de trabajo
WORKDIR /app

# Copia package.json y package-lock.json e instala solo dependencias de producción
COPY package*.json ./
RUN npm install

# Copia todo el código fuente y archivos restantes
COPY . .

# Build del proyecto
RUN npm run build

# Expone el puerto de la app
EXPOSE 3000

# Comando de inicio con lógica incluida (sin necesidad de entrypoint.sh)
CMD ["sh", "-c", "\
  echo 'Esperando a que la base de datos esté disponible en $DB_HOST:$DB_PORT...' && \
  until nc -z $DB_HOST $DB_PORT; do echo 'Esperando...'; sleep 1; done && \
  echo 'Base de datos disponible 🎉' && \
  echo 'Ejecutando Prisma db push...' && \
  npx prisma db push && \
  echo 'Levantando la app 🚀' && \
  node dist/main.js"]