#!/bin/sh 

echo "Esperando a que la base de datos esté disponible en $DB_HOST:$DB_PORT..."

until nc -z $DB_HOST $DB_PORT; do
  echo "Esperando..."
  sleep 1
done

echo "Base de datos disponible 🎉"

echo "Ejecutando Prisma db push..."
npx prisma db push

echo "Levantando la app 🚀"
exec node dist/main.js