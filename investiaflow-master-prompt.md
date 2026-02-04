# InvestiaFlow - Master Prompt para Cursor IDE

## 🎯 Visión del Producto

InvestiaFlow es una plataforma web que automatiza la gestión de fundraising para startups, integrando un CRM visual tipo Kanban con un Data Room inteligente que comparte documentos automáticamente según el progreso de cada inversor potencial en el pipeline.

---

## 📋 Requisitos del Proyecto

### Stack Tecnológico
- **Frontend**: React 18 + TypeScript + Vite
- **Estilos**: Tailwind CSS
- **Drag & Drop**: @hello-pangea/dnd (fork mantenido de react-beautiful-dnd)
- **Iconos**: lucide-react
- **Routing**: React Router v6
- **Estado**: React Context API (para MVP mock, preparado para Firebase)
- **Backend (Fase 2)**: Firebase (Firestore, Storage, Auth, Cloud Functions)
- **Emails (Fase 3)**: Resend API (dominio: investia.capital)

### Principios de Arquitectura
1. **Preparado para Firebase**: Usa interfaces y servicios abstractos que puedan cambiar de mock a Firebase sin refactorizar componentes
2. **Separation of Concerns**: Lógica de negocio separada de UI
3. **Type Safety**: TypeScript estricto, interfaces bien definidas
4. **Responsive First**: Mobile-friendly desde el inicio
5. **Performance**: Lazy loading, optimización de renders

---

## 🗂️ Estructura de Archivos

```
investiaflow/
├── src/
│   ├── types/
│   │   ├── lead.ts           # Interfaces de Lead
│   │   ├── document.ts       # Interfaces de Document
│   │   ├── stage.ts          # Definición de Stages
│   │   └── automation.ts     # Reglas de automatización
│   │
│   ├── services/
│   │   ├── leadService.ts    # CRUD de leads (mock → Firebase)
│   │   ├── documentService.ts # Gestión de documentos
│   │   ├── automationService.ts # Lógica de automatización
│   │   └── emailService.ts   # Envío de emails (preparado para Resend)
│   │
│   ├── contexts/
│   │   ├── LeadsContext.tsx  # Estado global de leads
│   │   ├── DocumentsContext.tsx # Estado global de documentos
│   │   └── AuthContext.tsx   # Autenticación (preparado para Firebase)
│   │
│   ├── components/
│   │   ├── crm/
│   │   │   ├── KanbanBoard.tsx      # Tablero principal
│   │   │   ├── StageColumn.tsx      # Columna de stage
│   │   │   ├── LeadCard.tsx         # Tarjeta de lead
│   │   │   ├── LeadModal.tsx        # Modal crear/editar lead
│   │   │   └── LeadDetailPanel.tsx  # Panel lateral con detalles
│   │   │
│   │   ├── dataroom/
│   │   │   ├── DocumentList.tsx     # Lista de documentos
│   │   │   ├── DocumentCard.tsx     # Tarjeta de documento
│   │   │   ├── UploadModal.tsx      # Modal para subir docs
│   │   │   ├── PermissionsConfig.tsx # Configurar permisos por stage
│   │   │   └── DocumentPreview.tsx  # Vista previa (nice to have)
│   │   │
│   │   ├── automation/
│   │   │   ├── RulesManager.tsx     # Gestionar reglas
│   │   │   ├── RuleCard.tsx         # Tarjeta de regla
│   │   │   └── RuleModal.tsx        # Crear/editar regla
│   │   │
│   │   ├── shared/
│   │   │   ├── Button.tsx           # Botones reutilizables
│   │   │   ├── Input.tsx            # Inputs
│   │   │   ├── Select.tsx           # Selects
│   │   │   ├── Modal.tsx            # Modal base
│   │   │   ├── Toast.tsx            # Notificaciones
│   │   │   └── Loader.tsx           # Loading states
│   │   │
│   │   └── layout/
│   │       ├── Sidebar.tsx          # Navegación lateral
│   │       ├── Header.tsx           # Header con usuario
│   │       └── Layout.tsx           # Layout principal
│   │
│   ├── pages/
│   │   ├── CRMPage.tsx              # Página principal del CRM
│   │   ├── DataRoomPage.tsx         # Página del Data Room
│   │   ├── AutomationPage.tsx       # Página de automatizaciones
│   │   ├── SettingsPage.tsx         # Configuración
│   │   └── LoginPage.tsx            # Login (para Fase 2)
│   │
│   ├── hooks/
│   │   ├── useLeads.ts              # Hook para leads
│   │   ├── useDocuments.ts          # Hook para documentos
│   │   ├── useAutomation.ts         # Hook para automatizaciones
│   │   └── useAuth.ts               # Hook para autenticación
│   │
│   ├── utils/
│   │   ├── constants.ts             # Constantes (stages, colores)
│   │   ├── formatters.ts            # Formateadores de fecha, etc.
│   │   └── validators.ts            # Validaciones
│   │
│   ├── App.tsx
│   ├── main.tsx
│   └── index.css
│
├── public/
├── .env.example
├── .env.local
├── tsconfig.json
├── vite.config.ts
├── tailwind.config.js
└── package.json
```

---

## 📊 Modelos de Datos (TypeScript Interfaces)

### src/types/stage.ts
```typescript
export type StageId = 
  | 'target'
  | 'first_contact'
  | 'in_conversation'
  | 'pitch_shared'
  | 'due_diligence'
  | 'term_sheet'
  | 'committed'
  | 'passed';

export interface Stage {
  id: StageId;
  name: string;
  emoji: string;
  color: string; // Tailwind color class
  order: number;
}

export const STAGES: Stage[] = [
  { id: 'target', name: 'Target', emoji: '🎯', color: 'slate', order: 0 },
  { id: 'first_contact', name: 'First Contact', emoji: '📧', color: 'blue', order: 1 },
  { id: 'in_conversation', name: 'In Conversation', emoji: '💬', color: 'cyan', order: 2 },
  { id: 'pitch_shared', name: 'Pitch Shared', emoji: '📊', color: 'purple', order: 3 },
  { id: 'due_diligence', name: 'Due Diligence', emoji: '🔍', color: 'amber', order: 4 },
  { id: 'term_sheet', name: 'Term Sheet', emoji: '📝', color: 'orange', order: 5 },
  { id: 'committed', name: 'Committed', emoji: '✅', color: 'green', order: 6 },
  { id: 'passed', name: 'Passed', emoji: '❌', color: 'red', order: 7 },
];
```

### src/types/lead.ts
```typescript
import { StageId } from './stage';

export interface Lead {
  id: string;
  userId: string; // Owner (founder)
  name: string;
  email: string;
  firm: string;
  stage: StageId;
  createdAt: Date;
  updatedAt: Date;
  lastContactDate: Date | null;
  notes: string;
  linkedinUrl?: string;
  phoneNumber?: string;
  customFields?: Record<string, any>;
}

export interface LeadFormData {
  name: string;
  email: string;
  firm: string;
  notes?: string;
  linkedinUrl?: string;
  phoneNumber?: string;
}
```

### src/types/document.ts
```typescript
import { StageId } from './stage';

export type DocumentCategory = 'pitch' | 'financials' | 'legal' | 'metrics' | 'other';

export interface Document {
  id: string;
  userId: string;
  name: string;
  category: DocumentCategory;
  storagePath: string; // Para Firebase Storage
  uploadedAt: Date;
  fileSize: number;
  fileType: string;
  description?: string;
}

export interface DocumentPermission {
  id: string;
  documentId: string;
  requiredStage: StageId;
  delayDays: number; // 0 = inmediato
  emailTemplate?: string;
}

export interface SharedDocument {
  id: string;
  leadId: string;
  documentId: string;
  sharedAt: Date;
  viewedAt: Date | null;
  downloadedAt: Date | null;
}
```

### src/types/automation.ts
```typescript
import { StageId } from './stage';

export interface AutomationRule {
  id: string;
  userId: string;
  name: string;
  triggerStage: StageId;
  documentIds: string[];
  delayDays: number;
  emailSubject: string;
  emailBody: string; // Soporta variables: {{name}}, {{firm}}, etc.
  isActive: boolean;
  createdAt: Date;
}
```

---

## 🎨 Configuración de Tailwind

### tailwind.config.js
```javascript
/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        primary: {
          50: '#f0f9ff',
          100: '#e0f2fe',
          500: '#0ea5e9',
          600: '#0284c7',
          700: '#0369a1',
        },
      },
    },
  },
  plugins: [],
}
```

---

## 🔧 Servicios Mock (Fase 1)

### src/services/leadService.ts
```typescript
import { Lead, LeadFormData } from '../types/lead';
import { StageId } from '../types/stage';

// Mock data storage (en memoria para Fase 1)
let leadsDB: Lead[] = [
  {
    id: 'lead-1',
    userId: 'user-1',
    name: 'María González',
    email: 'maria@vc-fund.com',
    firm: 'Venture Capital Fund',
    stage: 'in_conversation',
    createdAt: new Date('2025-01-15'),
    updatedAt: new Date('2025-02-01'),
    lastContactDate: new Date('2025-02-01'),
    notes: 'Muy interesada en métricas de retención',
  },
  // Agregar 4-5 leads más de ejemplo en diferentes stages
];

export const leadService = {
  // Obtener todos los leads del usuario
  async getLeads(userId: string): Promise<Lead[]> {
    return leadsDB.filter(lead => lead.userId === userId);
  },

  // Obtener lead por ID
  async getLead(id: string): Promise<Lead | null> {
    return leadsDB.find(lead => lead.id === id) || null;
  },

  // Crear nuevo lead
  async createLead(userId: string, data: LeadFormData): Promise<Lead> {
    const newLead: Lead = {
      id: `lead-${Date.now()}`,
      userId,
      ...data,
      stage: 'target',
      createdAt: new Date(),
      updatedAt: new Date(),
      lastContactDate: null,
      notes: data.notes || '',
    };
    leadsDB.push(newLead);
    return newLead;
  },

  // Actualizar lead
  async updateLead(id: string, updates: Partial<Lead>): Promise<Lead> {
    const index = leadsDB.findIndex(lead => lead.id === id);
    if (index === -1) throw new Error('Lead not found');
    
    leadsDB[index] = {
      ...leadsDB[index],
      ...updates,
      updatedAt: new Date(),
    };
    return leadsDB[index];
  },

  // Cambiar stage de lead (trigger de automatización)
  async changeStage(id: string, newStage: StageId): Promise<Lead> {
    const lead = await this.getLead(id);
    if (!lead) throw new Error('Lead not found');

    const oldStage = lead.stage;
    const updatedLead = await this.updateLead(id, { stage: newStage });

    // TODO: Trigger automation service
    // automationService.onStageChange(updatedLead, oldStage, newStage);

    return updatedLead;
  },

  // Eliminar lead
  async deleteLead(id: string): Promise<void> {
    leadsDB = leadsDB.filter(lead => lead.id !== id);
  },
};
```

### src/services/documentService.ts
```typescript
import { Document, DocumentPermission, SharedDocument, DocumentCategory } from '../types/document';

// Mock data
let documentsDB: Document[] = [
  {
    id: 'doc-1',
    userId: 'user-1',
    name: 'Pitch Deck Q1 2025.pdf',
    category: 'pitch',
    storagePath: '/mock/pitch-deck.pdf',
    uploadedAt: new Date('2025-01-10'),
    fileSize: 2458392,
    fileType: 'application/pdf',
    description: 'Pitch deck actualizado con métricas Q4 2024',
  },
  // Agregar más documentos de ejemplo
];

let permissionsDB: DocumentPermission[] = [
  {
    id: 'perm-1',
    documentId: 'doc-1',
    requiredStage: 'pitch_shared',
    delayDays: 0,
  },
  // Más permisos de ejemplo
];

let sharedDB: SharedDocument[] = [];

export const documentService = {
  async getDocuments(userId: string): Promise<Document[]> {
    return documentsDB.filter(doc => doc.userId === userId);
  },

  async uploadDocument(userId: string, file: File, category: DocumentCategory, description?: string): Promise<Document> {
    // Mock upload (en Firebase será Storage)
    const newDoc: Document = {
      id: `doc-${Date.now()}`,
      userId,
      name: file.name,
      category,
      storagePath: `/mock/${file.name}`,
      uploadedAt: new Date(),
      fileSize: file.size,
      fileType: file.type,
      description,
    };
    documentsDB.push(newDoc);
    return newDoc;
  },

  async deleteDocument(id: string): Promise<void> {
    documentsDB = documentsDB.filter(doc => doc.id !== id);
    permissionsDB = permissionsDB.filter(perm => perm.documentId !== id);
  },

  // Permissions
  async getPermissions(documentId: string): Promise<DocumentPermission[]> {
    return permissionsDB.filter(perm => perm.documentId === documentId);
  },

  async setPermissions(documentId: string, permissions: Omit<DocumentPermission, 'id'>[]): Promise<void> {
    // Eliminar permisos anteriores
    permissionsDB = permissionsDB.filter(perm => perm.documentId !== documentId);
    
    // Agregar nuevos
    permissions.forEach(perm => {
      permissionsDB.push({
        ...perm,
        id: `perm-${Date.now()}-${Math.random()}`,
      });
    });
  },

  // Shared documents (para analytics)
  async getSharedDocuments(leadId: string): Promise<SharedDocument[]> {
    return sharedDB.filter(shared => shared.leadId === leadId);
  },
};
```

---

## 🎨 Componentes UI Principales

### src/components/crm/KanbanBoard.tsx

**Requisitos**:
- Usar @hello-pangea/dnd para drag & drop
- Mostrar columnas por stage
- Permitir mover leads entre stages
- Responsive: horizontal scroll en mobile, columnas visibles en desktop
- Mostrar contador de leads por columna
- Botón "+ Add Lead" en cada columna

**Funcionalidad**:
- Al soltar lead en nuevo stage → llamar `leadService.changeStage()`
- Click en lead → abrir `LeadDetailPanel` lateral
- Click en "+ Add Lead" → abrir `LeadModal` con stage pre-seleccionado

### src/components/crm/LeadCard.tsx

**Diseño visual**:
```
┌─────────────────────────┐
│ 👤 María González      │
│ Venture Capital Fund    │
│ ─────────────────────── │
│ 📧 maria@vc-fund.com    │
│ 📅 Last: 1 Feb 2025     │
│ ─────────────────────── │
│ 📝 Muy interesada en... │
└─────────────────────────┘
```

**Props**: `lead: Lead`, `onClick: () => void`

**Estados visuales**:
- Hover: elevación shadow
- Drag: opacidad 0.5
- Sin contacto >14 días: borde naranja + badge "⚠️ Follow up needed"

### src/components/crm/LeadModal.tsx

**Form fields**:
- Name (required)
- Email (required, validar formato)
- Firm (required)
- LinkedIn URL (optional)
- Phone (optional)
- Notes (textarea)

**Modos**: Create / Edit
- Create: stage default = 'target'
- Edit: mostrar todos los campos + selector de stage

### src/components/dataroom/DocumentList.tsx

**Vista**:
- Grid de tarjetas de documentos
- Filtros: por categoría, búsqueda por nombre
- Botón "Upload Document"
- Cada documento muestra:
  - Icon según tipo (PDF, Excel, etc.)
  - Nombre
  - Categoría badge
  - Tamaño
  - Fecha de subida
  - Botón "⚙️ Configure Permissions"

### src/components/dataroom/PermissionsConfig.tsx

**UI**:
```
Document: Pitch Deck Q1 2025.pdf

Share automatically when lead reaches:
┌─────────────────────────────────┐
│ ☑ Pitch Shared                  │
│   Delay: [0] days after stage   │
│   Email: [Send notification] ☑  │
├─────────────────────────────────┤
│ ☐ Due Diligence                 │
│   Delay: [0] days               │
└─────────────────────────────────┘

[Save] [Cancel]
```

**Funcionalidad**:
- Checkboxes para cada stage
- Input para delay days
- Toggle para enviar email
- Guardar en `documentService.setPermissions()`

---

## 🚀 Context API para Estado Global

### src/contexts/LeadsContext.tsx

```typescript
interface LeadsContextType {
  leads: Lead[];
  loading: boolean;
  error: string | null;
  refreshLeads: () => Promise<void>;
  createLead: (data: LeadFormData) => Promise<Lead>;
  updateLead: (id: string, updates: Partial<Lead>) => Promise<Lead>;
  changeStage: (id: string, newStage: StageId) => Promise<Lead>;
  deleteLead: (id: string) => Promise<void>;
}
```

**Uso**: Envolver App en `<LeadsProvider>`

### src/contexts/DocumentsContext.tsx

Similar estructura, gestiona documentos y permisos

---

## 📱 Páginas Principales

### src/pages/CRMPage.tsx
- Header con título "Pipeline" + botón "Add Lead"
- `<KanbanBoard />` ocupando todo el espacio
- Panel lateral deslizable con `<LeadDetailPanel />` (solo visible al seleccionar lead)

### src/pages/DataRoomPage.tsx
- Header con título "Data Room" + botón "Upload Document"
- Tabs: "All Documents" | "By Category" | "Permissions"
- `<DocumentList />` con grid responsive

### src/pages/AutomationPage.tsx
- Lista de reglas de automatización
- Botón "Create Rule"
- Cada regla muestra: nombre, trigger stage, documentos asociados, delay, estado (activa/inactiva)
- Toggle para activar/desactivar reglas

---

## 🎯 Tareas de Implementación (Fase 1 - Mock)

### Sprint 1: Setup + CRM Básico (Día 1-2)

1. **Setup inicial**
   ```bash
   npm create vite@latest investiaflow -- --template react-ts
   cd investiaflow
   npm install
   npm install -D tailwindcss postcss autoprefixer
   npm install @hello-pangea/dnd lucide-react react-router-dom
   npx tailwindcss init -p
   ```

2. **Configurar Tailwind** (usar config de arriba)

3. **Crear estructura de carpetas** (seguir árbol exacto)

4. **Implementar types/** (stage.ts, lead.ts, document.ts)

5. **Implementar services/** (leadService.ts con mock data)

6. **Crear LeadsContext** con mock service

7. **Componentes básicos**:
   - Layout completo (Sidebar + Header)
   - Button, Input, Modal compartidos
   - KanbanBoard con @hello-pangea/dnd
   - StageColumn
   - LeadCard

8. **CRMPage funcional**: Drag & drop funcionando, crear/editar leads

### Sprint 2: Data Room + Permisos (Día 3-4)

1. **Implementar documentService** con mock

2. **Crear DocumentsContext**

3. **Componentes Data Room**:
   - DocumentList
   - DocumentCard
   - UploadModal (mock upload, guardar File en memoria)
   - PermissionsConfig

4. **DataRoomPage completa**: Upload, configurar permisos, visualizar docs

### Sprint 3: Automatización + Polish (Día 5)

1. **Implementar automationService**:
   - Lógica para detectar cambio de stage
   - Verificar permisos de documentos
   - Mock "envío de email" (console.log por ahora)

2. **Componentes Automation**:
   - RulesManager
   - RuleModal

3. **AutomationPage completa**

4. **Testing manual**: Mover lead entre stages, verificar que "se compartan" docs

5. **Polish UI**:
   - Loading states
   - Error messages
   - Empty states bonitos
   - Toast notifications

---

## 🔄 Preparación para Firebase (Fase 2)

### Patrón de Servicios

Cada service debe tener esta estructura:

```typescript
// leadService.ts (mock)
class LeadService {
  async getLeads(userId: string): Promise<Lead[]> {
    // Mock implementation
  }
}

export const leadService = new LeadService();
```

Para migrar a Firebase:

```typescript
// leadService.ts (Firebase)
import { collection, getDocs, query, where } from 'firebase/firestore';
import { db } from '../firebase/config';

class LeadService {
  async getLeads(userId: string): Promise<Lead[]> {
    const q = query(
      collection(db, 'leads'),
      where('userId', '==', userId)
    );
    const snapshot = await getDocs(q);
    return snapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data()
    } as Lead));
  }
}

export const leadService = new LeadService();
```

**Los componentes NO CAMBIAN**, solo cambia la implementación del service.

### Variables de Entorno (.env.local)

```env
# Firebase (Fase 2)
VITE_FIREBASE_API_KEY=
VITE_FIREBASE_AUTH_DOMAIN=
VITE_FIREBASE_PROJECT_ID=
VITE_FIREBASE_STORAGE_BUCKET=
VITE_FIREBASE_MESSAGING_SENDER_ID=
VITE_FIREBASE_APP_ID=

# Resend (Fase 3)
VITE_RESEND_API_KEY=
VITE_RESEND_FROM_EMAIL=sebas@investia.capital
```

---

## 📧 Integración Resend (Fase 3)

### Cloud Function Example (Firebase)

```typescript
// functions/src/sendDocumentEmail.ts
import * as functions from 'firebase-functions';
import { Resend } from 'resend';

const resend = new Resend(functions.config().resend.api_key);

export const sendDocumentEmail = functions.firestore
  .document('sharedDocuments/{docId}')
  .onCreate(async (snap, context) => {
    const shared = snap.data();
    const lead = await getLeadById(shared.leadId);
    const documents = await getDocumentsByIds(shared.documentIds);

    await resend.emails.send({
      from: 'Sebas @ Investia <sebas@investia.capital>',
      to: lead.email,
      subject: '📊 New documents available - Investia',
      html: `
        <h2>Hi ${lead.name},</h2>
        <p>We've shared new documents with you:</p>
        <ul>
          ${documents.map(doc => `<li>${doc.name}</li>`).join('')}
        </ul>
        <p><a href="https://investiaflow.com/investor/${lead.id}">View Data Room</a></p>
        <br>
        <p>Best regards,<br>Sebas</p>
      `,
    });
  });
```

---

## 🎨 Detalles de UX/UI

### Paleta de Colores por Stage
- Target: `bg-slate-100 border-slate-300`
- First Contact: `bg-blue-100 border-blue-300`
- In Conversation: `bg-cyan-100 border-cyan-300`
- Pitch Shared: `bg-purple-100 border-purple-300`
- Due Diligence: `bg-amber-100 border-amber-300`
- Term Sheet: `bg-orange-100 border-orange-300`
- Committed: `bg-green-100 border-green-300`
- Passed: `bg-red-100 border-red-300`

### Animaciones
- Drag: `transition-all duration-200`
- Hover en cards: `hover:shadow-lg hover:scale-105`
- Modals: fade in con `opacity-0 → opacity-100`

### Loading States
- Skeleton loaders para tarjetas
- Spinner en botones durante acciones

### Empty States
- CRM sin leads: Ilustración + "Add your first investor"
- Data Room sin docs: "Upload your first document"

---

## 🐛 Testing Manual (Checklist Fase 1)

### CRM
- [ ] Crear nuevo lead con todos los campos
- [ ] Editar lead existente
- [ ] Mover lead entre stages con drag & drop
- [ ] Eliminar lead
- [ ] Validaciones de form (email, campos requeridos)
- [ ] Responsive: funciona en mobile y desktop
- [ ] Badge "Follow up needed" aparece después de 14 días sin contacto

### Data Room
- [ ] Upload documento (guardar en memoria)
- [ ] Filtrar por categoría
- [ ] Búsqueda por nombre
- [ ] Configurar permisos (stage + delay)
- [ ] Ver permisos existentes
- [ ] Eliminar documento

### Automatización
- [ ] Al mover lead a nuevo stage, "compartir" docs según permisos
- [ ] Logs en console mostrando "Email sent to [lead] with docs [X, Y]"
- [ ] Reglas con delay no se ejecutan inmediatamente

---

## 📦 Dependencias (package.json)

```json
{
  "name": "investiaflow",
  "private": true,
  "version": "0.1.0",
  "type": "module",
  "scripts": {
    "dev": "vite",
    "build": "tsc && vite build",
    "preview": "vite preview"
  },
  "dependencies": {
    "@hello-pangea/dnd": "^16.5.0",
    "lucide-react": "^0.309.0",
    "react": "^18.2.0",
    "react-dom": "^18.2.0",
    "react-router-dom": "^6.21.0"
  },
  "devDependencies": {
    "@types/react": "^18.2.48",
    "@types/react-dom": "^18.2.18",
    "@vitejs/plugin-react": "^4.2.1",
    "autoprefixer": "^10.4.16",
    "postcss": "^8.4.33",
    "tailwindcss": "^3.4.1",
    "typescript": "^5.3.3",
    "vite": "^5.0.11"
  }
}
```

---

## 🚀 Comandos para Iniciar

```bash
# Clonar/Crear proyecto
npm create vite@latest investiaflow -- --template react-ts
cd investiaflow

# Instalar dependencias
npm install
npm install @hello-pangea/dnd lucide-react react-router-dom
npm install -D tailwindcss postcss autoprefixer
npx tailwindcss init -p

# Desarrollo
npm run dev

# Build producción
npm run build
npm run preview
```

---

## 💡 Notas Importantes para Cursor

1. **Mock Data Realista**: Incluir 5-6 leads de ejemplo en diferentes stages, 8-10 documentos de ejemplo con categorías variadas

2. **TypeScript Estricto**: Activar `"strict": true` en tsconfig.json

3. **Comentarios**: Agregar comentarios `// TODO: Migrate to Firebase` donde sea relevante

4. **Error Handling**: Usar try-catch en todos los services, mostrar mensajes user-friendly

5. **Accesibilidad**: Labels en inputs, aria-labels en botones icon-only, keyboard navigation en modals

6. **Performance**: React.memo en LeadCard, useMemo para filtros en DocumentList

7. **Mobile First**: Breakpoints: sm:640px, md:768px, lg:1024px, xl:1280px

---

## 🎯 Resultado Esperado Fase 1

Al completar la Fase 1 (mock), deberías tener:

✅ App corriendo en `localhost:5173`
✅ CRM Kanban visual con drag & drop fluido
✅ Crear/editar/eliminar leads
✅ Data Room con upload (mock) y gestión de documentos
✅ Configuración de permisos por documento
✅ Automatización básica (logs en console cuando cambia stage)
✅ UI responsive y pulida
✅ Código TypeScript limpio, tipado, listo para migrar a Firebase

**Tiempo estimado: 5 días de desarrollo**

---

## 📞 Próximos Pasos (Post-MVP Mock)

### Fase 2: Firebase Integration (3-4 días)
- Setup Firebase project
- Implementar Auth (Google + Email)
- Migrar services a Firestore
- Implementar Firebase Storage para documentos reales
- Deploy a Vercel/Netlify

### Fase 3: Emails + Automatización Real (2-3 días)
- Integrar Resend API
- Cloud Functions para envío de emails
- Scheduled tasks para delays
- Email templates con variables

### Fase 4: Analytics & Polish (2 días)
- Dashboard con métricas (conversión por stage, tiempo en pipeline)
- Tracking de "viewed" y "downloaded" en Data Room
- Notificaciones in-app
- Export a CSV

---

## 🎉 ¡Listo para Empezar!

Este prompt contiene todo lo necesario para que Cursor/Claude construya InvestiaFlow desde cero. 

**Workflow sugerido**:
1. Copia este prompt completo en Cursor
2. Pide: "Crea la estructura inicial del proyecto con setup de Vite + React + TypeScript + Tailwind"
3. Luego: "Implementa los types y services con mock data"
4. Después: "Crea el Layout, Sidebar y estructura de páginas"
5. Continúa iterando por componentes (CRM → Data Room → Automation)

**Tips para trabajar con Cursor**:
- Genera componentes de uno en uno, testeando cada uno
- Usa "Apply" para aceptar cambios y ver errores de TypeScript
- Si algo no funciona, pide: "Debug este error: [copiar error]"
- Pide previews frecuentes: "Muéstrame cómo se ve el CRM hasta ahora"

---

**Creado para**: InvestiaFlow MVP Mock (Fase 1)
**Stack**: React 18 + TypeScript + Vite + Tailwind + @hello-pangea/dnd
**Arquitectura**: Preparada para migración a Firebase sin romper componentes
**Autor**: Claude + Sebastián (sebas@investia.capital)
**Fecha**: Febrero 2025

¡A construir! 🚀
