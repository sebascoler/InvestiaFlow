# InvestiaFlow

Plataforma web que automatiza la gestión de fundraising para startups, integrando un CRM visual tipo Kanban con un Data Room inteligente que comparte documentos automáticamente según el progreso de cada inversor potencial en el pipeline.

## 🚀 Stack Tecnológico

- **Frontend**: React 18 + TypeScript + Vite
- **Estilos**: Tailwind CSS
- **Drag & Drop**: @hello-pangea/dnd
- **Iconos**: lucide-react
- **Routing**: React Router v6
- **Estado**: React Context API
- **Backend**: Firebase (Firestore, Storage, Auth) - **Fase 2**
- **Emails**: Resend API (Fase 3) - Preparado

## 📦 Instalación

```bash
# Instalar dependencias
npm install

# Configurar Firebase (opcional para Fase 2)
# Copia .env.example a .env.local y configura tus credenciales
cp .env.example .env.local

# Iniciar servidor de desarrollo
npm run dev

# Build para producción
npm run build

# Preview de producción
npm run preview
```

## 🔥 Configuración de Firebase (Fase 2)

Para usar Firebase en lugar de mock data:

1. Crea un proyecto en [Firebase Console](https://console.firebase.google.com/)
2. Configura Authentication (Email/Password y Google)
3. Crea Firestore Database
4. Configura Storage
5. Copia las credenciales a `.env.local`
6. Sigue la guía completa en [FIREBASE_SETUP.md](./FIREBASE_SETUP.md)

**Nota**: Si no configuras Firebase, la app funciona con mock data en memoria (modo desarrollo).

## 🏗️ Estructura del Proyecto

```
src/
├── types/           # Interfaces TypeScript
├── services/        # Servicios (mock + Firebase ready)
│   ├── *.ts         # Implementación mock
│   └── *.firebase.ts # Implementación Firebase (opcional)
├── firebase/        # Configuración Firebase
│   ├── config.ts    # Inicialización Firebase
│   ├── firestore.ts # Helpers Firestore
│   └── storage.ts   # Helpers Storage
├── contexts/        # Context API para estado global
├── components/      # Componentes React
│   ├── crm/        # Componentes del CRM Kanban
│   ├── dataroom/   # Componentes del Data Room
│   ├── automation/ # Componentes de automatización
│   ├── shared/     # Componentes compartidos
│   └── layout/     # Layout y navegación
├── pages/          # Páginas principales
├── hooks/          # Custom hooks
└── utils/          # Utilidades y helpers
```

## 🎯 Funcionalidades Implementadas

### ✅ Fase 1 - Mock (Completado)
- CRM Kanban con drag & drop
- Crear/editar/eliminar leads
- Mover leads entre stages con tracking de fechas
- Panel de detalles de lead con documentos compartidos
- Data Room con upload (mock) y gestión de documentos
- Configuración de permisos por documento
- Sistema de automatización con reglas
- Tracking de documentos (quién abrió/descargó)
- Validaciones de formularios
- UI responsive y pulida
- Página de ayuda completa

### ✅ Fase 2 - Firebase Integration (Completado)
- ✅ Firebase SDK instalado y configurado
- ✅ Firebase Auth implementado (Email/Password + Google)
- ✅ Login/Signup con Firebase funcionando
- ✅ Migración completa de services a Firestore:
  - ✅ leadService → Firestore
  - ✅ documentService → Firestore + Storage
  - ✅ automationService → Firestore
- ✅ Firebase Storage para documentos funcionando
- ✅ Reglas de seguridad configuradas (firestore.rules, storage.rules)
- ✅ Sistema híbrido: funciona con Firebase o mock data según configuración

### 📋 Próximas Fases

### ✅ Fase 3 - Emails + Automatización Real (Completado)
- ✅ Integración Resend API implementada
- ✅ Templates HTML profesionales con variables
- ✅ Sistema de scheduled tasks para delays
- ✅ Retry logic y manejo de errores
- ✅ Hook automático para verificar tareas pendientes
- ✅ Cloud Functions implementadas para envío de emails reales
- 📝 Ver `CLOUD_FUNCTIONS_SETUP.md` para deploy

**Fase 4: Analytics & Polish**
- Dashboard con métricas
- Tracking avanzado de visualizaciones y descargas
- Notificaciones in-app
- Export a CSV

## 🛠️ Desarrollo

### Modo Mock (Sin Firebase)
La aplicación funciona completamente con datos en memoria. Perfecto para desarrollo y testing.

### Modo Firebase
1. Configura las variables de entorno en `.env.local`
2. La app detecta automáticamente Firebase y lo usa
3. Los servicios se migran automáticamente a Firestore

### Arquitectura
- **Preparada para Firebase**: Los servicios pueden cambiar de mock a Firebase sin refactorizar componentes
- **TypeScript estricto**: Type safety completo
- **Separation of Concerns**: Lógica de negocio separada de UI

## 📝 Notas

- Los datos mock están en memoria (se pierden al recargar)
- Preparado para migración a Firebase sin cambios en componentes
- Usuario mock: cualquier email/password funciona en login (solo si Firebase no está configurado)

## 📄 Licencia

Privado - InvestiaFlow

## 🔗 Documentación Adicional

- [Guía de Setup de Firebase](./FIREBASE_SETUP.md)
- [Master Prompt](./investiaflow-master-prompt.md)
