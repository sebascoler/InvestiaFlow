# 🌐 Configurar Dominio Personalizado - flow.investia.capital

Guía completa para configurar tu dominio personalizado `flow.investia.capital` en Vercel y Hostinger.

---

## 📋 Paso 1: Configurar Dominio en Vercel

### 1.1 Agregar Dominio en Vercel

1. Ve a tu proyecto en [Vercel Dashboard](https://vercel.com/dashboard)
2. Selecciona tu proyecto **InvestiaFlow**
3. Ve a **Settings** → **Domains**
4. En el campo "Add Domain", ingresa:
   ```
   flow.investia.capital
   ```
5. Haz clic en **Add**

### 1.2 Configuración de Vercel

Vercel te mostrará las instrucciones de DNS. Tienes dos opciones:

#### Opción A: CNAME (Recomendado - más fácil)
- **Tipo**: CNAME
- **Nombre**: `flow` (o `@` si quieres el dominio raíz)
- **Valor**: `cname.vercel-dns.com`

#### Opción B: A Record (Alternativa)
- **Tipo**: A
- **Nombre**: `flow` (o `@`)
- **Valor**: IP de Vercel (te lo mostrará Vercel, generalmente es `76.76.21.21`)

---

## 📋 Paso 2: Configurar DNS en Hostinger

### 2.1 Acceder a Hostinger

1. Ve a [Hostinger](https://www.hostinger.com/) e inicia sesión
2. Ve a **Domains** → Selecciona `investia.capital`
3. Haz clic en **Manage** → **DNS / Name Servers**

### 2.2 Agregar Registro DNS

Tienes dos opciones según lo que Vercel te haya indicado:

#### Si Vercel te dio un CNAME:

1. Haz clic en **Add Record** o **Add New Record**
2. Configura:
   - **Type**: `CNAME`
   - **Name**: `flow` (o deja en blanco si Hostinger usa `@` para el dominio raíz)
   - **Points to**: `cname.vercel-dns.com`
   - **TTL**: `3600` (o el valor por defecto)
3. Haz clic en **Save** o **Add Record**

#### Si Vercel te dio un A Record:

1. Haz clic en **Add Record** o **Add New Record**
2. Configura:
   - **Type**: `A`
   - **Name**: `flow` (o deja en blanco si Hostinger usa `@`)
   - **Points to**: La IP que Vercel te proporcionó (ej: `76.76.21.21`)
   - **TTL**: `3600` (o el valor por defecto)
3. Haz clic en **Save** o **Add Record**

### 2.3 Verificar Configuración

Después de agregar el registro, deberías ver algo como:

```
Type    Name    Points to              TTL
CNAME   flow    cname.vercel-dns.com   3600
```

---

## 📋 Paso 3: Verificar en Vercel

### 3.1 Esperar Propagación DNS

- Los cambios DNS pueden tardar entre **5 minutos y 48 horas**
- Generalmente funciona en **15-30 minutos**

### 3.2 Verificar Estado en Vercel

1. En Vercel Dashboard → **Settings** → **Domains**
2. Verifica el estado de `flow.investia.capital`:
   - ✅ **Valid**: Dominio configurado correctamente
   - ⏳ **Pending**: Esperando verificación DNS
   - ❌ **Invalid**: Revisa la configuración DNS

### 3.3 Verificar SSL

Vercel automáticamente:
- Configura SSL/HTTPS con Let's Encrypt
- Redirige HTTP → HTTPS
- Esto puede tardar unos minutos después de que el DNS esté configurado

---

## 📋 Paso 4: Agregar Dominio a Firebase

### 4.1 Autorizar Dominio en Firebase

1. Ve a [Firebase Console](https://console.firebase.google.com/)
2. Selecciona tu proyecto: **investiaflow**
3. Ve a **Authentication** → **Settings**
4. En **Authorized domains**, haz clic en **Add domain**
5. Ingresa: `flow.investia.capital`
6. Haz clic en **Add**

### 4.2 Verificar Dominios Autorizados

Deberías ver:
```
✅ localhost
✅ investia-flow.vercel.app
✅ flow.investia.capital (recién agregado)
```

---

## 📋 Paso 5: Verificar que Todo Funciona

### 5.1 Probar el Dominio

1. Espera 15-30 minutos después de configurar DNS
2. Abre tu navegador y ve a: `https://flow.investia.capital`
3. Deberías ver tu app de InvestiaFlow

### 5.2 Probar Autenticación

1. Haz clic en **Login**
2. Intenta hacer login con Google
3. Debería funcionar sin errores de dominio no autorizado

### 5.3 Verificar SSL

- La URL debe empezar con `https://`
- Debe mostrar un candado verde en el navegador
- No debe haber advertencias de seguridad

---

## 🔧 Troubleshooting

### El dominio no carga después de 30 minutos

1. **Verifica DNS**:
   ```bash
   # En terminal/Mac/Linux
   dig flow.investia.capital
   
   # O en Windows (PowerShell)
   nslookup flow.investia.capital
   ```
   
   Deberías ver `cname.vercel-dns.com` o la IP de Vercel

2. **Verifica en Hostinger**:
   - Asegúrate de que el registro esté guardado
   - Verifica que no haya errores de sintaxis
   - Confirma que el TTL no sea muy alto (usa 3600)

3. **Verifica en Vercel**:
   - Ve a Settings → Domains
   - Verifica que el dominio esté agregado correctamente
   - Revisa si hay mensajes de error

### Error "Domain not found" en Vercel

- Espera más tiempo (hasta 48 horas)
- Verifica que el registro DNS esté correcto en Hostinger
- Asegúrate de que el dominio esté agregado en Vercel

### Error de SSL/HTTPS

- Espera 5-10 minutos después de que el DNS esté configurado
- Vercel configura SSL automáticamente
- Si después de 1 hora no funciona, contacta a Vercel support

### Error de Firebase "unauthorized-domain"

- Verifica que agregaste `flow.investia.capital` en Firebase
- Asegúrate de que no haya espacios o caracteres extra
- Espera unos segundos y recarga la página

### El dominio carga pero muestra error 404

- Verifica que el proyecto correcto esté conectado al dominio en Vercel
- Asegúrate de que el último deploy fue exitoso
- Revisa que `vercel.json` esté configurado correctamente

---

## 📝 Checklist Completo

- [ ] Dominio agregado en Vercel (Settings → Domains)
- [ ] Registro DNS configurado en Hostinger (CNAME o A Record)
- [ ] Esperado 15-30 minutos para propagación DNS
- [ ] Dominio verificado en Vercel (estado: Valid)
- [ ] SSL configurado automáticamente por Vercel
- [ ] Dominio agregado en Firebase (Authentication → Settings → Authorized domains)
- [ ] App carga correctamente en `https://flow.investia.capital`
- [ ] Login con Google funciona sin errores
- [ ] Todas las rutas funcionan correctamente

---

## 🎯 Configuración Final Recomendada

Una vez que todo funcione, puedes:

1. **Redirigir el dominio de Vercel**:
   - En Vercel → Settings → Domains
   - Puedes mantener `investia-flow.vercel.app` como alias
   - O redirigirlo a `flow.investia.capital`

2. **Actualizar variables de entorno** (si es necesario):
   - Generalmente no es necesario cambiar nada
   - Las variables de Firebase funcionan con cualquier dominio autorizado

3. **Configurar dominio raíz** (opcional):
   - Si quieres que `investia.capital` también apunte a la app
   - Agrega otro registro DNS en Hostinger:
     - Tipo: `CNAME`
     - Name: `@` (o vacío)
     - Points to: `cname.vercel-dns.com`
   - Agrega `investia.capital` en Vercel y Firebase también

---

## 📚 Recursos

- [Documentación de Vercel sobre dominios](https://vercel.com/docs/concepts/projects/domains)
- [Documentación de Hostinger DNS](https://www.hostinger.com/tutorials/how-to-change-dns-records)
- [Guía de Firebase Authorized Domains](./FIREBASE_OAUTH_DOMAINS.md)

---

## 🎉 ¡Listo!

Una vez completados estos pasos, tu app estará disponible en `https://flow.investia.capital` con SSL automático y autenticación funcionando perfectamente. 🚀
