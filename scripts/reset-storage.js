#!/usr/bin/env node

/**
 * Script para borrar archivos de Storage usando Firebase Admin
 * Se ejecuta después del reset de Firestore
 */

import admin from 'firebase-admin';

const PROJECT_ID = 'investiaflow';
const STORAGE_BUCKET = 'investiaflow.firebasestorage.app';

try {
  admin.initializeApp({
    projectId: PROJECT_ID,
    storageBucket: STORAGE_BUCKET,
    credential: admin.credential.applicationDefault(),
  });
} catch (error) {
  // Si ya está inicializado, continuar
  if (!admin.apps.length) {
    console.error('Error initializing Firebase Admin:', error.message);
    console.error('\nEste script requiere credenciales de aplicación por defecto.');
    console.error('Ejecuta: gcloud auth application-default login');
    console.error('\nO puedes borrar Storage manualmente desde:');
    console.error(`   https://console.firebase.google.com/project/${PROJECT_ID}/storage`);
    process.exit(1);
  }
}

const bucket = admin.storage().bucket(STORAGE_BUCKET);

async function deleteStorageFiles() {
  console.log('\n🗑️  Borrando archivos de Storage...\n');
  
  try {
    const [files] = await bucket.getFiles({ prefix: 'documents/' });
    
    if (files.length === 0) {
      console.log('   ✓ No hay archivos en Storage');
      return;
    }
    
    console.log(`   Encontrados ${files.length} archivos para borrar...`);
    
    let deletedCount = 0;
    const batchSize = 100;
    
    for (let i = 0; i < files.length; i += batchSize) {
      const batch = files.slice(i, i + batchSize);
      await Promise.all(
        batch.map(file => 
          file.delete().then(() => {
            deletedCount++;
            if (deletedCount % 50 === 0) {
              process.stdout.write(`   Progreso: ${deletedCount}/${files.length}\r`);
            }
          }).catch(err => {
            console.error(`   Error borrando ${file.name}:`, err.message);
          })
        )
      );
    }
    
    console.log(`\n   ✓ Borrados ${deletedCount} archivos de Storage`);
  } catch (error) {
    console.error('   ✗ Error borrando Storage:', error.message);
    console.error('   Puedes borrar manualmente desde la consola de Firebase');
  }
}

deleteStorageFiles()
  .then(() => {
    console.log('\n✅ Reset de Storage completado\n');
    process.exit(0);
  })
  .catch((error) => {
    console.error('Error fatal:', error);
    process.exit(1);
  });
