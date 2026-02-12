# Pendientes de la landing page — InvestiaFlow

Documento de seguimiento: qué falta por completar en la landing (imágenes, vídeos, textos, decisiones y mejoras).

---

## 1. Imágenes

### 1.1 Hero — Preview del producto
- **Estado:** Placeholder (gradiente + bloques SVG + texto "Product Preview").
- **Pendiente:**
  - Screenshot real o mockup de alta calidad del producto (p. ej. vista del Kanban, Data Room o Dashboard).
  - Formato recomendado: PNG o WebP, relación 16:9, resolución ~1920×1080 (o equivalente para retina).
  - Ubicación sugerida: `public/images/hero-product-preview.png` (o carpeta equivalente).

### 1.2 Product Tour — Tres “pantallas”
- **Estado:** Tres cards con gradiente + emoji 🖥️ + texto "Screen 1/2/3".
- **Pendiente:**
  - **Pantalla 1:** Captura o mockup del **Pipeline / Kanban** (tablero de inversores).
  - **Pantalla 2:** Captura del flujo de **Reglas y automatizaciones**.
  - **Pantalla 3:** Captura del **Portal de inversores** o vista de señales (views/downloads).
  - Mismo criterio: formato ligero (WebP), buenas proporciones para card.

### 1.3 Social proof — Logos
- **Estado:** Tres bloques grises (placeholder) debajo del hero.
- **Pendiente:**
  - Definir si se usan logos de aceleradoras, fondos o startups (con permiso).
  - Tres imágenes en escala de grises, formato PNG/SVG transparente, altura ~40–48px.
  - Carpeta sugerida: `public/images/logos/` (ej. `logo-1.svg`, `logo-2.svg`, `logo-3.svg`).

### 1.4 Marca
- **Logo / wordmark:** Actualmente solo texto "InvestiaFlow" en la nav y en el footer.
- **Favicon:** Añadir favicon (y opcionalmente apple-touch-icon) en `app/` o `public/`.
- **Open Graph / Twitter:** Si se quiere preview en redes, añadir imagen OG (ej. `public/og-image.png`, 1200×630).

---

## 2. Vídeos

- **Estado:** No hay vídeos.
- **Decisiones:**
  - ¿Incluir un vídeo corto (30–60 s) en el hero o en “How it works”? (demo del producto, sin voz o con voz.)
  - Si sí: grabar/editar, subir a un CDN o a YouTube/Vimeo (embed) y sustituir el placeholder del hero o añadir sección “Ver cómo funciona”.
  - Formato: MP4 (WebM opcional), pensado para autoplay mute en móvil.

---

## 3. Textos

### 3.1 Hardcoded en inglés
- **Hero:** "Product Preview" en el bloque central — mover a `lib/copy.ts` (EN/ES).
- **Product Tour:** "Screen 1", "Screen 2", "Screen 3" — mover a copy o eliminar si las imágenes llevan el peso.
- **Pricing:** Badge "Popular" en la tarjeta Starter — ya existe clave en copy pero el componente usa `lang === 'en' ? 'Popular' : 'Popular'`; añadir en copy algo como `popularPlan: 'Popular'` y traducción ES (ej. "Recomendado" o "Popular") y usar en el componente.

### 3.2 Copy a revisar / decidir
- **Precios y planes:** Los importes (€0, €59, €149, €399) y los límites (ej. “Up to 10 investors” en Free) son orientativos. Confirmar con producto/comercial antes de dejar como definitivos.
- **CTA:** "Start free" / "Book a demo" — confirmar que las URLs finales son:
  - Start free → `https://app.investiaflow.com/signup`
  - Book a demo → `https://calendly.com/investiaflow/demo`
- **Footer:** "Launching UK/EU-first" — validar si se mantiene o se matiza (ej. “Disponible en UK y UE”).

### 3.3 Páginas legales
- **Privacidad:** Enlace a `/privacy` — la ruta no existe. Crear página o enlazar a documento externo (ej. Notion/Google Doc o PDF) hasta tener política de privacidad definitiva.
- **Términos:** Enlace a `/terms` — igual que arriba; crear página o URL externa hasta tener términos de uso.

---

## 4. Decisiones de producto y negocio

| Tema | Estado | Acción |
|------|--------|--------|
| Precios finales (EUR) | Placeholder | Validar con comercial/ventas y actualizar `lib/copy.ts` (EN/ES). |
| Límites por plan (leads, docs, miembros) | No detallados en copy | Definir y reflejar en la sección Pricing (o en página de precios dedicada). |
| Calendly / demo | URL placeholder | Crear evento en Calendly (o herramienta equivalente) y actualizar enlaces en nav, hero, pricing y final CTA. |
| Dominio landing | No definido en código | Decidir si landing es `investiaflow.com` (raíz) o subdominio (ej. `www.` o `app.` solo para app). |
| Idioma por defecto / SEO | Por defecto EN, `?lang=es` | Mantener o añadir hreflang si se publican URLs distintas por idioma. |
| Roadmap “Coming soon” | No hay sección | Si se quiere mencionar integraciones o funcionalidades futuras, añadir bloque pequeño “Roadmap” con 2–3 ítems y etiqueta “Próximamente”. |

---

## 5. Mejoras técnicas y UX

- **Nav móvil:** El menú (Product, How it works, Pricing, FAQ) en desktop está bien; en móvil podría colapsar en hamburger y mostrar los enlaces + CTAs para mejor uso.
- **Accesibilidad:** Revisar contraste de grises (`gray-text`) en fondos claros y en footer (texto gris sobre navy).
- **Analytics:** Si se usan (Google Analytics, Plausible, etc.), añadir script o componente solo en layout de la landing.
- **Cookies / consent:** Si se añade analytics o cookies de marketing, valorar banner de consentimiento y enlace a política de privacidad.

---

## 6. Resumen de prioridades sugeridas

1. **Alta:** Sustituir placeholders del hero y del product tour por imágenes reales; traducir "Popular" y textos hardcoded; crear o enlazar `/privacy` y `/terms`.
2. **Media:** Logos de social proof; favicon y OG image; confirmar URLs de CTAs y Calendly.
3. **Baja:** Vídeo opcional; sección Roadmap; menú hamburger en móvil; analytics y cookies.

---

*Documento generado para seguimiento interno. Actualizar según se cierren ítems.*
