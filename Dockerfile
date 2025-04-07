# Use Node.js LTS as the base image
FROM node:18-alpine

# Create and use the working directory
WORKDIR /app

# Copy package files and install only production dependencies
COPY package*.json ./
RUN npm install --omit=dev

# Copy compiled code and other files
COPY . .

# Expone el puerto 3000 (coincide con tu main.ts)
EXPOSE 3000

# Comando para ejecutar la app (versión compilada)
CMD ["node", "dist/main.js"]