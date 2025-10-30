#!/bin/sh
set -e

echo "Entrypoint: verificando node_modules..."
if [ ! -d node_modules ] || [ -z "$(ls -A node_modules 2>/dev/null)" ]; then
  echo "node_modules vazio — executando npm ci"
  npm ci
fi

echo "Gerando Prisma client..."
npx prisma generate

echo "Aguardando e aplicando migrations (prisma migrate dev)..."
npx prisma migrate dev --name init --skip-seed || true

if [ -f prisma/seed.ts ]; then
  echo "Executando seed..."
  npx prisma db seed
fi

exec "$@"
