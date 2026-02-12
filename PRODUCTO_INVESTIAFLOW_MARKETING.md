# InvestiaFlow — Documento de Producto para Marketing

**Versión:** Febrero 2026  
**Uso:** Equipo de marketing — descripción comercial completa del producto, estado actual y pendiente.  
**Tono:** Comercial, orientado a comunicación externa e interna. No técnico.

---

## 1. ¿Qué es InvestiaFlow?

**InvestiaFlow** es una plataforma web que **automatiza y organiza todo el proceso de fundraising** para startups. Une en un solo lugar:

- Un **CRM visual** (tablero tipo Kanban) para seguir a cada inversor potencial.
- Un **Data Room inteligente** que comparte documentos con cada inversor **solo cuando corresponde**, según en qué fase del proceso esté.

**En una frase:**  
*“El CRM de fundraising que comparte los documentos correctos con el inversor correcto, en el momento correcto — sin que tengas que acordarte tú.”*

**Propuesta de valor central:**  
Dejar de perseguir inversores con emails manuales, hojas de cálculo y carpetas desordenadas. Tener **un solo lugar** donde ves el pipeline, los documentos y quién ha visto qué, con **reglas automáticas** que comparten archivos y envían avisos por email cuando un inversor avanza de fase.

---

## 2. A quién va dirigido

- **Fundadores y CEOs** de startups en ronda seed o Serie A que llevan ellos mismos el fundraising.
- **Equipos de crecimiento o negocio** que gestionan el proceso de captación de inversión.
- **Asesores y consultores** que acompañan a varias startups en sus rondas.
- **Inversores ángel o fondos** que quieren un Data Room ordenado y profesional para sus portfolio companies.

**Perfil ideal:** Startup que ya tiene varios inversores en conversación y sufre desorden en seguimiento, envío de documentos y control de quién ha visto qué.

---

## 3. Problema que resuelve

- **Seguimiento caótico:** Listas en Excel, notas sueltas, olvidos de “¿a quién le mandé el pitch?”.
- **Documentos mal controlados:** Mismo deck enviado por email a todos, sin saber cuándo compartir datos sensibles (due diligence, financials).
- **Trabajo manual repetitivo:** Enviar el mismo pack de documentos una y otra vez según avanza cada inversor.
- **Falta de visibilidad:** No saber quién ha abierto o descargado qué documento.
- **Experiencia poco profesional:** Links genéricos, emails informales, imagen de desorganización frente al inversor.

InvestiaFlow centraliza pipeline, documentos y reglas en una sola herramienta y automatiza el compartir y notificar, manteniendo control y trazabilidad.

---

## 4. Estado actual del producto — Qué hay hoy (COMPLETO)

Todo lo descrito abajo **está implementado y disponible** en el producto actual. Se puede usar de punta a punta para fundraising real.

### 4.1 CRM Pipeline (Kanban)

- **Tablero visual** con columnas por fase del proceso: Target → First Contact → In Conversation → Pitch Shared → Due Diligence → Term Sheet → Committed / Passed.
- **Arrastrar y soltar** inversores entre fases; el sistema registra el cambio y puede disparar automatizaciones.
- **Tarjetas por inversor** con nombre, firma, email, última fecha de contacto y notas.
- **Aviso visual** cuando hace más de 14 días sin contacto (“follow up needed”).
- **Crear y editar** leads desde el tablero o desde un panel lateral con todos los detalles (email, firma, LinkedIn, teléfono, notas).
- **Búsqueda y filtros** por texto, fase, tags y fechas.
- **Tags personalizados** por lead para segmentar (ej. “VC”, “Ángel”, “Estratégico”).
- **Historial y comentarios** por lead: ver cambios de fase y comentarios del equipo en una línea de tiempo.
- **Vista responsive** para usar en móvil y escritorio.

**Beneficio para marketing:** “Pipeline de inversores en un tablero claro; nunca pierdes el hilo de quién está en qué fase.”

---

### 4.2 Data Room

- **Subida de documentos** (pitch deck, financials, legal, métricas, otros) con categorías.
- **Lista de documentos** con filtros por categoría y búsqueda por nombre.
- **Configuración de permisos por documento:** elegir en qué fase del pipeline se comparte cada archivo (ej. “Pitch deck cuando llega a Pitch Shared”, “Financials solo en Due Diligence”).
- **Opcional:** retraso en días (ej. compartir 2 días después de entrar en una fase).
- **Vista previa** de documentos (PDF, imágenes, etc.) desde la propia app.
- **Un solo Data Room** por equipo; los inversores solo ven los documentos que les han sido compartidos según su fase.

**Beneficio para marketing:** “Data Room profesional: subes una vez, defines las reglas, y el sistema comparte lo que toca con cada inversor.”

---

### 4.3 Automatizaciones

- **Reglas configurables:** “Cuando un lead entre en [fase X], compartir [documentos Y] y, opcionalmente, enviar un email.”
- **Múltiples reglas** por fase (ej. una para Pitch Shared, otra para Due Diligence).
- **Retraso en días** antes de compartir o enviar (ej. “3 días después de entrar en Due Diligence”).
- **Emails automáticos** con plantillas personalizables (nombre del inversor, firma, etc.) avisando de nuevos documentos.
- **Activar/desactivar** reglas sin borrarlas.
- **Integración con Resend** (dominio investia.capital) para envío real de correos; Cloud Functions en Firebase para ejecutar las tareas programadas.

**Beneficio para marketing:** “Configuras una vez; cada vez que un inversor avanza, recibe los documentos y el email que tú definiste — cero trabajo manual.”

---

### 4.4 Acceso para inversores (Data Room del inversor)

- **Portal de inversores:** el inversor entra a una URL dedicada (`/investor/login`), pone su email y recibe un **código de verificación de 6 dígitos** por email.
- **Acceso sin contraseña:** solo email + código; no tiene que crear cuenta ni recordar password.
- **Data Room personalizado:** una vez dentro, solo ve los documentos que el equipo le ha compartido según su fase en el pipeline.
- **Vista previa y descarga** de cada documento desde el portal.
- **Registro de uso:** el sistema registra cuándo un documento fue **visto** y cuándo fue **descargado**; esta información está disponible en el CRM (panel del lead y notificaciones).

**Beneficio para marketing:** “Tu inversor recibe un link y un código; entra y ve solo lo que le toca. Tú ves si abrió o descargó cada archivo.”

---

### 4.5 Equipo y colaboración

- **Equipos (Teams):** cada cuenta puede tener un equipo con nombre (p. ej. “Startup X”).
- **Invitar miembros por email** con rol: Owner, Admin, Editor o Viewer.
- **Invitación por link:** el invitado recibe un correo con enlace; al aceptar, se une al equipo (si ya tiene cuenta, inicia sesión; si no, puede registrarse).
- **Permisos por rol:**
  - **Viewer:** solo ver pipeline, Data Room y métricas; no editar.
  - **Editor:** gestionar leads, documentos y automatizaciones; no gestionar equipo ni branding.
  - **Admin:** todo lo anterior + invitar/editar miembros y branding.
  - **Owner:** control total, incluido eliminar equipo o traspasar propiedad.
- **Branding del equipo:** logo, colores (primario, secundario, acento), nombre de empresa y tema (claro/oscuro/auto). La interfaz y, donde aplique, los emails pueden reflejar la marca de la startup.

**Beneficio para marketing:** “Varios miembros del equipo en la misma cuenta, con roles claros y la imagen de tu startup en la herramienta.”

---

### 4.6 Dashboard y métricas

- **Métricas de pipeline:** total de leads, conversión entre fases, distribución por fase.
- **Métricas de documentos:** documentos compartidos, visualizaciones y descargas.
- **Gráficos:** barras por fase, evolución en el tiempo (según datos disponibles).
- **Exportación a CSV** de leads y de métricas para informes o análisis externos.

**Beneficio para marketing:** “Dashboard con el estado del fundraising y del Data Room; exportas datos para informes o para el board.”

---

### 4.7 Notificaciones y seguimiento

- **Notificaciones in-app:** cuando un inversor ve o descarga un documento, el equipo recibe una notificación (con contador de no leídas).
- **Panel de notificaciones** para revisar y marcar como leídas.
- **Historial por lead:** ver en la ficha del inversor todos los cambios de fase y comentarios.
- **Recordatorio visual** en tarjetas de lead cuando hace más de 14 días sin contacto.

**Beneficio para marketing:** “Te avisa cuando un inversor abre o descarga algo; no tienes que entrar al sistema a adivinar.”

---

### 4.8 Configuración y perfil

- **Perfil de usuario:** nombre, email (lectura si viene de Firebase), empresa, teléfono; editable desde Ajustes.
- **Preferencias:** opciones de notificaciones por email, in-app y (donde exista) reportes semanales.
- **Tema:** claro, oscuro o automático (según sistema); coherente con el branding del equipo cuando está definido.

---

### 4.9 Onboarding y ayuda

- **Tour guiado** por las secciones principales (Dashboard, CRM, Data Room, Team) para nuevos usuarios.
- **Modal de bienvenida** y posibilidad de reiniciar el tutorial desde Ayuda.
- **Página de Ayuda** con:
  - Descripción de InvestiaFlow y flujos básicos.
  - FAQs (cómo agregar leads, mover stages, automatizaciones, permisos, acceso inversores, etc.).
  - Consejos de uso (organizar documentos, filtros, reglas típicas, seguimiento).
- **Rutas públicas:** Login para el equipo; login de inversores y Data Room de inversores; aceptación de invitación al equipo (`/invite/:token`).

---

### 4.10 Autenticación y seguridad

- **Inicio de sesión** para el equipo: email/contraseña y Google (Firebase Auth).
- **Inversores:** solo email + código de verificación; sin cuenta en la plataforma.
- **Datos y archivos** en Firebase (Firestore + Storage); reglas de seguridad configuradas para que cada usuario solo acceda a sus equipos y datos.

---

## 5. Resumen ejecutivo para marketing — “Qué podemos decir que ya existe”

- CRM de fundraising en Kanban con seguimiento por fases, tags, historial y comentarios.
- Data Room con permisos por fase y por documento; vista previa y control de qué ve cada inversor.
- Automatizaciones que comparten documentos y envían emails cuando un lead cambia de fase (con delays opcionales).
- Portal para inversores: acceso por email + código; ven solo sus documentos; se registra vista y descarga.
- Equipos con invitaciones, roles (Viewer, Editor, Admin, Owner) y branding (logo, colores, nombre).
- Dashboard con métricas de pipeline y documentos; exportación a CSV.
- Notificaciones in-app cuando un inversor ve o descarga algo.
- Ayuda integrada, tours y FAQs; experiencia responsive.

Todo lo anterior está **disponible y operativo** en el producto actual y puede usarse para comunicar capacidades y casos de uso reales.

---

## 6. Lo pendiente o por mejorar (para contexto interno)

Esto **no** está cerrado como “lanzado” o puede requerir validación comercial/legal. Útil para que marketing sepa qué no prometer aún o qué está en roadmap.

- **Precios y planes:** no hay aún planes públicos (free / starter / growth, etc.) ni página de precios; el producto está en uso pero la oferta comercial puede estar por definir.
- **Límites de uso:** no hay documentación pública de límites (número de leads, documentos, miembros por equipo, envíos de email); pueden existir límites técnicos (Firebase, Resend) que luego se reflejen en planes.
- **Contratos y términos:** si se va a vender de forma estándar, suele hacerse falta términos de uso, política de privacidad y, si aplica, condiciones comerciales.
- **Soporte y canal de ventas:** cómo se contacta al equipo (email, chat, formulario), SLAs o tiempos de respuesta no están descritos en producto.
- **Integraciones:** no hay integraciones públicas con herramientas externas (ej. Slack, calendarios, CRMs genéricos); el producto es autocontenido.
- **Idiomas:** la interfaz y mensajes están principalmente en español/inglés según pantalla; no hay multi-idioma completo documentado como feature.
- **Onboarding post-registro:** el tour y la ayuda existen; flujos específicos “después del signup” (ej. checklist de primer uso) pueden seguir afinándose.
- **Notificaciones en tiempo real:** las notificaciones existen; si en algún momento se documenta “tiempo real” como claim, conviene validar que el comportamiento coincida (Firestore listeners, etc.).

**Uso para marketing:** no prometer precios, límites exactos ni integraciones hasta que estén definidos; sí se puede hablar de “próximamente” o “en roadmap” si el equipo lo autoriza.

---

## 7. Mensajes clave sugeridos para marketing

- **Headline:** “El CRM de fundraising que comparte el Data Room por ti.”
- **Subheadline:** “Pipeline de inversores en un tablero. Documentos que se comparten solos cuando toca. Y tú al tanto de quién abre qué.”
- **Beneficios en una línea:**
  - “Un solo lugar para tu pipeline y tu Data Room.”
  - “Comparte documentos automáticamente según la fase de cada inversor.”
  - “Sabes cuándo un inversor abre o descarga cada archivo.”
  - “Emails automáticos y profesionales cuando subes nuevos documentos.”
  - “Equipo con roles y branding de tu startup.”
- **Para redes o ads:** “Menos Excel, menos emails manuales, más control. InvestiaFlow — CRM + Data Room para tu ronda.”

---

## 8. Casos de uso para historias y contenido

1. **Founder solo:** “Llevo 20 conversaciones con inversores; antes perdía el hilo. Ahora todo está en el Kanban y cuando alguien pasa a due diligence, le llegan solos los documentos y un email.”
2. **Equipo de 2–3:** “CFO y CEO comparten el mismo Data Room; cada uno con su rol. Los inversores entran con un código y ven solo lo que les hemos liberado.”
3. **Imagen profesional:** “Dejamos de mandar PDFs por Gmail. El inversor recibe un link y un código; entra y ve todo ordenado. Nosotros vemos si ha abierto el deck o los financials.”
4. **Automatización:** “Configuramos una regla: al pasar a ‘Pitch Shared’, se comparte el deck y se envía un email. Ya no nos acordamos a mano; siempre va a tiempo.”

---

## 9. Formatos recomendados para uso por marketing

- **One-pager comercial:** Secciones: qué es, para quién, problema, solución (CRM + Data Room + automatización + portal inversor), beneficios en bullets, estado actual (resumen de la sección 4), contacto/CTA.
- **Web de producto:** Hero con headline + subheadline; bloques por beneficio (Pipeline, Data Room, Automatización, Portal inversor, Equipo, Métricas); “Cómo funciona” en 3–4 pasos; FAQ breve; CTA (demo, contacto, registro).
- **Redes:** Posts cortos por beneficio (uno por “pipeline”, uno por “documentos automáticos”, uno por “sabes quién abrió qué”, etc.); testimonios o casos cuando existan.
- **Presentaciones comerciales:** Diapositivas por módulo (CRM, Data Room, Automatización, Inversores, Equipo, Dashboard); evitar jerga técnica; enfatizar ahorro de tiempo, control y imagen profesional.

---

## 10. Contacto y actualizaciones

- Este documento refleja el estado del producto a **febrero 2026**.
- Para dudas sobre qué está implementado o qué se puede prometer en comunicación: alinear con producto/desarrollo.
- Para precios, planes y condiciones comerciales: alinear con quien defina la oferta (ventas/comercial).

---

*Documento creado para uso interno del equipo de marketing de InvestiaFlow. No incluye detalles técnicos de implementación.*
