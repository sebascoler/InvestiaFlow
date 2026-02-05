# Guía de Pruebas - InvestiaFlow

Esta guía te ayudará a probar todas las nuevas funcionalidades implementadas.

## Pre-requisitos

1. **Firebase configurado**: Asegúrate de tener `.env.local` con las variables necesarias
2. **Cloud Functions desplegadas**: Las funciones deben estar desplegadas en Firebase
3. **Navegador**: Abre la aplicación en modo desarrollo o producción

## Fase 1: Mejoras de Corto Plazo

### 1.1 Actualización de Perfil

**Cómo probar:**
1. Ve a `/settings` (pestaña "Perfil")
2. Haz clic en "Editar Perfil"
3. Actualiza:
   - Nombre
   - Empresa (opcional)
   - Teléfono (opcional)
4. Haz clic en "Guardar Cambios"
5. Verifica que los cambios se guardaron

**Qué verificar:**
- ✅ Los cambios se guardan en Firestore (colección `userProfiles`)
- ✅ El nombre se actualiza en el header/navbar
- ✅ Si usas Firebase Auth, el email no se puede editar desde aquí

### 1.2 Vista Previa de Documentos

**Cómo probar:**
1. Ve a `/dataroom`
2. Haz clic en el botón de "Preview" (👁️) en cualquier documento
3. Verifica que se abre un modal con la vista previa

**Qué verificar:**
- ✅ PDFs se muestran en un iframe
- ✅ Imágenes se muestran correctamente
- ✅ Tipos no soportados muestran mensaje apropiado
- ✅ Funciona tanto en Data Room interno como en Data Room de inversores

### 1.3 Notificaciones en Tiempo Real

**Cómo probar:**
1. Comparte un documento con un lead (configura permisos o usa automation)
2. Como inversor, accede al Data Room y:
   - Abre la vista previa de un documento (marca como visto)
   - Descarga un documento (marca como descargado)
3. Vuelve a la aplicación principal
4. Verifica las notificaciones en tiempo real

**Qué verificar:**
- ✅ Las notificaciones aparecen sin recargar la página
- ✅ El contador de no leídas se actualiza automáticamente
- ✅ Las notificaciones se guardan en Firestore (colección `notifications`)
- ✅ Puedes marcar como leídas y eliminar notificaciones

## Fase 2: Sistema Multi-Usuario

### 2.1 Crear Team (Automático)

**Cómo probar:**
1. Inicia sesión con un usuario
2. El sistema debería crear automáticamente un team llamado "{Tu Nombre}'s Team"
3. Ve a `/team` para ver tu team

**Qué verificar:**
- ✅ Se crea un team automáticamente si no tienes uno
- ✅ Eres el owner del team
- ✅ Apareces como miembro activo

### 2.2 Invitar Miembros

**Cómo probar:**
1. Ve a `/team`
2. Haz clic en "Invite Member"
3. Ingresa un email y selecciona un rol (Viewer, Editor, Admin)
4. Haz clic en "Send Invitation"
5. Verifica que se envía el email (revisa la consola de Firebase Functions)

**Qué verificar:**
- ✅ Se crea una invitación en Firestore (`teamInvitations`)
- ✅ Se envía un email con el link de invitación
- ✅ El link tiene formato `/invite/{token}`

### 2.3 Aceptar Invitación

**Cómo probar:**
1. Abre el link de invitación en el email (o copia el token)
2. Accede a `/invite/{token}` mientras estás autenticado
3. Verifica que se acepta automáticamente

**Qué verificar:**
- ✅ Si no estás autenticado, redirige a login
- ✅ Si el email no coincide, muestra error
- ✅ Si la invitación expiró, muestra mensaje apropiado
- ✅ Si todo está bien, te agrega como miembro del team
- ✅ Redirige a `/team` después de aceptar

### 2.4 Gestión de Miembros

**Cómo probar:**
1. Como owner/admin, ve a `/team`
2. Cambia el rol de un miembro usando el dropdown
3. Intenta remover un miembro (no owner)
4. Intenta remover el owner (debería fallar)

**Qué verificar:**
- ✅ Solo owner/admin pueden cambiar roles
- ✅ Solo owner/admin pueden ver botones de gestión
- ✅ No se puede remover el owner
- ✅ Los cambios se reflejan inmediatamente

### 2.5 Sistema de Permisos

**Cómo probar:**

**Como Viewer:**
1. Invita un usuario con rol "Viewer"
2. Inicia sesión como ese usuario
3. Verifica que:
   - ✅ Puede ver leads y documentos
   - ✅ NO puede crear leads (botón "Add Lead" oculto)
   - ✅ NO puede editar leads (botón "Edit" oculto)
   - ✅ NO puede eliminar leads (botón "Delete" oculto)
   - ✅ NO puede subir documentos (botón "Upload" oculto)
   - ✅ NO puede configurar permisos de documentos
   - ✅ NO puede eliminar documentos

**Como Editor:**
1. Cambia el rol a "Editor"
2. Verifica que:
   - ✅ Puede crear leads
   - ✅ Puede editar leads
   - ✅ Puede subir documentos
   - ✅ Puede configurar permisos de documentos
   - ✅ NO puede eliminar leads/documentos
   - ✅ NO puede gestionar team

**Como Admin:**
1. Cambia el rol a "Admin"
2. Verifica que:
   - ✅ Puede hacer todo lo que Editor puede
   - ✅ Puede eliminar leads/documentos
   - ✅ Puede gestionar team y miembros
   - ✅ NO puede eliminar el team o cambiar owner

**Como Owner:**
1. Verifica que:
   - ✅ Puede hacer TODO
   - ✅ Puede eliminar team (si se implementa)

### 2.6 Filtrado por Team

**Cómo probar:**
1. Crea un lead como usuario A
2. Invita usuario B al mismo team
3. Inicia sesión como usuario B
4. Verifica que puede ver los leads del team
5. Crea un nuevo lead como usuario B
6. Verifica que ambos usuarios ven todos los leads del team

**Qué verificar:**
- ✅ Los leads se filtran por `teamId` cuando está disponible
- ✅ Los documentos se filtran por `teamId`
- ✅ Las reglas de automatización se filtran por `teamId`
- ✅ Los miembros del team ven los mismos datos

## Comandos Útiles

### Ver logs de Cloud Functions
```bash
firebase functions:log
```

### Ver datos en Firestore
```bash
# Abre Firebase Console en el navegador
# https://console.firebase.google.com/project/investiaflow/firestore
```

### Ejecutar migración de usuarios a teams
```bash
node scripts/migrate-users-to-teams.js
```

## Troubleshooting

### Las notificaciones no aparecen
- Verifica que las Cloud Functions están desplegadas
- Revisa los logs de Cloud Functions
- Verifica que `notifications` collection existe en Firestore

### Los permisos no funcionan
- Verifica que `TeamContext` está cargado correctamente
- Revisa la consola del navegador para errores
- Asegúrate de que el usuario tiene un team asignado

### Las invitaciones no se envían
- Verifica que `RESEND_API_KEY` está configurado en Cloud Functions
- Revisa los logs de Cloud Functions
- Verifica que la función `sendTeamInvitationEmail` está desplegada

### No puedo ver datos de otros usuarios
- Verifica que ambos usuarios están en el mismo team
- Revisa que los datos tienen `teamId` asignado
- Ejecuta el script de migración si es necesario

## Próximos Pasos

Después de probar, puedes:
1. Ejecutar el script de migración para usuarios existentes
2. Invitar miembros reales a tu team
3. Configurar roles según necesidades
4. Continuar con Fase 3 (Branding Personalizado)
