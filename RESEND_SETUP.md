# Resend API Setup Guide - InvestiaFlow

## ⚠️ IMPORTANTE: CORS Restriction

**Resend API NO puede ser llamado directamente desde el navegador** debido a restricciones CORS. 

### Soluciones:

1. **Modo Mock (Desarrollo)**: 
   - La aplicación usa automáticamente modo mock cuando se ejecuta en el navegador
   - Los emails se loguean en la consola
   - Perfecto para desarrollo y testing

2. **Cloud Functions (Producción)**:
   - Implementa Cloud Functions para enviar emails desde el servidor
   - Ver sección "Cloud Functions" más abajo

3. **Backend Proxy**:
   - Crea un endpoint en tu backend que llame a Resend
   - El frontend llama a tu backend, no directamente a Resend

## 📋 Pasos para Configurar Resend

### 1. Crear Cuenta en Resend

1. Ve a [Resend.com](https://resend.com)
2. Crea una cuenta o inicia sesión
3. Verifica tu email

### 2. Verificar Dominio

Para enviar emails desde `investia.capital`:

1. Ve a **Domains** en el dashboard de Resend
2. Haz clic en **Add Domain**
3. Ingresa `investia.capital`
4. Agrega los registros DNS que Resend te proporciona:
   - **TXT record** para verificación
   - **MX records** (opcional, para recibir emails)
   - **SPF record** (para autenticación)
   - **DKIM records** (para firma digital)

5. Espera a que Resend verifique el dominio (puede tomar unos minutos)

### 3. Obtener API Key

1. Ve a **API Keys** en el dashboard
2. Haz clic en **Create API Key**
3. Dale un nombre (ej: "InvestiaFlow Production")
4. Copia la API key (solo se muestra una vez)

### 4. Configurar Variables de Entorno

Agrega a tu archivo `.env.local`:

```env
VITE_RESEND_API_KEY=re_xxxxxxxxxxxxxxxxxxxxx
VITE_RESEND_FROM_EMAIL=sebas@investia.capital
```

**⚠️ IMPORTANTE**: 
- El email `FROM_EMAIL` debe ser un dominio verificado en Resend
- Si usas un dominio no verificado, Resend usará `onboarding@resend.dev` (solo para testing)

### 5. Modo Desarrollo (Sin Resend)

Si no configuras `VITE_RESEND_API_KEY`, la aplicación usará el **modo mock**:
- Los emails se loguean en la consola
- No se envían emails reales
- Perfecto para desarrollo y testing

## 📧 Características Implementadas

### Templates HTML Profesionales

Los emails incluyen:
- ✅ Diseño responsive
- ✅ Header con branding de InvestiaFlow
- ✅ Lista de documentos compartidos
- ✅ Botón para acceder al Data Room
- ✅ Footer con información del lead

### Variables de Template

Los templates soportan variables:
- `{{name}}` - Nombre del lead
- `{{firm}}` - Nombre de la firma
- `{{email}}` - Email del lead

### Retry Logic

El servicio de email incluye:
- ✅ 3 intentos automáticos en caso de error
- ✅ Exponential backoff entre intentos
- ✅ Manejo de errores específicos (no retry en emails inválidos)

## 🔄 Sistema de Delays

### Cómo Funciona

1. Cuando una regla tiene `delayDays > 0`:
   - Se crea una `ScheduledTask` en Firestore
   - La tarea se programa para ejecutarse en `delayDays` días

2. El hook `useScheduledTasks` verifica cada minuto:
   - Busca tareas pendientes que ya vencieron
   - Ejecuta las reglas automáticamente

3. Para producción (Cloud Functions):
   - Puedes crear una Cloud Function que se ejecute cada minuto
   - O usar Firestore triggers para ejecutar inmediatamente cuando una tarea vence

### Ejemplo de Cloud Function (Opcional)

```typescript
// functions/src/index.ts
import * as functions from 'firebase-functions';
import { checkAndExecutePendingTasks } from './scheduledTasks';

export const executeScheduledTasks = functions.pubsub
  .schedule('every 1 minutes')
  .onRun(async (context) => {
    // Get all users and check their tasks
    // This is a simplified version
    await checkAndExecutePendingTasks('all-users');
  });
```

## 🧪 Testing

### Modo Mock

Sin configurar Resend, puedes probar:
- Crear reglas de automatización
- Mover leads entre stages
- Ver los logs de emails en la consola

### Modo Real

Con Resend configurado:
- Los emails se envían realmente
- Puedes ver los emails en el dashboard de Resend
- Los logs muestran el resultado del envío

## 📝 Notas Importantes

- **Límites de Resend**: 
  - Free tier: 3,000 emails/mes
  - Verifica los límites antes de producción

- **Rate Limits**:
  - Resend tiene rate limits por API key
  - El retry logic ayuda a manejar errores temporales

- **Seguridad**:
  - Nunca subas `.env.local` a Git
  - Usa diferentes API keys para desarrollo y producción

## 🔄 Próximos Pasos

1. ✅ Configura Resend y verifica tu dominio
2. ✅ Agrega las variables de entorno
3. ✅ Prueba enviando un email manualmente
4. ✅ Crea una regla de automatización con delay
5. ⏳ (Opcional) Configura Cloud Functions para scheduled tasks
