#!/usr/bin/env node

/**
 * Script para resetear completamente Firebase (Firestore + Storage)
 * 
 * USO:
 *   node scripts/reset-firebase.js
 * 
 * ADVERTENCIA: Esto borrará TODOS los datos. No se puede deshacer.
 */

import admin from 'firebase-admin';
import readline from 'readline';

// Initialize Firebase Admin
const PROJECT_ID = 'investiaflow'; // From .env.local VITE_FIREBASE_PROJECT_ID

try {
  // Initialize with default credentials (from Firebase CLI) and explicit project ID
  admin.initializeApp({
    projectId: PROJECT_ID,
    credential: admin.credential.applicationDefault(),
  });
  console.log(`✓ Conectado a proyecto Firebase: ${PROJECT_ID}\n`);
} catch (error) {
  console.error('Error initializing Firebase Admin:', error.message);
  console.error('\nAsegúrate de estar autenticado con Firebase CLI:');
  console.error('  firebase login');
  console.error('\nO configura las credenciales de servicio manualmente.');
  process.exit(1);
}

const db = admin.firestore();
const storage = admin.storage();

// Lista de todas las colecciones a borrar
const COLLECTIONS = [
  'leads',
  'documents',
  'documentPermissions',
  'sharedDocuments',
  'automationRules',
  'scheduledTasks',
  'leadActivities',
  'leadComments',
  'investorVerificationCodes',
  'investorSessions',
];

// Función para borrar una colección completa
async function deleteCollection(collectionName) {
  console.log(`\n🗑️  Borrando colección: ${collectionName}...`);
  
  const collectionRef = db.collection(collectionName);
  const snapshot = await collectionRef.get();
  
  if (snapshot.empty) {
    console.log(`   ✓ Colección ${collectionName} ya está vacía`);
    return 0;
  }
  
  const batchSize = 500;
  const batches = [];
  let deletedCount = 0;
  
  // Dividir en batches de 500 (límite de Firestore)
  for (let i = 0; i < snapshot.docs.length; i += batchSize) {
    const batch = db.batch();
    const docs = snapshot.docs.slice(i, i + batchSize);
    
    docs.forEach((doc) => {
      batch.delete(doc.ref);
      deletedCount++;
    });
    
    batches.push(batch);
  }
  
  // Ejecutar todos los batches
  for (const batch of batches) {
    await batch.commit();
  }
  
  console.log(`   ✓ Borrados ${deletedCount} documentos de ${collectionName}`);
  return deletedCount;
}

// Función para borrar todos los archivos de Storage
async function deleteAllStorageFiles() {
  console.log(`\n🗑️  Borrando archivos de Storage...`);
  
  try {
    const bucket = storage.bucket();
    const [files] = await bucket.getFiles({ prefix: 'documents/' });
    
    if (files.length === 0) {
      console.log(`   ✓ No hay archivos en Storage`);
      return 0;
    }
    
    console.log(`   Encontrados ${files.length} archivos para borrar...`);
    
    // Borrar en batches
    const batchSize = 100;
    let deletedCount = 0;
    
    for (let i = 0; i < files.length; i += batchSize) {
      const batch = files.slice(i, i + batchSize);
      await Promise.all(batch.map(file => {
        return file.delete().then(() => {
          deletedCount++;
          if (deletedCount % 50 === 0) {
            process.stdout.write(`   Progreso: ${deletedCount}/${files.length}\r`);
          }
        });
      }));
    }
    
    console.log(`   ✓ Borrados ${deletedCount} archivos de Storage`);
    return deletedCount;
  } catch (error) {
    console.error(`   ✗ Error borrando Storage:`, error.message);
    return 0;
  }
}

// Función principal
async function resetFirebase() {
  console.log('\n╔════════════════════════════════════════════════════════╗');
  console.log('║     RESET COMPLETO DE FIREBASE - ADVERTENCIA           ║');
  console.log('╚════════════════════════════════════════════════════════╝');
  console.log('\n⚠️  ESTO BORRARÁ TODOS LOS DATOS:');
  console.log('   - Leads');
  console.log('   - Documentos');
  console.log('   - Permisos');
  console.log('   - Reglas de automatización');
  console.log('   - Tareas programadas');
  console.log('   - Historial y comentarios');
  console.log('   - Sesiones de inversores');
  console.log('   - Archivos en Storage');
  console.log('\n⚠️  ESTA ACCIÓN NO SE PUEDE DESHACER!\n');
  
  // Confirmación
  const rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout,
  });
  
  return new Promise((resolve, reject) => {
    rl.question('¿Estás seguro? Escribe "RESET" para confirmar: ', async (answer) => {
      rl.close();
      
      if (answer !== 'RESET') {
        console.log('\n❌ Reset cancelado. No se borró nada.');
        resolve();
        return;
      }
      
      try {
        console.log('\n🚀 Iniciando reset...\n');
        
        let totalDeleted = 0;
        
        // Borrar todas las colecciones
        for (const collection of COLLECTIONS) {
          const count = await deleteCollection(collection);
          totalDeleted += count;
        }
        
        // Borrar archivos de Storage
        const storageCount = await deleteAllStorageFiles();
        
        console.log('\n╔════════════════════════════════════════════════════════╗');
        console.log('║              ✅ RESET COMPLETADO                        ║');
        console.log('╚════════════════════════════════════════════════════════╝');
        console.log(`\n📊 Resumen:`);
        console.log(`   - Documentos borrados: ${totalDeleted}`);
        console.log(`   - Archivos borrados: ${storageCount}`);
        console.log(`\n✨ Firebase está ahora completamente limpio.`);
        console.log(`   Puedes empezar a crear nuevos datos desde cero.\n`);
        
        resolve();
      } catch (error) {
        console.error('\n❌ Error durante el reset:', error);
        reject(error);
      }
    });
  });
}

// Ejecutar
resetFirebase()
  .then(() => {
    process.exit(0);
  })
  .catch((error) => {
    console.error('Error fatal:', error);
    process.exit(1);
  });
