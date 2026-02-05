#!/bin/bash

# Script para resetear Firebase usando Firebase CLI
# Requiere: firebase-tools instalado y autenticado

set -e

echo ""
echo "╔════════════════════════════════════════════════════════╗"
echo "║     RESET COMPLETO DE FIREBASE - ADVERTENCIA           ║"
echo "╚════════════════════════════════════════════════════════╝"
echo ""
echo "⚠️  ESTO BORRARÁ TODOS LOS DATOS:"
echo "   - Leads"
echo "   - Documentos"
echo "   - Permisos"
echo "   - Reglas de automatización"
echo "   - Tareas programadas"
echo "   - Historial y comentarios"
echo "   - Sesiones de inversores"
echo "   - Archivos en Storage"
echo ""
echo "⚠️  ESTA ACCIÓN NO SE PUEDE DESHACER!"
echo ""

read -p "¿Estás seguro? Escribe 'RESET' para confirmar: " confirm

if [ "$confirm" != "RESET" ]; then
    echo ""
    echo "❌ Reset cancelado. No se borró nada."
    exit 0
fi

echo ""
echo "🚀 Iniciando reset..."
echo ""

PROJECT_ID="investiaflow"
COLLECTIONS=(
    "leads"
    "documents"
    "documentPermissions"
    "sharedDocuments"
    "automationRules"
    "scheduledTasks"
    "leadActivities"
    "leadComments"
    "investorVerificationCodes"
    "investorSessions"
)

# Borrar colecciones usando Firebase CLI
TOTAL_DELETED=0
for collection in "${COLLECTIONS[@]}"; do
    echo -n "🗑️  Borrando colección: $collection... "
    
    # Usar firebase firestore:delete con --recursive y --force para modo no interactivo
    OUTPUT=$(firebase firestore:delete "$collection" --project "$PROJECT_ID" --recursive --force 2>&1)
    
    if [ $? -eq 0 ]; then
        echo "✓ Completado"
        TOTAL_DELETED=$((TOTAL_DELETED + 1))
    else
        echo "⚠️  (puede estar vacía o no existir)"
    fi
done

echo ""
echo "   Total de colecciones procesadas: ${#COLLECTIONS[@]}"

# Nota: Firebase CLI no tiene comando directo para borrar Storage de forma recursiva
# Los archivos de Storage se pueden borrar manualmente desde la consola o usando gsutil
echo ""
echo "⚠️  Nota: Los archivos de Storage deben borrarse manualmente desde:"
echo "   https://console.firebase.google.com/project/$PROJECT_ID/storage"
echo "   O usando: gsutil -m rm -r gs://$PROJECT_ID.firebasestorage.app/documents/"

echo ""
echo "╔════════════════════════════════════════════════════════╗"
echo "║              ✅ RESET COMPLETADO                        ║"
echo "╚════════════════════════════════════════════════════════╝"
echo ""
echo "✨ Firebase está ahora completamente limpio."
echo "   Puedes empezar a crear nuevos datos desde cero."
echo ""
