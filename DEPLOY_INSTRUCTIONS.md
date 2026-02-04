# 🚀 Instrucciones de Deploy - Cloud Functions

## Opción A: Script Automático (Recomendado)

Ejecuta el script de deploy:

```bash
./deploy.sh
```

El script hará todo automáticamente:
1. Verifica Firebase CLI
2. Verifica login
3. Configura el proyecto
4. Configura Resend API Key
5. Compila las funciones
6. Hace deploy

## Opción B: Manual

### Paso 1: Login en Firebase

Ejecuta en tu terminal:

```bash
firebase login
```

Esto abrirá tu navegador para autenticarte. Una vez completado, continúa con el siguiente paso.

## Paso 2: Vincular Proyecto Firebase

```bash
firebase use investiaflow
```

Si te pregunta si quieres crear el proyecto, selecciona "Use an existing project" y elige `investiaflow`.

## Paso 3: Configurar Resend API Key

Ya tienes tu API key en `.env.local`. Configúrala en Firebase:

```bash
firebase functions:config:set resend.api_key="re_bNFqmC9G_H6kifsLNUbtWzdqrSrvhrGEb"
```

## Paso 4: Compilar las Functions

```bash
cd functions
npm run build
```

Esto compilará el TypeScript a JavaScript en la carpeta `lib/`.

## Paso 5: Deploy

```bash
cd ..
firebase deploy --only functions
```

O desde la carpeta functions:

```bash
cd functions
firebase deploy --only functions
```

## Paso 6: Verificar

Después del deploy, deberías ver algo como:

```
✔  functions[sendDocumentEmail(us-central1)] Successful create operation.
Function URL: https://us-central1-investiaflow.cloudfunctions.net/sendDocumentEmail
```

## ✅ Listo!

Ahora cuando muevas un lead entre stages, los emails se enviarán realmente usando Resend.

## 🔍 Troubleshooting

### Error: "Project not found"
- Verifica que el proyecto `investiaflow` exista en Firebase Console
- O crea un nuevo proyecto: `firebase projects:create investiaflow`

### Error: "Permission denied"
- Verifica que estés logueado: `firebase login:list`
- Verifica que tengas permisos en el proyecto

### Error: "Function not found after deploy"
- Espera unos segundos, las funciones pueden tardar en estar disponibles
- Verifica en Firebase Console > Functions que la función esté deployada
