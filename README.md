# DulceríaOnline - E-Commerce para Dulcería Mexicana

Plataforma de e-commerce completa para venta de dulces mexicanos al mayoreo y menudeo, construida con Next.js 14, TypeScript, Prisma y Stripe.

## 🚀 Características

- ✅ **Dual Pricing**: Sistema de precios para menudeo y mayoreo con cantidades mínimas configurables
- ✅ **Carrito Persistente**: Zustand con localStorage y sincronización a base de datos
- ✅ **Pagos Seguros**: Integración con Stripe (tarjetas, OXXO, transferencias)
- ✅ **Panel Admin**: Dashboard completo para gestión de productos, pedidos, promociones y reportes
- ✅ **Sistema de Promociones**: Creación de ofertas con descuentos, fechas de vigencia y banners
- ✅ **Autenticación**: NextAuth.js v5 con roles (ADMIN/CUSTOMER)
- ✅ **Upload de Imágenes**: Integración con Cloudinary para productos y promociones
- ✅ **SEO Optimizado**: ISR y SSR para mejor posicionamiento
- ✅ **Responsive**: Diseño mobile-first con Tailwind CSS
- ✅ **CRUD Completo**: Productos, categorías, promociones y pedidos

## 📦 Stack Tecnológico

- **Framework**: Next.js 14 (App Router)
- **Lenguaje**: TypeScript
- **Estilos**: Tailwind CSS + shadcn/ui
- **Base de Datos**: PostgreSQL (Supabase)
- **ORM**: Prisma
- **Autenticación**: NextAuth.js v5
- **Pagos**: Stripe
- **Estado**: Zustand
- **Imágenes**: Cloudinary
- **Validación**: Zod
- **Deploy**: Vercel

## 🛠️ Instalación

1. **Clonar el repositorio**
```bash
git clone <repo-url>
cd dulceria-e-commerce
```

2. **Instalar dependencias**
```bash
npm install
```

3. **Configurar variables de entorno**

Copia `.env.example` a `.env.local` y configura:

```env
# PostgreSQL (Supabase)
DATABASE_URL="postgresql://..."
DIRECT_URL="postgresql://..."  # Para migraciones

# NextAuth
NEXTAUTH_URL="http://localhost:3000"
NEXTAUTH_SECRET="<genera-con: openssl rand -base64 32>"

# Stripe
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY="pk_test_..."
STRIPE_SECRET_KEY="sk_test_..."
STRIPE_WEBHOOK_SECRET="whsec_..."

# Cloudinary (para imágenes de productos y promociones)
NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME="tu-cloud-name"
CLOUDINARY_API_KEY="..."
CLOUDINARY_API_SECRET="..."

# Admin (usuario inicial)
ADMIN_EMAIL="admin@dulceria.com"
ADMIN_PASSWORD="admin123"
```

> **Nota**: Consulta [CLOUDINARY_SETUP.md](./CLOUDINARY_SETUP.md) para instrucciones detalladas de configuración de Cloudinary.

4. **Configurar la base de datos**
```bash
npx prisma migrate dev
npx prisma generate
```

5. **Iniciar el servidor de desarrollo**
```bash
npm run dev
```

Abre [http://localhost:3000](http://localhost:3000)

## 📁 Estructura del Proyecto

```
/app
  /(store)                          # Rutas públicas
    /page.tsx                        # Home con banner de promociones
    /catalogo/page.tsx               # Listado de productos
    /catalogo/[slug]/page.tsx        # Detalle de producto
    /carrito/page.tsx                # Carrito
    /checkout/page.tsx               # Checkout
    /confirmacion/page.tsx           # Confirmación de pedido
    /mayoreo/page.tsx                # Info mayoreo
    /promociones/page.tsx            # Ver promociones activas
  /(admin)                          # Rutas protegidas (requiere rol ADMIN)
    /admin/page.tsx                  # Dashboard con métricas
    /admin/productos/page.tsx        # CRUD productos
    /admin/productos/nuevo/page.tsx  # Crear producto
    /admin/productos/[id]/editar/    # Editar producto
    /admin/pedidos/page.tsx          # Gestión de pedidos
    /admin/promociones/page.tsx      # CRUD promociones
    /admin/promociones/nueva/        # Crear promoción
    /admin/promociones/[id]/editar/  # Editar promoción
  /api
    /auth/[...nextauth]/             # NextAuth handlers
    /products/                       # API de productos
    /products/[id]/                  # CRUD individual
    /orders/                         # API de pedidos
    /promotions/                     # API de promociones
    /promotions/[id]/                # CRUD individual
    /stripe/create-session/          # Crear sesión de pago
    /stripe/webhook/                 # Webhook de Stripe
    /upload/                         # Firma para upload a Cloudinary
/components
  /ui/                               # shadcn/ui components
  /store/                            # Componentes de la tienda
    /navbar.tsx                       # Navegación principal
    /product-card.tsx                 # Tarjeta de producto
    /cart-drawer.tsx                  # Carrito lateral
    /promo-banner.tsx                 # Banner de promociones
    /product-filters.tsx              # Filtros de catálogo
    /checkout-form.tsx                # Formulario de checkout
    /footer.tsx                       # Footer del sitio
  /admin/                            # Componentes del admin
    /product-form.tsx                 # Formulario de productos
    /promo-creator.tsx                # Formulario de promociones
/lib
  /prisma.ts                         # Cliente Prisma
  /stripe.ts                         # Cliente Stripe
  /cloudinary.ts                     # Helpers Cloudinary
  /auth.ts                           # Configuración NextAuth
  /utils.ts                          # Utilidades
/store
  /cart.ts                           # Zustand store del carrito
/prisma
  /schema.prisma                     # Modelos de datos
```

## 🗄️ Modelos de Datos

### Producto
- Precio menudeo y mayoreo
- Cantidad mínima para mayoreo (default: 12)
- Stock
- Múltiples imágenes
- Categorización
- SKU único

### Orden
- Estado del pedido (PENDING, CONFIRMED, SHIPPED, DELIVERED, CANCELLED)
- Estado del pago (PENDING, PAID, FAILED, REFUNDED)
- Información de cliente y envío
- Método de pago (card, oxxo, transfer)
- IDs de Stripe para tracking

### Promoción
- Tipos: Porcentaje, Monto fijo, 2x1, Bundle
- Descuento configurable
- Rango de fechas de vigencia (startDate - endDate)
- Banner de imagen (opcional)
- Aplicable a productos específicos
- Estado activo/inactivo
- Visualización automática en home y página de promociones
## 💳 Configurar Webhook de Stripe

Para que los pagos funcionen correctamente en desarrollo:

1. Instala Stripe CLI: https://stripe.com/docs/stripe-cli
2. Inicia sesión: `stripe login`
3. Escucha webhooks:
```bash
stripe listen --forward-to localhost:3000/api/stripe/webhook
```
4. Copia el webhook secret que aparece y actualiza `STRIPE_WEBHOOK_SECRET` en `.env.local`

## 🔐 Roles y Permisos

### CUSTOMER
- Ver catálogo
- Agregar al carrito
- Realizar pedidos
- Ver historial de pedidos

### ADMIN
- Acceso total al panel admin (`/admin`)
- CRUD completo de productos con imágenes múltiples
- CRUD completo de promociones con banners
- Gestión de pedidos con cambios de estado
- Ver reportes y métricas
- Confirmaciones obligatorias para acciones destructivas (eliminar)

## 🚢 Deploy en Vercel

1. Push a GitHub
2. Importa en Vercel
3. Configura las variables de entorno
4. Configura el webhook de Stripe en producción:
   - URL: `https://tu-dominio.vercel.app/api/stripe/webhook`
   - Eventos: `checkout.session.completed`

## 📝 Scripts Disponibles

```bash
npm run dev          # Servidor de desarrollo
npm run build        # Build para producción
npm run start        # Inicia servidor de producción
npm run lint         # Ejecuta linter
npm run db:push      # Sincroniza schema sin migraciones
npm run db:migrate   # Crea y ejecuta migraciones
```

## 📸 Configuración de Cloudinary

Cloudinary se usa para almacenar y optimizar imágenes de productos y promociones.

### Setup Rápido

1. **Crear cuenta** en [Cloudinary](https://cloudinary.com)
2. **Copiar credenciales** del Dashboard:
   - Cloud Name → `NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME`
   - API Key → `CLOUDINARY_API_KEY`
   - API Secret → `CLOUDINARY_API_SECRET`
3. **Agregar a `.env.local`**
4. El upload es firmado server-side para mayor seguridad

### Características

- Upload firmado desde servidor
- Almacenamiento en carpetas separadas (`products/`, `promotions/`)
- Optimización automática de imágenes
- CDN global para mayor velocidad
- Preview en tiempo real en formularios

## 🎨 Personalización

### Colores

Edita `app/globals.css` para personalizar la paleta de colores:

```css
:root {
  --primary: 346 77% 50%;    /* Rosa vibrante #E91E63 */
  --secondary: 45 93% 47%;   /* Amarillo #F59E0B */
  --accent: 160 84% 39%;     /* Verde menta #10B981 */
}
```

### Componentes UI

Los componentes shadcn/ui están en `/components/ui` y son completamente personalizables.

### Cantidad Mínima Mayoreo

Configurable por producto en el campo `wholesaleMinQty` (default: 12 piezas).

## ✅ Características Implementadas

### Completadas

- [x] Sistema de dual pricing (menudeo/mayoreo)
- [x] Carrito persistente con Zustand
- [x] Integración completa con Stripe (card, OXXO, transfer)
- [x] Panel administrativo con dashboard
- [x] CRUD completo de productos con imágenes múltiples
- [x] CRUD completo de promociones con banners
- [x] Banner carousel automático de promociones
- [x] Autenticación con roles (NextAuth v5)
- [x] Upload de imágenes a Cloudinary
- [x] Validación de formularios con Zod
- [x] Confirmaciones para acciones destructivas

### Pendientes

- [ ] Búsqueda de productos
- [ ] Sistema de reseñas y calificaciones
- [ ] Notificaciones por email (SMTP)
- [ ] Wishlist / favoritos
- [ ] Filtros avanzados en catálogo
- [ ] Exportación de reportes (CSV/PDF)
- [ ] Integración con paqueterías

## 🐛 Troubleshooting

### Error 401 en Cloudinary
- Verifica que uses `NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME` (con prefijo `NEXT_PUBLIC_`)
- Confirma que las credenciales API Key y API Secret sean correctas

### Error "Property 'promotion' does not exist on PrismaClient"
- Ejecuta: `npx prisma generate`
- Si persiste, reinicia el servidor de desarrollo

### Warnings NaN en formularios de productos/promociones
- Ya corregido en v1.1.0
- Los campos numéricos ahora usan valores por defecto de string vacío

### Webhook de Stripe no funciona
- En desarrollo: ejecuta `stripe listen --forward-to localhost:3000/api/stripe/webhook`
- Copia el webhook secret que aparece
- Actualiza `STRIPE_WEBHOOK_SECRET` en `.env.local`

## 📚 Recursos

- [Next.js 14](https://nextjs.org/docs)
- [Prisma ORM Docs](https://www.prisma.io/docs)
- [Stripe Payments](https://stripe.com/docs/payments)
- [NextAuth.js v5](https://authjs.dev)
- [shadcn/ui Components](https://ui.shadcn.com)
- [Cloudinary Media Library](https://cloudinary.com/documentation)
- [Zustand State Management](https://zustand-demo.pmnd.rs)
- [Tailwind CSS](https://tailwindcss.com/docs)

## 📖 Documentación Adicional

- [GETTING_STARTED.md](./GETTING_STARTED.md) - Guía paso a paso para iniciar el proyecto
- [CLOUDINARY_SETUP.md](./CLOUDINARY_SETUP.md) - Configuración detallada de Cloudinary
- [ARCHITECTURE.md](./ARCHITECTURE.md) - Arquitectura y decisiones técnicas
- [COMPONENTS.md](./COMPONENTS.md) - Documentación de componentes
- [DEPLOYMENT.md](./DEPLOYMENT.md) - Guía de deployment en Vercel

## 🔄 Changelog Reciente

### v1.1.0 (Última Actualización)

- ✅ Sistema completo de promociones (admin + cliente)
- ✅ Banner carousel automático en home
- ✅ Upload de imágenes a Cloudinary con firma server-side
- ✅ Corrección de errores NaN en formularios numéricos
- ✅ Confirmaciones con AlertDialog para eliminar productos/promociones
- ✅ Paleta de colores vibrante (rosa, amarillo, verde)
- ✅ Página de promociones para clientes con filtrado por fechas
- ✅ Mejoras en UX del panel administrativo

## 📄 Licencia

MIT

---

Desarrollado con ❤️ para la mejor dulcería de México 🍬
