# Cloud Functions Setup Guide - InvestiaFlow

## 📋 Pasos para Configurar Cloud Functions

### 1. Instalar Firebase CLI

```bash
npm install -g firebase-tools
```

### 2. Login en Firebase

```bash
firebase login
```

### 3. Inicializar Firebase Project (si no está inicializado)

```bash
firebase init functions
```

Cuando te pregunte:
- ¿Qué lenguaje? → **TypeScript**
- ¿Usar ESLint? → **Yes** (opcional)
- ¿Instalar dependencias? → **Yes**

**Nota**: Si ya tienes la carpeta `functions/` creada, puedes saltar este paso.

### 4. Instalar Dependencias

```bash
cd functions
npm install
```

### 4. Configurar Resend API Key

Tienes dos opciones:

#### Opción A: Usando Firebase Config (Recomendado)

```bash
firebase functions:config:set resend.api_key="re_tu_api_key_aqui"
```

#### Opción B: Usando Variables de Entorno

Crea un archivo `functions/.env`:

```env
RESEND_API_KEY=re_tu_api_key_aqui
```

Luego, en `functions/src/index.ts`, ya está configurado para leer de `process.env.RESEND_API_KEY`.

### 5. Compilar TypeScript

```bash
cd functions
npm run build
```

### 6. Probar Localmente (Opcional)

```bash
cd functions
npm run serve
```

Esto iniciará el emulador de Firebase Functions en `http://localhost:5001`.

### 7. Deploy a Firebase

```bash
cd functions
npm run deploy
```

O desde la raíz del proyecto:

```bash
firebase deploy --only functions
```

### 8. Verificar Deployment

Después del deploy, verás algo como:

```
✔  functions[sendDocumentEmail(us-central1)] Successful create operation.
Function URL: https://us-central1-investiaflow.cloudfunctions.net/sendDocumentEmail
```

## 🔧 Configuración del Frontend

El frontend ya está configurado para usar Cloud Functions automáticamente cuando Firebase está configurado. No necesitas hacer cambios adicionales.

### Cómo Funciona

1. El frontend detecta que Firebase está configurado
2. Carga la Cloud Function `sendDocumentEmail`
3. Llama a la función con los datos del email
4. La función envía el email usando Resend desde el servidor

## 🧪 Testing

### Modo Desarrollo (Sin Deploy)

Si no has hecho deploy de las Cloud Functions, el sistema automáticamente usa modo mock y loguea los emails en la consola.

### Modo Producción (Con Deploy)

Una vez deployadas las Cloud Functions:
1. Los emails se envían realmente usando Resend
2. Puedes ver los logs en Firebase Console > Functions > Logs
3. Los errores se manejan automáticamente con retry logic

## 📝 Estructura de Archivos

```
functions/
├── src/
│   └── index.ts          # Cloud Functions code
├── package.json          # Dependencies
├── tsconfig.json         # TypeScript config
└── .env.example          # Example env file
```

## 🔍 Troubleshooting

### Error: "Function not found"

- Verifica que hayas hecho deploy: `firebase deploy --only functions`
- Verifica que el nombre de la función coincida: `sendDocumentEmail`

### Error: "Permission denied"

- Verifica que el usuario esté autenticado
- Verifica las reglas de seguridad de Firestore

### Error: "Resend API key not found"

- Verifica que hayas configurado la API key: `firebase functions:config:get`
- O verifica el archivo `.env` en `functions/`

## 🚀 Próximos Pasos

1. ✅ Configura Resend API key
2. ✅ Deploy Cloud Functions
3. ✅ Prueba enviando un email desde la app
4. ✅ Verifica los logs en Firebase Console

## 📚 Referencias

- [Firebase Functions Docs](https://firebase.google.com/docs/functions)
- [Resend API Docs](https://resend.com/docs/api-reference/emails/send-email)
