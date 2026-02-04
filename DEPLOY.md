# 🚀 Guía de Deploy - InvestiaFlow

Esta guía te ayudará a desplegar InvestiaFlow en Vercel (recomendado) o Netlify.

---

## 📋 Prerequisitos

1. ✅ Cuenta en [Vercel](https://vercel.com) (gratis con GitHub)
2. ✅ Proyecto conectado a GitHub
3. ✅ Firebase configurado y funcionando
4. ✅ Variables de entorno listas

---

## 🎯 Opción 1: Deploy en Vercel (Recomendado)

### Paso 1: Instalar Vercel CLI (opcional)

```bash
npm i -g vercel
```

### Paso 2: Login en Vercel

```bash
vercel login
```

### Paso 3: Deploy desde CLI (opcional)

```bash
# Deploy a preview
vercel

# Deploy a producción
vercel --prod
```

### Paso 4: Deploy desde Dashboard (Recomendado)

1. **Conectar repositorio**:
   - Ve a [vercel.com](https://vercel.com)
   - Click en "Add New Project"
   - Conecta tu repositorio de GitHub (`sebascoler/InvestiaFlow`)
   - Selecciona el proyecto

2. **Configurar proyecto**:
   - **Framework Preset**: Vite
   - **Root Directory**: `./` (raíz del proyecto)
   - **Build Command**: `npm run build`
   - **Output Directory**: `dist`
   - **Install Command**: `npm install`

3. **Configurar Variables de Entorno**:
   
   En la sección "Environment Variables", agrega todas las variables de `.env.local`:
   
   ```
   VITE_FIREBASE_API_KEY=tu_api_key
   VITE_FIREBASE_AUTH_DOMAIN=investiaflow.firebaseapp.com
   VITE_FIREBASE_PROJECT_ID=investiaflow
   VITE_FIREBASE_STORAGE_BUCKET=investiaflow.firebasestorage.app
   VITE_FIREBASE_MESSAGING_SENDER_ID=616157577653
   VITE_FIREBASE_APP_ID=1:616157577653:web:e65bc6850580c005d819fc
   VITE_FIREBASE_MEASUREMENT_ID=G-KD5P6CWE5V
   VITE_RESEND_API_KEY=tu_resend_api_key
   VITE_RESEND_FROM_EMAIL=sebas@investia.capital
   ```
   
   ⚠️ **Importante**: Marca todas como disponibles para **Production**, **Preview** y **Development**.

4. **Deploy**:
   - Click en "Deploy"
   - Espera a que termine el build
   - Tu app estará disponible en `https://investiaflow.vercel.app` (o el dominio que elijas)

### Paso 5: Configurar Dominio Personalizado (Opcional)

1. En el dashboard de Vercel, ve a **Settings** → **Domains**
2. Agrega tu dominio (ej: `app.investia.capital`)
3. Sigue las instrucciones para configurar DNS:
   - Agrega un registro CNAME apuntando a `cname.vercel-dns.com`
   - O un registro A apuntando a la IP de Vercel

---

## 🌐 Opción 2: Deploy en Netlify

### Paso 1: Instalar Netlify CLI (opcional)

```bash
npm i -g netlify-cli
```

### Paso 2: Login en Netlify

```bash
netlify login
```

### Paso 3: Deploy desde CLI

```bash
# Build del proyecto
npm run build

# Deploy
netlify deploy --prod --dir=dist
```

### Paso 4: Deploy desde Dashboard

1. Ve a [netlify.com](https://netlify.com)
2. Click en "Add new site" → "Import an existing project"
3. Conecta tu repositorio de GitHub
4. Configura:
   - **Build command**: `npm run build`
   - **Publish directory**: `dist`
5. Agrega las variables de entorno en **Site settings** → **Environment variables**
6. Click en "Deploy site"

---

## ✅ Verificación Post-Deploy

Después del deploy, verifica:

1. ✅ **Build exitoso**: El build debe completarse sin errores
2. ✅ **App carga**: La app debe cargar en la URL proporcionada
3. ✅ **Firebase funciona**: Intenta hacer login
4. ✅ **Rutas funcionan**: Navega entre páginas (CRM, Data Room, etc.)
5. ✅ **Variables de entorno**: Verifica que Firebase esté conectado correctamente

---

## 🔧 Troubleshooting

### Error: "Module not found" o errores de build

- Verifica que todas las dependencias estén en `package.json`
- Asegúrate de que `node_modules` no esté en `.gitignore` (debe estar)
- Ejecuta `npm install` localmente para verificar

### Error: "Firebase not initialized"

- Verifica que todas las variables de entorno estén configuradas en Vercel/Netlify
- Asegúrate de que las variables empiecen con `VITE_`
- Revisa que no haya espacios extra en los valores

### Error: "404 en rutas"

- Verifica que `vercel.json` (o `netlify.toml`) tenga la configuración de rewrites
- Todas las rutas deben redirigir a `index.html` para que React Router funcione

### Error: "CORS" o problemas con Cloud Functions

- Verifica que las Cloud Functions estén desplegadas
- Revisa que la URL de las funciones sea correcta en producción
- Asegúrate de que Firebase esté configurado para el dominio de producción

---

## 📝 Checklist Pre-Deploy

- [ ] Build local funciona: `npm run build`
- [ ] Preview local funciona: `npm run preview`
- [ ] Variables de entorno documentadas
- [ ] `.env.local` no está en el repositorio (verificado en `.gitignore`)
- [ ] Firebase configurado y funcionando
- [ ] Cloud Functions desplegadas (si aplica)
- [ ] Reglas de Firestore desplegadas
- [ ] Reglas de Storage desplegadas
- [ ] Dominio configurado (si aplica)

---

## 🔄 Deploy Automático

Con GitHub conectado, cada push a `main` desplegará automáticamente:

- **Push a `main`**: Deploy a producción
- **Pull Request**: Deploy a preview (URL temporal)

---

## 📚 Recursos

- [Documentación de Vercel](https://vercel.com/docs)
- [Documentación de Netlify](https://docs.netlify.com/)
- [Vite Deploy Guide](https://vitejs.dev/guide/static-deploy.html)

---

## 🎉 ¡Listo!

Una vez desplegado, tu app estará disponible públicamente. Comparte la URL con tus usuarios y ¡a usar InvestiaFlow! 🚀
