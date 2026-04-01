# Guía de Deployment a Vercel

Esta guía te ayudará a desplegar tu tienda de dulcería en producción usando Vercel.

## Pre-requisitos

- ✅ Cuenta en [Vercel](https://vercel.com)
- ✅ Cuenta en [Supabase](https://supabase.com) (base de datos PostgreSQL)
- ✅ Cuenta en [Stripe](https://stripe.com)
- ✅ Cuenta en [Cloudinary](https://cloudinary.com) (para imágenes)
- ✅ Repositorio en GitHub

## Paso 1: Preparar el Repositorio

1. Crea un repositorio en GitHub
2. Sube tu proyecto:

```bash
git init
git add .
git commit -m "Initial commit"
git branch -M main
git remote add origin https://github.com/tu-usuario/dulceria-ecommerce.git
git push -u origin main
```

## Paso 2: Configurar Base de Datos en Supabase

1. Ve a https://supabase.com
2. Crea un nuevo proyecto
3. Espera a que termine de configurarse
4. Ve a **Settings → Database**
5. Copia el **Connection String** (URI format)
6. Guárdalo para el siguiente paso

## Paso 3: Desplegar en Vercel

### 3.1 Conectar Repositorio

1. Ve a https://vercel.com
2. Click en **Add New → Project**
3. Importa tu repositorio de GitHub
4. Selecciona el framework: **Next.js**

### 3.2 Configurar Variables de Entorno

En la sección **Environment Variables**, agrega:

#### Base de datos
```
DATABASE_URL = postgresql://usuario:password@host:5432/database
```

#### NextAuth
```
NEXTAUTH_SECRET = [genera con: openssl rand -base64 32]
NEXTAUTH_URL = https://tu-dominio.vercel.app
```

#### Stripe
```
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY = pk_live_...
STRIPE_SECRET_KEY = sk_live_...
STRIPE_WEBHOOK_SECRET = [lo configuraremos después]
```

#### Cloudinary (opcional)
```
NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME = tu-cloud-name
CLOUDINARY_API_KEY = tu-api-key
CLOUDINARY_API_SECRET = tu-api-secret
```

### 3.3 Build Settings

Vercel detectará automáticamente Next.js. Asegúrate de que:

- **Build Command**: `prisma generate && next build`
- **Output Directory**: `.next`
- **Install Command**: `npm install`

### 3.4 Deploy

1. Click en **Deploy**
2. Espera a que termine el build (2-5 minutos)
3. ¡Tu sitio está en línea!

## Paso 4: Configurar Webhook de Stripe

### 4.1 Crear Webhook en Stripe

1. Ve a https://dashboard.stripe.com/webhooks
2. Click en **Add endpoint**
3. Endpoint URL: `https://tu-dominio.vercel.app/api/stripe/webhook`
4. Eventos a escuchar:
   - `checkout.session.completed`
   - `payment_intent.succeeded`
   - `payment_intent.payment_failed`
5. Click en **Add endpoint**

### 4.2 Copiar Webhook Secret

1. Click en el webhook recién creado
2. Copia el **Signing secret** (empieza con `whsec_`)
3. Ve a Vercel → Settings → Environment Variables
4. Agrega/actualiza `STRIPE_WEBHOOK_SECRET` con este valor
5. Redeploy el proyecto para aplicar cambios

## Paso 5: Inicializar Base de Datos

### 5.1 Desde tu Local

```bash
# Asegúrate de que DATABASE_URL apunte a producción
npx prisma db push

# Opcional: Sembrar datos de prueba
npm run db:seed
```

### 5.2 Crear Usuario Admin

Opción A: Usando Prisma Studio local conectado a producción
```bash
npm run db:studio
```

Opción B: Desde SQL en Supabase
```sql
INSERT INTO "User" (id, name, email, password, role, "createdAt", "updatedAt")
VALUES (
  gen_random_uuid(),
  'Admin',
  'admin@tudominio.com',
  '$2a$10$hashedPasswordAqui',  -- Genera en https://bcrypt-generator.com/
  'ADMIN',
  NOW(),
  NOW()
);
```

## Paso 6: Verificar Deployment

### Checklist Post-Deploy

- ✅ El sitio carga correctamente
- ✅ Puedes navegar por el catálogo
- ✅ Puedes agregar productos al carrito
- ✅ El login funciona
- ✅ El webhook de Stripe responde (prueba con modo test)
- ✅ Las imágenes cargan correctamente
- ✅ El panel admin es accesible

### Probar Webhook

Desde tu local:
```bash
stripe listen --forward-to https://tu-dominio.vercel.app/api/stripe/webhook
stripe trigger checkout.session.completed
```

## Paso 7: Configurar Dominio Personalizado (Opcional)

1. Ve a Vercel → Settings → Domains
2. Agrega tu dominio personalizado
3. Sigue las instrucciones para configurar DNS
4. Actualiza `NEXTAUTH_URL` con tu nuevo dominio
5. Actualiza el webhook URL en Stripe

## Troubleshooting

### Build falla: "Prisma Client not generated"
- Asegúrate de que el build command sea: `prisma generate && next build`

### Error 500 en producción
- Verifica que todas las variables de entorno estén configuradas
- Revisa los logs en Vercel Dashboard → Deployments → [tu deploy] → Runtime Logs

### Webhook no funciona
- Verifica que `STRIPE_WEBHOOK_SECRET` sea correcto
- Verifica que el endpoint URL en Stripe sea correcto
- Revisa los logs del webhook en Stripe Dashboard

### Base de datos no conecta
- Verifica que `DATABASE_URL` tenga el formato correcto
- Verifica que Supabase permita conexiones externas
- Revisa las reglas de firewall si usas otra BD

## Monitoreo y Mantenimiento

### Logs
```bash
# Ver logs en tiempo real
vercel logs tu-dominio.vercel.app --follow
```

### Analytics
- Vercel ofrece analytics gratis
- Actívalo en Settings → Analytics

### Performance
- Usa Next.js Image optimization
- Habilita ISR para páginas de productos
- Configura CDN de Cloudinary

## Seguridad

### Checklist de Seguridad

- ✅ Cambiar contraseñas por defecto
- ✅ Usar claves de Stripe en modo producción (`pk_live_`, `sk_live_`)
- ✅ Nunca commitear `.env.local`
- ✅ Habilitar 2FA en Vercel, Supabase y Stripe
- ✅ Revisar logs regularmente
- ✅ Configurar rate limiting
- ✅ Implementar CSP headers

## Costos Estimados (Mensuales)

- **Vercel**: $0 (Hobby) - $20 (Pro)
- **Supabase**: $0 (Free tier, 500MB) - $25 (Pro, 8GB)
- **Stripe**: 3.6% + $3 MXN por transacción
- **Cloudinary**: $0 (Free tier, 25GB) - $89 (Plus)

Total inicial: **$0/mes** (con free tiers)

---

¿Problemas? Revisa la [documentación de Next.js](https://nextjs.org/docs/deployment) y [Vercel](https://vercel.com/docs).
