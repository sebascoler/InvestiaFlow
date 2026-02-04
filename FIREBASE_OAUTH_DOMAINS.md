# 🔐 Configurar Dominios Autorizados en Firebase

Cuando despliegas InvestiaFlow en producción, necesitas autorizar el dominio de Vercel/Netlify en Firebase para que la autenticación OAuth (Google, etc.) funcione correctamente.

---

## 🚨 Error Común

Si ves este error:
```
Firebase: Error (auth/unauthorized-domain)
The current domain is not authorized for OAuth operations
```

Significa que el dominio de producción no está en la lista de dominios autorizados de Firebase.

---

## ✅ Solución: Agregar Dominio a Firebase

### Paso 1: Acceder a Firebase Console

1. Ve a [Firebase Console](https://console.firebase.google.com/)
2. Selecciona tu proyecto: **investiaflow**
3. En el menú lateral, ve a **Authentication**
4. Click en la pestaña **Settings** (Configuración)
5. Scroll hasta la sección **Authorized domains** (Dominios autorizados)

### Paso 2: Agregar Dominio de Vercel

1. Click en **Add domain** (Agregar dominio)
2. Ingresa tu dominio de Vercel:
   - Si es el dominio por defecto: `investia-flow.vercel.app`
   - Si configuraste dominio personalizado: `app.investia.capital` (o el que hayas configurado)
3. Click en **Add** (Agregar)

### Paso 3: Verificar Dominios Autorizados

Deberías ver una lista similar a esta:

```
✅ localhost (siempre incluido)
✅ investia-flow.vercel.app (recién agregado)
✅ app.investia.capital (si configuraste dominio personalizado)
```

---

## 📋 Lista de Dominios a Agregar

Dependiendo de dónde hayas desplegado, agrega:

### Vercel
- `investia-flow.vercel.app` (dominio por defecto)
- `tu-dominio-personalizado.com` (si configuraste uno)

### Netlify
- `investiaflow.netlify.app` (dominio por defecto)
- `tu-dominio-personalizado.com` (si configuraste uno)

### Desarrollo Local
- `localhost` (ya viene incluido por defecto)

---

## 🔄 Después de Agregar el Dominio

1. **Espera unos segundos** para que los cambios se propaguen
2. **Recarga la página** de tu app desplegada
3. **Intenta hacer login nuevamente** con Google o Email/Password

---

## ⚠️ Notas Importantes

1. **No necesitas reiniciar nada**: Los cambios se aplican automáticamente
2. **Funciona inmediatamente**: Una vez agregado, debería funcionar de inmediato
3. **Múltiples dominios**: Puedes agregar tantos dominios como necesites (dev, staging, producción)
4. **Dominios personalizados**: Si cambias de dominio, agrega el nuevo también

---

## 🐛 Troubleshooting

### El error persiste después de agregar el dominio

1. Verifica que escribiste el dominio correctamente (sin `https://` ni `/`)
2. Asegúrate de que no haya espacios extra
3. Espera 1-2 minutos y recarga la página
4. Limpia la caché del navegador (Ctrl+Shift+R o Cmd+Shift+R)

### No puedo encontrar la sección de Authorized domains

1. Asegúrate de estar en **Authentication** → **Settings** (no en Users o Providers)
2. Scroll hacia abajo, está después de la configuración de providers
3. Si no la ves, verifica que tengas permisos de administrador en el proyecto

### Quiero agregar múltiples dominios

Simplemente repite el proceso para cada dominio que necesites:
- `investia-flow.vercel.app`
- `staging.investiaflow.com`
- `app.investia.capital`
- etc.

---

## 📸 Ubicación Visual

En Firebase Console:
```
Authentication
  └── Settings (pestaña)
      └── Authorized domains (sección al final)
          └── Add domain (botón)
```

---

## ✅ Checklist

- [ ] Accedí a Firebase Console
- [ ] Seleccioné el proyecto correcto
- [ ] Fui a Authentication → Settings
- [ ] Agregué el dominio de Vercel/Netlify
- [ ] Esperé unos segundos
- [ ] Recargué la app desplegada
- [ ] Probé hacer login nuevamente

---

## 🎉 ¡Listo!

Una vez agregado el dominio, la autenticación debería funcionar perfectamente en producción. 🚀
