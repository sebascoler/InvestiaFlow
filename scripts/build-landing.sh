#!/usr/bin/env bash
# Export solo la landing (Next.js) a carpeta out/. Oculta src/ durante el build
# para que Next no compile la app Vite (src/pages).
set -e
ROOT="$(cd "$(dirname "$0")/.." && pwd)"
cd "$ROOT"
SRC_BAK="_src_vite_app"
if [ -d "src" ]; then
  mv src "$SRC_BAK"
  trap "mv '$SRC_BAK' src" EXIT
fi
npx next build
# Restore even on success (trap runs on EXIT)
if [ -d "$SRC_BAK" ]; then
  mv "$SRC_BAK" src
  trap - EXIT
fi
echo "Listo. Contenido para Hostinger está en: out/"
