# Cómo hostear la landing de InvestiaFlow en Hostinger

Guía paso a paso para publicar la landing (Next.js) en Hostinger. Hay dos caminos según tu plan: **hosting web (estático)** o **VPS**.

---

## Opción A: Hosting web (estático) — Plan Shared o similar

La landing no usa API routes ni server-side dinámico crítico; el idioma se maneja con `?lang=` en el cliente. Por tanto se puede exportar como sitio estático y subirlo a la carpeta pública de Hostinger.

### Paso 1: Exportar el proyecto como estático

1. Abre `next.config.js` en la raíz del proyecto.

2. Añade la opción `output: 'export'`:

```js
/** @type {import('next').NextConfig} */
const nextConfig = {
  output: 'export',
  reactStrictMode: true,
  images: {
    unoptimized: true,  // necesario en static export si usas next/image
  },
}

export default nextConfig
```

3. En la terminal, desde la raíz del proyecto:

```bash
npm run build:landing
```

> **Nota:** En este repo la app principal es Vite; la landing es Next.js. `build:landing` exporta solo la landing a `out/`. Si el proyecto fuera solo Next, usarías `npm run build`.

4. Se generará la carpeta **`out`** con HTML, CSS y JS. Todo lo que hay en `out` es lo que debes subir al servidor.

### Paso 2: Entrar en el panel de Hostinger

1. Entra en [hpanel.hostinger.com](https://hpanel.hostinger.com) e inicia sesión.
2. Selecciona el **dominio** donde quieres la landing (ej. `investiaflow.com` o `www.investiaflow.com`).

### Paso 3: Subir los archivos

**Opción 3a — File Manager (recomendado):**

1. En el panel, abre **“Administrador de archivos”** (File Manager).
2. Navega a la carpeta **`public_html`** (raíz del sitio).
3. **Opcional:** Borra o renombra el contenido actual si era una web antigua.
4. Sube **todo el contenido** de la carpeta `out` (no la carpeta `out` en sí):
   - Selecciona “Upload” / “Subir”.
   - Arrastra o elige todos los archivos y carpetas que hay dentro de `out` (incluidos `_next`, etc.) para que queden directamente dentro de `public_html`.

**Opción 3b — FTP:**

1. En Hostinger, en la sección “FTP”, revisa usuario y contraseña (o créalos).
2. Conéctate con FileZilla (o similar): host `ftp.tudominio.com`, usuario y contraseña FTP.
3. En el servidor, entra en `public_html`.
4. Sube todo el contenido de tu carpeta local `out` a `public_html`.

### Paso 4: Comprobar que funciona

1. Abre en el navegador `https://tudominio.com`.
2. Prueba la landing, el cambio de idioma (`?lang=es`) y los enlaces internos.

### Paso 5: SSL (HTTPS)

- En Hostinger suele estar **SSL gratis** (Let’s Encrypt). En el panel, busca “SSL” o “Seguridad” y actívalo para tu dominio si no lo está.
- Si antes usabas HTTP, cambia a `https://` en todas las URLs que tengas guardadas.

---

## Opción B: VPS en Hostinger (Next.js con Node.js)

Si prefieres ejecutar Next.js con `npm start` (sin static export), usa un VPS.

### Paso 1: Contratar y acceder al VPS

1. En Hostinger, contrata un **VPS** (KVM o similar).
2. Anota IP, usuario (p. ej. `root`) y contraseña que te envían por email.
3. Conéctate por SSH desde tu ordenador:

```bash
ssh root@TU_IP_VPS
```

### Paso 2: Instalar Node.js

```bash
# Actualizar e instalar Node 20 (LTS)
curl -fsSL https://deb.nodesource.com/setup_20.x | sudo -E bash -
sudo apt-get install -y nodejs

# Comprobar
node -v   # v20.x
npm -v
```

### Paso 3: Subir el proyecto al VPS

**Opción A — Clonar desde Git (recomendado):**

```bash
# Instalar git si no está
sudo apt-get update && sudo apt-get install -y git

# Clonar (sustituye por tu repo)
cd /var/www
sudo mkdir -p investiaflow-landing && sudo chown $USER:$USER investiaflow-landing
cd investiaflow-landing
git clone https://github.com/TU_USUARIO/TU_REPO.git .

# Instalar dependencias y build
npm ci
npm run build
```

**Opción B — Subir con SCP desde tu PC:**

Desde tu máquina local (en la carpeta del proyecto, después de `npm run build`):

```bash
scp -r . next@TU_IP_VPS:/var/www/investiaflow-landing
```

Luego en el VPS instalas dependencias y haces build (o solo `npm start` si ya subiste la carpeta `.next`).

### Paso 4: Ejecutar la app con PM2

En el VPS:

```bash
sudo npm install -g pm2

cd /var/www/investiaflow-landing
npm run build
pm2 start npm --name "investiaflow-landing" -- start
pm2 save
pm2 startup   # sigue las instrucciones para que arranque al reiniciar
```

La app quedará escuchando en el puerto **3000** dentro del VPS.

### Paso 5: Nginx como proxy inverso

1. Instalar Nginx:

```bash
sudo apt-get update
sudo apt-get install -y nginx
```

2. Crear configuración para tu dominio:

```bash
sudo nano /etc/nginx/sites-available/investiaflow
```

Contenido (sustituye `tudominio.com`):

```nginx
server {
    listen 80;
    server_name tudominio.com www.tudominio.com;

    location / {
        proxy_pass http://127.0.0.1:3000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
        proxy_cache_bypass $http_upgrade;
    }
}
```

3. Activar sitio y recargar Nginx:

```bash
sudo ln -s /etc/nginx/sites-available/investiaflow /etc/nginx/sites-enabled/
sudo nginx -t
sudo systemctl reload nginx
```

### Paso 6: SSL con Certbot

```bash
sudo apt-get install -y certbot python3-certbot-nginx
sudo certbot --nginx -d tudominio.com -d www.tudominio.com
```

Sigue las preguntas (email, aceptar términos). Certbot configurará HTTPS en Nginx.

### Paso 7: Actualizar la landing en el futuro

Si usas Git en el VPS:

```bash
cd /var/www/investiaflow-landing
git pull
npm ci
npm run build
pm2 restart investiaflow-landing
```

---

## Resumen rápido

| Objetivo | Opción | Pasos clave |
|----------|--------|-------------|
| Lo más simple, plan Shared | **A — Estático** | `output: 'export'` → `npm run build` → subir contenido de `out` a `public_html` |
| Control total, Next.js con Node | **B — VPS** | VPS → Node + PM2 → Nginx proxy → Certbot SSL |

---

## Notas

- **Dominio y DNS:** En Hostinger, el dominio del plan debe apuntar al mismo Hostinger (o la IP del VPS si usas Opción B). Revisa en “Dominios” / “DNS” que los registros A o CNAME sean correctos.
- **Variables de entorno:** Esta landing no usa `.env` en el front; si más adelante añades algo que lo necesite, en VPS puedes usar `pm2` con archivo `ecosystem.config.js` y la opción `env`.
- **Rutas `/privacy` y `/terms`:** Si creas esas páginas en Next.js, en static export se generarán como `privacy.html` y `terms.html`. Hostinger suele servir `privacy.html` en `/privacy` si configuras redirección o reglas; si no, enlaza directamente a `/privacy.html` y `/terms.html` desde el footer hasta que el servidor esté configurado para URLs bonitas.

Si indicas si tienes plan Shared o VPS, se puede detallar solo esa opción en los pasos que vayas a usar.
