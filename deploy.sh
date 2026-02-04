#!/bin/bash

# Script de deploy para Cloud Functions de InvestiaFlow

set -e

echo "🚀 InvestiaFlow - Cloud Functions Deploy"
echo "=========================================="
echo ""

# Colors
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
NC='\033[0m' # No Color

# Check if Firebase CLI is installed
if ! command -v firebase &> /dev/null; then
    echo -e "${RED}❌ Firebase CLI no está instalado${NC}"
    echo "Instala con: npm install -g firebase-tools"
    exit 1
fi

echo -e "${GREEN}✅ Firebase CLI instalado${NC}"

# Check if logged in
if ! firebase login:list &> /dev/null; then
    echo -e "${YELLOW}⚠️  No estás logueado en Firebase${NC}"
    echo "Ejecuta: firebase login"
    exit 1
fi

echo -e "${GREEN}✅ Logueado en Firebase${NC}"

# Set project
echo ""
echo "Configurando proyecto: investiaflow"
firebase use investiaflow || {
    echo -e "${YELLOW}⚠️  Proyecto no encontrado. Creando...${NC}"
    firebase use --add investiaflow
}

# Configure Resend API Key
echo ""
echo "Configurando Resend API Key..."
RESEND_API_KEY="re_bNFqmC9G_H6kifsLNUbtWzdqrSrvhrGEb"
firebase functions:config:set resend.api_key="$RESEND_API_KEY"

echo -e "${GREEN}✅ Resend API Key configurada${NC}"

# Build functions
echo ""
echo "Compilando Cloud Functions..."
cd functions

# Update Node.js version if needed
if grep -q '"node": "18"' package.json; then
    echo "Actualizando Node.js runtime a versión 20..."
    sed -i '' 's/"node": "18"/"node": "20"/' package.json
fi

npm run build

if [ $? -ne 0 ]; then
    echo -e "${RED}❌ Error al compilar las funciones${NC}"
    exit 1
fi

echo -e "${GREEN}✅ Funciones compiladas correctamente${NC}"

# Deploy
echo ""
echo "Desplegando Cloud Functions..."
cd ..
firebase deploy --only functions

if [ $? -eq 0 ]; then
    echo ""
    echo -e "${GREEN}✅ Deploy exitoso!${NC}"
    echo ""
    echo "Las funciones están disponibles. Puedes probar moviendo un lead entre stages."
else
    echo -e "${RED}❌ Error en el deploy${NC}"
    exit 1
fi
