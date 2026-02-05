# Cómo probar el acceso de inversores

## Despliegue completado

- **Firestore rules**: desplegadas
- **Firestore indexes**: desplegados (incl. `investorVerificationCodes` email+code)
- **Cloud Functions**: desplegadas en `us-central1`:
  - `sendInvestorVerificationCode`
  - `verifyInvestorCode`
  - `getInvestorDocuments`
  - `getInvestorDocumentDownloadUrl`
  - `markInvestorDocumentViewed`
  - `markInvestorDocumentDownloaded`

## Requisitos para probar

1. **App corriendo** con Firebase configurado (`.env.local` con `VITE_FIREBASE_API_KEY`, etc.).
2. **Un lead** en el CRM cuyo email usarás para el test (ej. tu propio email).
3. **Documentos compartidos** con ese lead (sube un doc en Data Room, configura permisos por stage y mueve el lead a ese stage, o comparte manualmente si tienes esa opción).

## Pasos para probar

### 1. Tener un lead con documentos compartidos

- Entra a **CRM** y crea o elige un lead (ej. email `tu@email.com`).
- Entra a **Data Room**, sube un documento y en **Configure Permissions** asígnale al menos un stage (ej. "Pitch Shared").
- En **CRM**, mueve ese lead al stage configurado (ej. "Pitch Shared") para que se compartan los documentos automáticamente.

### 2. Probar el login de inversor

1. Abre en el navegador (o en otra ventana incógnito):
   ```
   http://localhost:5173/investor/login
   ```
   O con email pref rellenado:
   ```
   http://localhost:5173/investor/login?email=tu@email.com
   ```

2. **Paso 1 – Email**
   - Escribe el **mismo email** del lead (ej. `tu@email.com`).
   - Pulsa **"Send Verification Code"**.

3. **Revisar el código**
   - Si Resend está configurado (`firebase functions:config:set resend.api_key=...`), recibirás un email con un código de 6 dígitos.
   - Si no está configurado, en la Cloud Function `sendInvestorVerificationCode` (logs en Firebase Console > Functions > Logs) a veces se loguea el código en desarrollo; o configura Resend para recibirlo por email.

4. **Paso 2 – Código**
   - Introduce el código de 6 dígitos.
   - Pulsa **"Verify & Access Data Room"**.

5. **Data Room**
   - Deberías entrar a `/investor/dataroom` y ver la lista de documentos compartidos con ese lead.
   - Prueba **View** (abre en nueva pestaña) y **Download**.
   - En el CRM, en el detalle del lead (documentos compartidos) deberías ver actualizado "Viewed" / "Downloaded" cuando corresponda.

### 3. Configurar Resend (para recibir el código por email)

Si aún no lo tienes configurado:

```bash
firebase functions:config:set resend.api_key="re_TU_API_KEY"
```

Luego redeplegar solo functions:

```bash
firebase deploy --only functions
```

API key en: [Resend Dashboard](https://resend.com/api-keys).

### 4. Errores frecuentes

| Mensaje | Qué hacer |
|--------|------------|
| "No account found with this email address" | El email no existe como lead en el CRM. Crea el lead con ese email. |
| "No documents have been shared with this email address yet" | Ese lead no tiene ningún documento compartido. Sube docs, configura permisos por stage y mueve el lead a ese stage. |
| "Invalid verification code" | Código erróneo o expirado (15 min). Pide otro con "Resend". |
| "Session expired" | La sesión dura 7 días. Vuelve a entrar por `/investor/login`. |
| Cloud Functions timeout / error | Revisa **Firebase Console > Functions > Logs** para el nombre de la función que falle. |

### 5. Probar en producción

Cuando despliegues el front (ej. Vercel):

- La URL de login de inversor será: `https://tu-dominio.com/investor/login`
- En las automatizaciones, el link del Data Room en los emails ya apunta a:  
  `https://tu-dominio.com/investor/login?email={email_del_lead}`

No hace falta cambiar nada más en el flujo de inversores para producción.
