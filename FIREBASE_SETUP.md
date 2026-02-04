# Firebase Setup Guide - InvestiaFlow

## 📋 Pasos para Configurar Firebase

### 1. Crear Proyecto en Firebase Console

1. Ve a [Firebase Console](https://console.firebase.google.com/)
2. Haz clic en "Add project" o selecciona un proyecto existente
3. Sigue los pasos del asistente:
   - Nombre del proyecto: `investiaflow` (o el que prefieras)
   - Desactiva Google Analytics si no lo necesitas (o actívalo)
   - Haz clic en "Create project"

### 2. Configurar Authentication

1. En el menú lateral, ve a **Authentication**
2. Haz clic en **Get Started**
3. Habilita los siguientes proveedores:
   - **Email/Password**: Activa "Email/Password" y guarda
   - **Google**: Activa "Google", configura el email de soporte y guarda

### 3. Configurar Firestore Database

1. En el menú lateral, ve a **Firestore Database**
2. Haz clic en **Create database**
3. Selecciona **Start in test mode** (luego configuraremos reglas de seguridad)
4. Elige una ubicación (ej: `us-central1`)
5. Haz clic en **Enable**

### 4. Configurar Storage

1. En el menú lateral, ve a **Storage**
2. Haz clic en **Get Started**
3. Selecciona **Start in test mode** (luego configuraremos reglas)
4. Elige la misma ubicación que Firestore
5. Haz clic en **Done**

### 5. Obtener Credenciales

1. Ve a **Project Settings** (ícono de engranaje)
2. Baja hasta **Your apps**
3. Haz clic en el ícono de **Web** (`</>`)
4. Registra la app con un nombre (ej: "InvestiaFlow Web")
5. Copia las credenciales que aparecen

### 6. Configurar Variables de Entorno

Crea un archivo `.env.local` en la raíz del proyecto con:

```env
VITE_FIREBASE_API_KEY=tu-api-key-aqui
VITE_FIREBASE_AUTH_DOMAIN=tu-proyecto.firebaseapp.com
VITE_FIREBASE_PROJECT_ID=tu-proyecto-id
VITE_FIREBASE_STORAGE_BUCKET=tu-proyecto.appspot.com
VITE_FIREBASE_MESSAGING_SENDER_ID=tu-sender-id
VITE_FIREBASE_APP_ID=tu-app-id
```

### 7. Configurar Reglas de Seguridad de Firestore

Ve a **Firestore Database** > **Rules** y configura:

```javascript
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    // Users can only access their own data
    match /leads/{leadId} {
      allow read, write: if request.auth != null && request.auth.uid == resource.data.userId;
      allow create: if request.auth != null && request.auth.uid == request.resource.data.userId;
    }
    
    match /documents/{documentId} {
      allow read, write: if request.auth != null && request.auth.uid == resource.data.userId;
      allow create: if request.auth != null && request.auth.uid == request.resource.data.userId;
    }
    
    match /automationRules/{ruleId} {
      allow read, write: if request.auth != null && request.auth.uid == resource.data.userId;
      allow create: if request.auth != null && request.auth.uid == request.resource.data.userId;
    }
    
    match /sharedDocuments/{sharedId} {
      allow read, write: if request.auth != null;
    }
  }
}
```

### 8. Configurar Reglas de Seguridad de Storage

Ve a **Storage** > **Rules** y configura:

```javascript
rules_version = '2';
service firebase.storage {
  match /b/{bucket}/o {
    match /users/{userId}/{allPaths=**} {
      allow read, write: if request.auth != null && request.auth.uid == userId;
    }
  }
}
```

## 🚀 Migración Gradual

La aplicación está preparada para funcionar con **mock data** o **Firebase** según la configuración:

- Si las variables de entorno están configuradas → Usa Firebase
- Si no están configuradas → Usa mock data (modo desarrollo)

## 📝 Notas Importantes

- **Nunca** subas `.env.local` a Git (ya está en `.gitignore`)
- Las reglas de seguridad son críticas para producción
- En desarrollo, puedes usar "test mode" pero configura las reglas antes de deploy

## 🔄 Próximos Pasos

1. Configura las credenciales en `.env.local`
2. Prueba el login con Firebase Auth
3. Los servicios se migrarán gradualmente a Firestore
4. Storage se configurará para documentos reales
