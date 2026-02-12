# InvestiaFlow — Handover completo al equipo

**Versión:** Febrero 2026  
**Propósito:** Documento único de traspaso: producto, landing, marketing, tecnología, decisiones pendientes y rationale. Para que cualquier miembro del equipo pueda entender el proyecto de punta a punta y continuar el trabajo.

---

## Índice

1. [Resumen ejecutivo](#1-resumen-ejecutivo)
2. [El producto](#2-el-producto)
3. [La landing](#3-la-landing)
4. [Enfoque de marketing](#4-enfoque-de-marketing)
5. [Tecnología](#5-tecnología)
6. [Decisiones tomadas y rationale](#6-decisiones-tomadas-y-rationale)
7. [Pendientes y decisiones por cerrar](#7-pendientes-y-decisiones-por-cerrar)
8. [Operativa: build, deploy y mantenimiento](#8-operativa-build-deploy-y-mantenimiento)
9. [Referencias y documentación existente](#9-referencias-y-documentación-existente)

---

## 1. Resumen ejecutivo

**InvestiaFlow** es una plataforma web que **automatiza y organiza el proceso de fundraising** para startups. Combina:

- Un **CRM visual (Kanban)** para seguir a cada inversor potencial por fases.
- Un **Data Room inteligente** que comparte documentos con cada inversor **solo cuando corresponde**, según la fase del pipeline.
- **Automatizaciones** (reglas por fase: compartir documentos, enviar emails, con delays opcionales).
- **Portal para inversores** (acceso por email + código de 6 dígitos, sin contraseña; registro de vistas y descargas).

**En una frase:**  
*“El CRM de fundraising que comparte los documentos correctos con el inversor correcto, en el momento correcto — sin que tengas que acordarte tú.”*

**Estado actual:**  
- **Producto (app):** Completo y operativo. CRM, Data Room, automatizaciones, portal inversor, equipos con roles, dashboard, notificaciones, ayuda y onboarding. Stack: React + Vite + Firebase (Auth, Firestore, Storage) + Cloud Functions + Resend.
- **Landing:** Next.js estático, EN/ES, con secciones Hero, Problem, How it works, Features, Product Tour, Trust, Pricing, FAQ, CTA y Footer. Placeholders en imágenes y algunos textos; precios y CTAs son orientativos.
- **Deploy:** App en Vercel (según `vercel.json`); landing exportable a estático (`out/`) para Hostinger u otro hosting.

Este documento explica todo lo anterior en detalle, el rationale de las decisiones y qué queda por definir o hacer.

---

## 2. El producto

### 2.1 A quién va dirigido

- **Fundadores y CEOs** de startups en ronda seed o Serie A que llevan ellos mismos el fundraising.
- **Equipos de crecimiento o negocio** que gestionan la captación de inversión.
- **Asesores y consultores** que acompañan a varias startups en sus rondas.
- **Inversores ángel o fondos** que quieren un Data Room ordenado para sus portfolio companies.

**Perfil ideal:** Startup con varias conversaciones con inversores y dolor por desorden en seguimiento, envío de documentos y control de quién ha visto qué.

### 2.2 Problema que resuelve

- Seguimiento caótico (Excel, notas sueltas, “¿a quién le mandé el pitch?”).
- Documentos mal controlados (mismo deck a todos, datos sensibles compartidos demasiado pronto).
- Trabajo manual repetitivo (enviar el mismo pack una y otra vez).
- Falta de visibilidad (no saber quién ha abierto o descargado qué).
- Experiencia poco profesional frente al inversor.

### 2.3 Módulos del producto (estado: implementados)

| Módulo | Descripción breve |
|--------|-------------------|
| **CRM Pipeline (Kanban)** | Tablero por fases (Target → First Contact → … → Committed/Passed), drag & drop, tarjetas por inversor, tags, historial y comentarios, aviso “follow up needed” tras 14 días sin contacto. |
| **Data Room** | Subida de documentos por categorías, permisos por documento según fase del pipeline, delays opcionales, vista previa. Un Data Room por equipo. |
| **Automatizaciones** | Reglas tipo “cuando lead entra en [fase X], compartir [documentos Y] y/o enviar email”. Múltiples reglas por fase, delays en días, plantillas de email. Resend (dominio investia.capital) vía Cloud Functions. |
| **Portal inversores** | URL dedicada, login por email + código 6 dígitos (sin contraseña). Cada inversor ve solo los documentos compartidos según su fase. Registro de vista y descarga; notificaciones in-app al equipo. |
| **Equipos y colaboración** | Equipos con nombre, invitación por email o link, roles (Owner, Admin, Editor, Viewer), branding (logo, colores, nombre, tema claro/oscuro/auto). |
| **Dashboard y métricas** | Métricas de pipeline y documentos, gráficos, exportación CSV. |
| **Notificaciones** | In-app cuando un inversor ve o descarga un documento; panel de notificaciones y historial por lead. |
| **Configuración y perfil** | Perfil de usuario, preferencias de notificaciones, tema. |
| **Onboarding y ayuda** | Tour guiado, modal de bienvenida, página de Ayuda con FAQs y consejos. |
| **Autenticación** | Equipo: email/contraseña y Google (Firebase Auth). Inversores: solo email + código. |

No hay integraciones públicas (Slack, HubSpot, etc.); el producto es autocontenido. CSV export existe para análisis externo.

### 2.4 Lo que no está cerrado a nivel producto/negocio

- Precios y planes públicos (Free / Starter / Pro / Advisor son orientativos).
- Límites concretos (leads, documentos, miembros, envíos de email).
- Términos de uso, política de privacidad y condiciones comerciales.
- Canal de ventas y soporte (email, chat, SLAs) documentado en producto.
- Multi-idioma completo como feature documentada.

Detalle de pendientes se recoge en la [sección 7](#7-pendientes-y-decisiones-por-cerrar).

---

## 3. La landing

### 3.1 Estructura y secciones

La landing es una **single page** con scroll. Orden de bloques:

1. **LandingNav** — Fija, con: Product, How it works, Pricing, FAQ; selector de idioma (EN/ES); “Book a demo” y “Start free”.
2. **Hero** — Headline, subheadline, CTAs (Start free, Book a demo), badge de social proof y bloque central “Product Preview” (placeholder visual).
3. **Problem** — Título + 4 bullets (seguimientos que se pierden, docs sensibles demasiado pronto, sin señales de engagement, herramientas fragmentadas).
4. **How it works** — 3 pasos: subir documentos, definir reglas por etapa, mover inversores (el acceso se actualiza solo).
5. **Features** — Listado de 8 capacidades (Kanban CRM, follow-up reminders, data room por etapas, automatizaciones, portal inversor, engagement, equipos/roles, dashboard/export).
6. **Product Tour** — 3 “pantallas” (Pipeline board, Rules & automations, Investor portal & signals). Hoy son cards con placeholder (gradiente + emoji/texto).
7. **Trust** — Seguridad y fiabilidad: acceso inversor por código, Firebase, Resend.
8. **Pricing** — 4 planes: Free (€0), Starter (€59), Pro (€149), Advisor (€399), con features por plan. Badge “Popular” en Starter (texto aún hardcoded en el componente).
9. **FAQ** — Acordeón con 8 preguntas (DocSend, control de docs, portal, delays, integraciones, equipos, views/downloads, etapas).
10. **Final CTA** — Headline + subheadline + mismos dos botones.
11. **Footer** — Enlaces Privacy, Terms, Contact, Login; texto “Launching UK/EU-first”; copyright.

Toda la copy está en **`lib/copy.ts`** en inglés y español; el idioma se elige por `?lang=es` o `?lang=en` (por defecto EN).

### 3.2 Componentes (landing)

- **Ubicación:** `components/landing/` y `components/ui/` (button, badge, card, accordion, separator).
- **Componentes de sección:** `LandingNav`, `Hero`, `Problem`, `HowItWorks`, `Features`, `ProductTour`, `Trust`, `Pricing`, `FAQ`, `FinalCTA`, `Footer`.
- **Idioma:** Cada sección recibe `lang: Lang` y usa `copy[lang]`. El `LanguageToggle` cambia la URL a `?lang=es` o `?lang=en` (manteniendo path).
- **Página principal:** `app/page.tsx` — lee `searchParams.lang`, obtiene `Lang`, renderiza todas las secciones en orden. `dynamic = 'force-static'` para export estático.

### 3.3 Diseño y marca

- **Fuentes:** Inter (texto), Sora (títulos), vía `next/font` en `app/layout.tsx`.
- **Colores (CSS variables en `app/globals.css`):** navy `#0B1220`, blue `#2F6BFF`, teal `#14B8A6`, off-white `#F6F8FC`, gray-text `#5B667A`. Tailwind para utilidades.
- **Logo:** Solo texto “InvestiaFlow” en nav y footer. No hay favicon ni OG image aún (pendiente).

### 3.4 CTAs y URLs (actuales en código)

- **Start free:** `https://app.investiaflow.com/signup`
- **Book a demo:** `https://calendly.com/investiaflow/demo`
- **Login:** En el footer se enlaza “Login” (no se especifica URL en copy; en nav no hay link Login en el snippet revisado).

Estas URLs son las que debe confirmar producto/comercial antes de dar por definitivas (ver pendientes).

---

## 4. Enfoque de marketing

### 4.1 Mensajes clave

- **Headline:** “Fundraising, organized and automated.” / “El CRM de fundraising que comparte el Data Room por ti.”
- **Subheadline:** “Move investors through stages. InvestiaFlow automatically shares the right documents at the right time—so you don't have to.”
- **Beneficios en una línea:** un solo lugar para pipeline y Data Room; documentos que se comparten solos por fase; sabes cuándo un inversor abre o descarga; emails automáticos y profesionales; equipo con roles y branding.

### 4.2 Casos de uso para contenido

- Founder solo: “20 conversaciones; antes perdía el hilo. Ahora todo en el Kanban y en due diligence les llegan solos los documentos.”
- Equipo 2–3: “CFO y CEO comparten el mismo Data Room con roles; inversores entran con código y ven solo lo liberado.”
- Imagen profesional: “Dejamos de mandar PDFs por Gmail; el inversor recibe link + código y ve todo ordenado; nosotros vemos si abrió deck o financials.”
- Automatización: “Regla: al pasar a Pitch Shared, se comparte el deck y se envía email. Ya no nos acordamos a mano.”

### 4.3 Formatos recomendados

- **One-pager comercial:** qué es, para quién, problema, solución (CRM + Data Room + automatización + portal), beneficios, estado actual, CTA.
- **Web de producto:** Hero + bloques por beneficio + “Cómo funciona” en 3–4 pasos + FAQ + CTA.
- **Redes:** Posts cortos por beneficio; testimonios o casos cuando existan.
- **Presentaciones:** Diapositivas por módulo; evitar jerga técnica; enfatizar ahorro de tiempo, control e imagen profesional.

### 4.4 Qué no prometer aún

No prometer precios/límites definitivos ni integraciones hasta que estén definidos. Sí se puede hablar de “próximamente” o “en roadmap” si el equipo lo autoriza.

---

## 5. Tecnología

### 5.1 Visión general

- **Monorepo con dos “apps”:**
  - **App de producto:** React 18 + TypeScript + **Vite** + React Router. Fuente en `src/` (páginas, componentes, contextos, servicios, tipos, utils). Deploy típico: Vercel (config en `vercel.json`: build Vite, `dist`, rewrites a `index.html`).
  - **Landing:** **Next.js 14** (App Router), mismo repo, en `app/` y `components/landing/`. Export estático (`output: 'export'`) para poder hostear en Hostinger u otro estático.

- **Build de la landing:** Next no debe compilar `src/` (es código Vite). Por eso el build se hace con `scripts/build-landing.sh`: renombra `src` a `_src_vite_app`, ejecuta `next build`, restaura `src`. El resultado está en `out/`. Comando: `npm run build:landing`.

### 5.2 App (Vite)

- **Dependencias relevantes:** react, react-dom, react-router-dom, firebase, @hello-pangea/dnd, framer-motion, lucide-react, resend (usado desde Cloud Functions, no desde el browser por CORS), react-joyride, react-pdf-viewer, etc.
- **Estructura:** `src/pages/` (CRM, DataRoom, Automation, Dashboard, Help, Investor*, InviteAccept, Login, Settings, Team), `src/components/` (crm, dataroom, automation, dashboard, investor, layout, notifications, onboarding, shared), `src/contexts/`, `src/services/` (Firebase y abstracciones), `src/types/`, `src/utils/`, `src/firebase/`, `src/hooks/`.
- **Backend:** Firebase (Auth, Firestore, Storage). Cloud Functions (Firebase) para envío de emails con Resend (dominio investia.capital).

### 5.3 Landing (Next.js)

- **next.config.js:** `output: 'export'`, `images.unoptimized: true`, `eslint.ignoreDuringBuilds: true`, `typescript.ignoreBuildErrors: true` (para no fallar por código en `src/` que Next no usa).
- **Idioma:** Cliente. La página lee `searchParams.lang` en el servidor en el momento del build; con static export solo se pre-renderiza la variante por defecto; el cambio EN/ES se hace en cliente con `?lang=es` (el contenido se vuelve a leer de `copy` según el parámetro).
- **Metadata:** En `app/page.tsx` y `app/layout.tsx`: title, description, openGraph, twitter. No hay aún `og:image` (pendiente).

### 5.4 Firebase y Cloud Functions

- **Auth:** Email/password y Google.
- **Firestore:** leads, documents, documentPermissions, sharedDocuments, automationRules, equipos, perfiles, notificaciones, etc. Reglas en `firestore.rules`.
- **Storage:** documentos por usuario/equipo. Reglas en `storage.rules`.
- **Functions:** En `functions/` (TypeScript). Función relevante para emails: `sendDocumentEmail` (o equivalente), llamada desde el cliente de forma indirecta (p. ej. vía HTTPS callable o desde backend). Resend API Key en Firebase config: `resend.api_key`.

Documentación de detalle: `FIREBASE_SETUP.md`, `RESEND_SETUP.md`, `CLOUD_FUNCTIONS_SETUP.md`, `DEPLOY_INSTRUCTIONS.md`.

### 5.5 Hosting y deploy

- **App:** Vercel (config: build `npm run build`, output `dist`, framework Vite). Dominio app: `app.investiaflow.com` (confirmar con equipo).
- **Landing:** Opción A — estático: contenido de `out/` a `public_html` en Hostinger (ver `HOSTING_HOSTINGER.md`). Opción B — VPS con Node y `next start` + Nginx + SSL (misma guía).
- **Dominio raíz:** Decidir si `investiaflow.com` es la landing o la app; actualmente no está fijado en código.

---

## 6. Decisiones tomadas y rationale

### 6.1 Dos apps en un solo repo (Vite + Next)

- **Decisión:** App de producto con Vite; landing con Next.js en el mismo repositorio.
- **Rationale:** La app necesita SPA con React Router y un build optimizado para la aplicación (Vite). La landing se beneficia de Next por SEO, metadata y pre-render; además permite export estático para hostear en cualquier estático (Hostinger) sin Node. Mantener todo en un repo simplifica el handover y la versión de dependencias compartidas (React, tipos).

### 6.2 Landing estática (output: 'export')

- **Decisión:** Next con `output: 'export'`; sin API routes ni server-side dinámico en la landing.
- **Rationale:** Permite hosting en plan shared de Hostinger sin Node; menor coste y menor superficie de mantenimiento. El idioma con `?lang=es` funciona en cliente y no requiere servidor. Si más adelante se quiere SSR o i18n con rutas, se puede cambiar a un despliegue Node (p. ej. VPS o Vercel para la landing).

### 6.3 Copy centralizada en `lib/copy.ts`

- **Decisión:** Todo el texto de la landing (nav, hero, problem, howItWorks, features, productTour, trust, pricing, faq, finalCta, footer) en un único objeto por idioma.
- **Rationale:** Un solo lugar para traducciones y cambios de copy; fácil de pasar a marketing o a una herramienta de traducción; tipo `Lang` y estructura tipada evitan errores y permiten añadir idiomas de forma ordenada.

### 6.4 Idioma por defecto EN y `?lang=es` para español

- **Decisión:** Por defecto inglés; español con query param `?lang=es`.
- **Rationale:** Alineado con “Launching UK/EU-first” y con un público inicial internacional; el español está soportado desde el primer día sin duplicar rutas. hreflang o rutas por idioma se pueden añadir más adelante si se prioriza SEO por idioma.

### 6.5 Precios y planes en copy (orientativos)

- **Decisión:** Precios (€0, €59, €149, €399) y límites (ej. “Up to 10 investors”) definidos en `lib/copy.ts` como parte del contenido de la landing.
- **Rationale:** La landing debe mostrar una propuesta clara; tener los números en copy permite cambiarlos sin tocar lógica. Se deja explícito en documentación que son placeholder hasta validación comercial (ver pendientes).

### 6.6 CTAs a app y Calendly externos

- **Decisión:** “Start free” → `app.investiaflow.com/signup`; “Book a demo” → Calendly.
- **Rationale:** Separación clara entre registro autoservicio y venta asistida; Calendly permite control de disponibilidad y seguimiento sin construir calendario propio. Las URLs deben confirmarse y, si cambian, actualizarse en componentes y en este documento.

### 6.7 Script de build de landing que oculta `src/`

- **Decisión:** `build-landing.sh` mueve `src` fuera, ejecuta `next build`, restaura `src`.
- **Rationale:** Next intentaría compilar todo el árbol; `src/` es código Vite con rutas y patrones que pueden chocar con App Router. Ocultar `src` evita conflictos sin tener que separar repos o carpetas más complejas.

### 6.8 Imágenes y vídeos como placeholders

- **Decisión:** Hero y Product Tour con gradientes/bloques y texto placeholder; sin screenshots ni vídeo aún.
- **Rationale:** Prioridad en estructura, copy y flujo; el contenido visual se puede sustituir cuando haya capturas o vídeo aprobados sin cambiar la arquitectura de componentes.

---

## 7. Pendientes y decisiones por cerrar

### 7.1 Imágenes y marca

| Ítem | Estado | Acción |
|------|--------|--------|
| Hero — preview producto | Placeholder | Sustituir por screenshot o mockup (p. ej. Kanban/Data Room/Dashboard). Formato sugerido: PNG/WebP 16:9 ~1920×1080. Ubicación sugerida: `public/images/hero-product-preview.png`. |
| Product Tour — 3 pantallas | Placeholders | Capturas o mockups: (1) Pipeline/Kanban, (2) Reglas y automatizaciones, (3) Portal de inversores / señales. WebP, proporciones adecuadas para cards. |
| Social proof — logos | Bloques grises | Definir si se usan logos de aceleradoras/fondos/startups (con permiso). 3 imágenes, escala de grises, ~40–48px altura, p. ej. `public/images/logos/`. |
| Logo / wordmark | Solo texto “InvestiaFlow” | Añadir asset de logo si se define. |
| Favicon / Apple Touch Icon | No | Añadir en `app/` o `public/`. |
| Open Graph / Twitter image | No | Añadir p. ej. `public/og-image.png` 1200×630 para preview en redes. |

### 7.2 Vídeos

- ¿Incluir vídeo corto (30–60 s) en hero o “How it works”? Si sí: grabar/editar, subir a CDN o YouTube/Vimeo, embed y sustituir placeholder. Formato: MP4 (WebM opcional), autoplay mute en móvil.

### 7.3 Textos y copy

- **Hardcoded:** “Product Preview” en hero; “Screen 1/2/3” en Product Tour — mover a `lib/copy.ts` (EN/ES) o eliminar si las imágenes llevan el peso.
- **Pricing:** Badge “Popular” en Starter — añadir en copy `popularPlan: 'Popular'` / `'Recomendado'` (o similar) y usar en `components/landing/Pricing.tsx`.
- **Footer “Launching UK/EU-first”:** Validar si se mantiene o se matiza (ej. “Disponible en UK y UE”).
- **Páginas legales:** Enlaces a `/privacy` y `/terms` en el footer; las rutas no existen. Crear páginas en Next o enlazar a documento externo (Notion/Google Doc/PDF) hasta tener textos definitivos.

### 7.4 Producto y negocio

| Tema | Estado | Acción |
|------|--------|--------|
| Precios finales (EUR) | Placeholder | Validar con comercial/ventas y actualizar `lib/copy.ts` (EN/ES). |
| Límites por plan (leads, docs, miembros) | No detallados | Definir y reflejar en Pricing o página de precios. |
| Calendly / demo | URL en código | Crear evento en Calendly (o equivalente) y confirmar URL; actualizar nav, hero, pricing y final CTA si cambia. |
| Dominio landing vs app | No definido en código | Decidir si landing es `investiaflow.com` (raíz) o subdominio; documentar y, si aplica, configurar redirects. |
| SEO e idioma | EN por defecto, `?lang=es` | Valorar hreflang o rutas por idioma si se publican URLs distintas. |
| Roadmap “Coming soon” | No hay sección | Opcional: bloque pequeño “Roadmap” con 2–3 ítems “Próximamente”. |

### 7.5 Mejoras técnicas y UX (landing)

- **Nav móvil:** Menú (Product, How it works, Pricing, FAQ) en desktop; en móvil valorar menú hamburger con enlaces + CTAs.
- **Accesibilidad:** Revisar contraste (gray-text en fondos claros y en footer sobre navy).
- **Analytics:** Si se usan (GA, Plausible, etc.), añadir script solo en layout de la landing.
- **Cookies / consent:** Si hay analytics o cookies de marketing, valorar banner de consentimiento y enlace a política de privacidad.

### 7.6 Prioridades sugeridas (resumen)

1. **Alta:** Sustituir placeholders del hero y product tour por imágenes reales; traducir “Popular” y textos hardcoded; crear o enlazar `/privacy` y `/terms`.
2. **Media:** Logos de social proof; favicon y OG image; confirmar URLs de CTAs y Calendly.
3. **Baja:** Vídeo opcional; sección Roadmap; menú hamburger en móvil; analytics y cookies.

---

## 8. Operativa: build, deploy y mantenimiento

### 8.1 Comandos

- **App (desarrollo):** `npm run dev` (Vite).
- **Landing (desarrollo):** `npm run dev:next` (Next). Si falla por `src/`, usar el mismo truco que en build o ejecutar en un contexto donde Next no compile `src/` (el script de build lo hace limpiando `src`).
- **Build app:** `npm run build` (tsc + vite build); salida en `dist/`.
- **Build landing (export estático):** `npm run build:landing`; salida en `out/`. Contenido de `out/` es lo que se sube a Hostinger (o similar).

### 8.2 Deploy app (Vercel)

- Config en `vercel.json`: build `npm run build`, output `dist`, framework Vite, rewrites a `index.html`.
- Conectar repo y desplegar; dominio `app.investiaflow.com` según decisión de dominio.

### 8.3 Deploy landing (Hostinger estático)

1. Ejecutar `npm run build:landing`.
2. Subir **todo el contenido** de `out/` (no la carpeta `out`) a `public_html` (File Manager o FTP).
3. Activar SSL en el panel si no está.
4. Verificar idioma con `?lang=es` y enlaces internos.

Detalle completo: `HOSTING_HOSTINGER.md`.

### 8.4 Cloud Functions (emails)

- Configurar Resend API Key: `firebase functions:config:set resend.api_key="..."`
- Deploy: `./deploy.sh` o pasos en `DEPLOY_INSTRUCTIONS.md`.

### 8.5 Variables de entorno

- **App (Vite):** `.env.local` con prefijo `VITE_` para Firebase (y cualquier otra variable que el cliente necesite). No commitear `.env.local`.
- **Landing:** No usa env en front; si se añade analytics u otro script con clave, valorar variables de build o inyección en el host.

---

## 9. Referencias y documentación existente

| Documento | Contenido |
|-----------|------------|
| **PRODUCTO_INVESTIAFLOW_MARKETING.md** | Descripción comercial del producto, estado actual por módulo, mensajes clave, casos de uso, formatos para marketing. |
| **LANDING_PENDIENTES.md** | Listado de pendientes de la landing (imágenes, vídeos, textos, decisiones, mejoras y prioridades). |
| **HOSTING_HOSTINGER.md** | Cómo hostear la landing en Hostinger: export estático (Opción A) y VPS con Node (Opción B), pasos y notas. |
| **FIREBASE_SETUP.md** | Configuración de proyecto Firebase, Auth, Firestore, Storage, reglas, variables de entorno. |
| **RESEND_SETUP.md** | Resend: dominio, API key, CORS (emails vía Cloud Functions en producción). |
| **CLOUD_FUNCTIONS_SETUP.md** | Configuración y deploy de Cloud Functions (Resend, etc.). |
| **DEPLOY_INSTRUCTIONS.md** | Deploy de Cloud Functions (script automático y manual). |
| **investiaflow-master-prompt.md** | Visión del producto, stack, estructura de archivos, principios de arquitectura (referencia para desarrollo). |

---

**Contacto y actualizaciones**

- Este handover refleja el estado a **febrero 2026**.
- Para dudas sobre qué está implementado o qué se puede prometer: alinear con producto/desarrollo.
- Para precios, planes y condiciones comerciales: alinear con quien defina la oferta (ventas/comercial).
- Actualizar este documento y los referenciados cuando se cierren pendientes o se tomen nuevas decisiones.

---

*Documento de handover creado para el equipo InvestiaFlow. Incluye producto, landing, marketing, tecnología, rationale y operativa para continuidad del proyecto.*
