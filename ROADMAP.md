# 🗺️ Roadmap - Dulcería E-Commerce

Este documento detalla todas las funcionalidades pendientes de implementar en la plataforma de e-commerce, organizadas por prioridad y área.

---

## � **ESTADO ACTUAL DEL PROYECTO**

**Progreso General**: 15/20 features completadas (**75%**)

### Sprints Completados:
- ✅ **Sprint 1** - Fundamentos (Auth, Orders, Categories, Search): 100%
- ✅ **Sprint 2** - UX Crítica (Filtros, Reports, Order Mgmt, Emails): 100%
- ⏳ **Sprint 3** - Admin Features (Inventario pendiente): 90%
- ⏳ **Sprint 4** - Features Avanzados (15/20 completado): 90%
- ⏳ **Sprint 5** - Growth & Optimización (SEO, Analytics, i18n): 60%

### Últimas Features Implementadas:
1. ✅ **Feature #9** - Sistema de Reseñas (85%) - Reseñas con moderación admin
2. ✅ **Feature #10** - Wishlist/Favoritos (90%) - Heart buttons + página dedicada
3. ✅ **Feature #11** - Comparador de Precios (95%) - Calculadora interactiva + mayoreo
4. ✅ **Feature #13** - Cupones de Descuento (90%) - Validación + panel admin completo
5. ✅ **Feature #19** - Modo Oscuro (100%) - Dark mode completo con next-themes
6. ✅ **Feature #16** - Paginación (100%) - Navegación completa con selector de items
7. ✅ **Feature #17** - Optimizaciones SEO (100%) - Sitemap, metadata, Schema.org

### Próximas Prioridades:
- 📋 Feature #12: Gestión de Inventario Avanzada
- 📋 Feature #14: Mejoras en Checkout (Google Places, envío)
- 📋 Feature #18: Analytics y Tracking
- 📋 Feature #20: Multi-idioma (i18n)
- 📋 Feature #15: Integración con Paqueterías

---

## �🔴 **CRÍTICO - Funcionalidad de E-commerce Esencial**

### 1. Sistema de Autenticación Real ✅ **COMPLETADO**

**Problema**: La página de `mi-cuenta` solo muestra un placeholder sin funcionalidad real.

**✅ Implementado**:
- [x] Registro de nuevos usuarios con validación de email
- [x] Login con email y contraseña (ya existía)
- [ ] Recuperación de contraseña por email (pendiente)
- [x] Perfil de usuario editable (nombre, email, contraseña)
- [x] Integración completa con NextAuth v5
- [x] Protección de rutas privadas

**Archivos creados/modificados**:
- ✅ `app/(store)/mi-cuenta/page.tsx` - Perfil funcional con sesión
- ✅ `app/(store)/mi-cuenta/editar/page.tsx` - Edición de perfil
- ✅ `app/(store)/registro/page.tsx` - Registro de usuarios
- ✅ `app/api/auth/register/route.ts` - API de registro
- ✅ `app/api/auth/update-profile/route.ts` - API actualización perfil
- ✅ `components/ui/alert.tsx` - Componente Alert creado

**Estado**: ✅ Completado (90%) - Falta recuperación de contraseña

---

### 2. Gestión de Pedidos del Usuario ✅ **COMPLETADO**

**Problema**: Los pedidos se crean pero el cliente no tiene forma de consultarlos.

**✅ Implementado**:
- [x] Historial de pedidos del usuario autenticado
- [x] Vista detallada de cada pedido (productos, dirección, estado, total)
- [x] Tracking de estado en tiempo real (PENDING → PAID → PREPARING → SHIPPED → DELIVERED)
- [ ] Filtrado por fecha y estado (básico implementado)
- [ ] Descarga de factura/comprobante en PDF (pendiente)
- [ ] Botón de "Volver a Comprar" (UI creado, falta lógica)

**Archivos creados**:
- ✅ `app/(store)/mi-cuenta/pedidos/page.tsx` - Lista de pedidos
- ✅ `app/(store)/mi-cuenta/pedidos/[folio]/page.tsx` - Detalle del pedido
- ✅ `app/api/orders/[folio]/route.ts` - GET pedido específico
- ✅ `app/api/orders/user/route.ts` - GET pedidos del usuario con paginación

**Estado**: ✅ Completado (85%) - Funciones core implementadas

---

### 3. CRUD de Categorías en Admin ✅ **COMPLETADO**

**Problema**: La página de categorías en admin está vacía (solo UI placeholder).

**✅ Implementado**:
- [x] Listado de todas las categorías con imagen
- [x] Formulario para crear nueva categoría (nombre, slug, imagen)
- [x] Editar categoría existente
- [x] Eliminar categoría (con confirmación y validación de productos asociados)
- [x] Contador de productos por categoría
- [ ] Drag & drop para reordenar categorías (pendiente)

**Archivos creados**:
- ✅ `app/api/categories/route.ts` - GET, POST con validación
- ✅ `app/api/categories/[id]/route.ts` - GET, PUT, DELETE
- ✅ `app/(admin)/admin/categorias/nueva/page.tsx` - Form crear
- ✅ `app/(admin)/admin/categorias/[id]/editar/page.tsx` - Form editar
- ✅ `components/admin/category-form.tsx` - Componente reutilizable
- ✅ `app/(admin)/admin/categorias/delete-category-button.tsx` - Delete con confirmación

**Archivos modificados**:
- ✅ `app/(admin)/admin/categorias/page.tsx` - Listado funcional con grid

**Estado**: ✅ Completado (95%) - Core funcional, falta reordenamiento

---

### 4. Búsqueda de Productos ✅ **COMPLETADO**

**Problema**: No hay buscador funcional (solo el ícono en navbar).

**✅ Implementado**:
- [x] Input de búsqueda con ícono en navbar (SearchBar component)
- [x] Autocomplete con sugerencias mientras escribes
- [x] Búsqueda por nombre, descripción y categoría
- [x] Página de resultados `/buscar?q=...`
- [ ] Búsqueda con tolerancia a errores (fuzzy search) - usa búsqueda simple
- [ ] Historial de búsquedas recientes (pendiente)
- [ ] Búsquedas populares / sugeridas (pendiente)

**Archivos creados**:
- ✅ `app/api/search/route.ts` - API de búsqueda con filtros OR
- ✅ `app/api/search/suggestions/route.ts` - Autocompletado rápido (5 productos)
- ✅ `app/(store)/buscar/page.tsx` - Página de resultados con grid de productos
- ✅ `components/store/search-bar.tsx` - Componente con debounce y dropdown

**Archivos modificados**:
- ✅ `components/store/navbar.tsx` - Integrado SearchBar en desktop

**Estado**: ✅ Completado (90%) - Búsqueda funcional, falta fuzzy search e historial
- ✅ Búsquedas populares / sugeridas

**Archivos a crear**:
- `app/api/search/route.ts` - API de búsqueda
- `app/api/search/suggestions/route.ts` - Autocompletado
- `app/(store)/buscar/page.tsx` - Página de resultados
- `components/store/search-bar.tsx` - Componente de búsqueda
- `components/store/search-suggestions.tsx` - Dropdown de sugerencias

**Archivos a modificar**:
- `components/store/navbar.tsx` - Reemplazar ícono con SearchBar

**Optimización**:
- Considerar usar `pg_trgm` en PostgreSQL para búsqueda full-text
- O integrar Algolia/Meilisearch para búsqueda avanzada

---

## 🟡 **IMPORTANTE - UX y Funcionalidad**

### 5. ✅ Filtros Avanzados en Catálogo

**Estado**: ✅ COMPLETADO (95%) - Filtros completamente funcionales, integrados con URL params

**Implementado**:
- ✅ Filtrado por categoría (checkboxes múltiples)
- ✅ Filtrado por rango de precios (dual slider con Slider de shadcn/ui)
- ✅ Ordenamiento (más recientes, destacados, precio asc/desc, nombre A-Z)
- ✅ Filtro por disponibilidad (solo en stock checkbox)
- ✅ Filtro por tipo de precio (todos, menudeo, mayoreo)
- ✅ Contador de productos filtrados en tiempo real
- ✅ Botón "Limpiar filtros" con indicación visual
- ✅ Integración con query params para SEO
- ✅ Loading states con skeletons
- ✅ Empty state con mensaje y botón para limpiar

**Archivos modificados**:
- ✅ `app/api/products/route.ts` - Añadidos parámetros: categories[], priceMin, priceMax, inStockOnly, clientType, sortBy
- ✅ `app/(store)/catalogo/page.tsx` - Convertido a Client Component, integración completa con ProductFilters, Select de ordenamiento, sincronización con URL
- ✅ `components/store/product-filters.tsx` - Ya existía con toda la funcionalidad implementada, mantiene estado y actualiza URL

**Características destacadas**:
- Filtros persisten en URL → buenos para SEO y compartir enlaces
- Respuesta inmediata sin recargar página completa
- Contador dinámico de resultados
- Badges de categoría en cada producto
- Badge "Agotado" en productos sin stock
- Hover effects en imágenes (scale-105)
- Vista optimizada mobile y desktop (grid responsive)
- AddToCartButton integrado directamente en cards
- Select para ordenamiento

---

### 6. ✅ Reportes con Datos Reales

**Estado**: ✅ COMPLETADO (90%) - Sistema de analytics completo con métricas en tiempo real

**Implementado**:
- ✅ Cálculo real de ventas del mes/año/semana con comparativas vs período anterior
- ✅ Gráficas de tendencias de ventas (recharts con LineChart y AreaChart)
- ✅ Top 10 productos más vendidos con métricas de revenue y unidades
- ✅ Productos con bajo stock con alertas visuales y botón de reabastecimiento
- ✅ Comparativa mes actual vs mes anterior con porcentajes de crecimiento
- ✅ Ticket promedio de compra
- ✅ Selector de período (semana/mes/año) con recalculación automática
- ✅ Métricas de inventario (valor total, productos activos, inactivos, agotados)
- ✅ Breakdown de pedidos por status

**Archivos creados**:
- ✅ `app/api/admin/analytics/sales/route.ts` - Endpoint con métricas de ventas, crecimiento, gráficas por día
- ✅ `app/api/admin/analytics/products/route.ts` - Endpoint con top productos, bajo stock, métricas de inventario
- ✅ `components/admin/sales-chart.tsx` - Componente de gráfica con recharts (Line y Area), tooltip custom
- ✅ `components/admin/top-products-table.tsx` - Tabla con ranking, imágenes, categoría, stock, revenue
- ✅ `components/admin/low-stock-alerts.tsx` - Cards de alerta con botón reabastecimiento directo

**Archivos modificados**:
- ✅ `app/(admin)/admin/reportes/page.tsx` - Reescrito como Client Component con fetch de analytics, selector de período

**Dependencias instaladas**:
```bash
npm install recharts @types/recharts # ✅ Instalado
```

**Características destacadas**:
- Métricas con indicadores visuales de crecimiento (TrendingUp/Down en verde/rojo)
- Loading states con Skeleton en todas las secciones
- Gráficas interactivas con tooltip personalizado mostrando fecha, total y pedidos
- Top productos con ranking visual (oro, plata, bronce para top 3)
- Alertas de bajo stock con badges de color según criticidad (rojo ≤5, amarillo ≤10)
- Período dinámico (semana/mes/año) con labels contextuales
- Grouping por fecha para gráficas diarias
- Formato de moneda consistente (MXN)
- Links directos a edición de productos desde alertas

**Pendiente** (10%):
- Métricas de conversión (visitas → compras) - requiere tracking adicional
- Tasa de abandono de carrito - requiere persistencia de carritos anónimos
- Clientes nuevos vs recurrentes - requiere análisis de usuarios
- Schema tracking (views, sales en Product, conversionSource en Order)

---

### 7. ✅ Gestión de Estados de Pedidos en Admin

**Estado**: ✅ COMPLETADO (85%) - Sistema completo de gestión de pedidos con filtros y acciones

**Implementado**:
- ✅ Actualizar estado del pedido con Select (PENDING → PAID → PREPARING → SHIPPED → DELIVERED → CANCELLED)
- ✅ Asignar número de guía / tracking al envío con Dialog
- ✅ Selector de paquetería (FedEx, DHL, Estafeta, Redpack, Paquetexpress, 99 Minutos)
- ✅ Filtrar pedidos por estado con Select
- ✅ Buscar pedido por folio, email o nombre con campo de búsqueda
- ✅ Cancelar pedidos con devolución automática de stock
- ✅ Confirmación antes de cambiar estado crítico (cancelar)
- ✅ Auto-cambio a SHIPPED al agregar tracking
- ✅ Contador dinámico de resultados filtrados
- ✅ Vista de resumen de productos en cada pedido

**Archivos creados**:
- ✅ `app/api/admin/orders/route.ts` - GET lista de todos los pedidos con items, productos y usuario
- ✅ `app/api/admin/orders/[id]/status/route.ts` - PUT actualizar estado con restauración de stock en cancelaciones
- ✅ `app/api/admin/orders/[id]/tracking/route.ts` - PUT agregar tracking con auto-cambio a SHIPPED
- ✅ `components/admin/order-actions.tsx` - Componente con Select de estados y Dialog de tracking

**Archivos modificados**:
- ✅ `app/(admin)/admin/pedidos/page.tsx` - Convertido a Client Component con filtros, búsqueda y OrderActions

**Características destacadas**:
- Select de estados con labels en español y colores distintivos por status
- Dialog modal para tracking con selector de paquetería y campo de guía
- Validación antes de operaciones destructivas (cancelar pedido)
- Loading states en todas las operaciones
- Auto-refresh con router.refresh() después de cambios
- Links a detalle de pedido desde folio
- Mostrar info de usuario (nombre, email) si está disponible
- Badges de color según estado (amarillo pendiente, verde pagado, azul preparando, etc.)
- Búsqueda en tiempo real por múltiples campos
- Contador de artículos con "ver más" para pedidos grandes
- Info visual de tipo de compra (menudeo/mayoreo)

**Pendiente** (15%):
- Filtrar pedidos por rango de fechas (date picker)
- Imprimir resumen del pedido para empacar (PDF o vista imprimible)
- Notificar al cliente por email al cambiar estado (requiere Feature #8)
- Campos dedicados en schema para tracking (trackingNumber, carrier, trackingUrl)
- Página de detalle individual de pedido en admin ([folio]/page.tsx)

---

### 8. ✅ Notificaciones por Email

**Estado**: ✅ COMPLETADO (80%) - Sistema de emails transaccionales implementado con Resend + React Email

**Implementado**:
- ✅ Email de bienvenida al registrarse (enviado automáticamente)
- ✅ Email de cambio de estado de pedido (enviado al actualizar status)
- ✅ Email con tracking al marcar como enviado
- ✅ Templates HTML responsive con React Email
- ✅ Cliente de email con Resend con manejo de errores
- ✅ Integración no-bloqueante (errores de email no fallan operaciones)
- ✅ Extracción de tracking de notas para mostrar en email

**Archivos creados**:
- ✅ `lib/email.ts` - Cliente de Resend con helper sendEmail()
- ✅ `emails/order-confirmation.tsx` - Template de confirmación con items, totales y dirección
- ✅ `emails/order-status-update.tsx` - Template de actualización con status badges, mensajes dinámicos y tracking info
- ✅ `emails/welcome.tsx` - Template de bienvenida con beneficios y CTA

**Archivos modificados**:
- ✅ `app/api/auth/register/route.ts` - Envía email de bienvenida después del registro
- ✅ `app/api/admin/orders/[id]/status/route.ts` - Envía email al cambiar estado, incluye tracking si existe
- ✅ `app/api/admin/orders/[id]/tracking/route.ts` - Envía email específico al agregar tracking

**Dependencias instaladas**:
```bash
npm install resend react-email @react-email/components # ✅ Instalado
# + múltiples componentes de React Email
```

**Variables de entorno requeridas**:
```env
RESEND_API_KEY=re_...  # Obtener en resend.com
EMAIL_FROM=noreply@dulceriaonline.com  # Email verificado en Resend
NEXTAUTH_URL=http://localhost:3000  # Para links en emails
```

**Características destacadas**:
- Templates con diseño responsive y accesible (mobile-first)
- Estilos inline para compatibilidad con clientes de email
- Mensajes y emojis dinámicos según el status del pedido
- Información de tracking formateada y fácil de leer
- Preview text optimizado para bandeja de entrada
- Manejo graceful de errores (logs detallados, no bloquea operación principal)
- Personalización con nombre del cliente
- Links directos a páginas relevantes (catálogo, detalle de pedido)
- Formato de precios en MXN
- Imágenes de productos en email de confirmación

**Pendiente** (20%):
- Email de confirmación de pedido al realizar compra (requiere integración con webhook de Stripe)
- Email de recuperación de contraseña (requiere flujo de reset password)
- Notificación al admin de nuevo pedido
- Email de carrito abandonado (requiere tracking de carritos)
- Email de facturación (si aplica)

---

## 🟢 **MEJORÍA - Features Adicionales**

### 9. ✅ Sistema de Reseñas y Calificaciones

**Estado**: ✅ COMPLETADO (85%) - Sistema completo de reseñas con moderación

**Implementado**:
- ✅ Modelo `Review` en Prisma (rating 1-5, comment, userId, productId, approved)
- ✅ Form para dejar reseña (solo usuarios autenticados que compraron el producto)
- ✅ Validación de compra: solo se puede reseñar si tienes orden PAID/PREPARING/SHIPPED/DELIVERED con el producto
- ✅ Display de estrellas con componente reutilizable (StarRating)
- ✅ Listado de reviews en página de producto con avatar, fecha, calificación
- ✅ Moderación de reseñas en admin (aprobar/desaprobar/eliminar)
- ✅ Restricción: 1 reseña por usuario por producto (unique constraint)
- ✅ Estadísticas: promedio de rating y total de reseñas
- ✅ Empty state cuando no hay reseñas
- ✅ Filtrado en admin por estado (pendientes/aprobadas/todas)
- ✅ Edición de reseña por el autor (rating y comment)
- ✅ Eliminación permitida para autor y admin
- [ ] Reportar reseña inapropiada (pendiente)
- [ ] Respuesta del vendedor a reseñas (pendiente)
- [ ] Display de estrellas promedio en ProductCard del catálogo (pendiente)

**Archivos creados**:
- ✅ `prisma/schema.prisma` - Modelo Review con relaciones y unique constraint
- ✅ `app/api/reviews/route.ts` - GET (reviews de producto), POST (crear con validaciones)
- ✅ `app/api/reviews/[id]/route.ts` - PUT (editar/aprobar), DELETE (eliminar)
- ✅ `app/api/admin/reviews/route.ts` - GET admin (incluye pendientes, stats)
- ✅ `components/store/star-rating.tsx` - Componente de estrellas (display e interactivo)
- ✅ `components/store/review-form.tsx` - Formulario con validación client-side
- ✅ `components/store/product-reviews.tsx` - Listado con avatares, formatted dates
- ✅ `app/(admin)/admin/resenas/page.tsx` - Panel de moderación completo con filtros

**Archivos modificados**:
- ✅ `app/(store)/catalogo/[slug]/page.tsx` - Añadidas secciones de ReviewForm y ProductReviews

**Validaciones implementadas**:
- Usuario debe estar autenticado para crear reseña
- Usuario debe tener una orden completada (PAID+) con el producto
- Rating entre 1-5 (validado con Zod)
- Comment opcional, máximo 1000 caracteres
- Solo un usuario puede dejar 1 reseña por producto (DB constraint)
- Solo el autor puede editar contenido, solo admin puede aprobar
- Admin puede ver todas, usuarios solo ven aprobadas

**Características destacadas**:
- StarRating reutilizable con sizes (sm/md/lg) y modo interactivo/display
- ReviewForm con preview de caracteres (x/1000)
- Mensaje de éxito cuando se envía (pendiente aprobación)
- ProductReviews con fecha formateada en español (es-MX)
- Admin: badge de pending count destacado
- Admin: filtros por status (pending, approved, all)
- Admin: confirmación de eliminación con AlertDialog
- Admin: link directo al producto desde cada review
- Admin: botones de Aprobar/Desaprobar con iconos Check/X
- Non-blocking: reviews aprobadas se muestran en tiempo real al recargar

**⚠️ IMPORTANTE - Prisma Generate**:
Debido a un error EPERM (archivo en uso) durante el desarrollo, se debe ejecutar:
```bash
# Detener el servidor de desarrollo (Ctrl+C)
npx prisma generate
# Reiniciar servidor
npm run dev
```

Esto actualizará el Prisma Client con el nuevo modelo `Review`.

**Pendiente** (15%):
- Reportar reseña inapropiada (botón + campo `reported` en schema)
- Respuesta del vendedor (modelo ReviewResponse)
- Mostrar avg rating en ProductCard del catálogo (require query adicional)
- Imágenes en reseñas (campo `images: String[]`)
- Paginación en lista de reviews (actualmente muestra todas)
- `app/(admin)/admin/resenas/page.tsx` - Gestión de reseñas

---

### 10. ✅ Wishlist / Favoritos

**Estado**: ✅ COMPLETADO (90%) - Sistema completo de favoritos con integración en catálogo

**Implementado**:
- ✅ Modelo `Wishlist` en Prisma con unique constraint [userId, productId]
- ✅ Botón de corazón en ProductCard (outline/fill según estado)
- ✅ Página `/favoritos` con grid de productos guardados
- ✅ API `/api/wishlist` - GET (lista del usuario), POST (agregar)
- ✅ API `/api/wishlist/[productId]` - DELETE (eliminar)
- ✅ Sincronización con BD (requiere autenticación)
- ✅ Icono de corazón en navbar con enlace a favoritos
- ✅ Integración en menú móvil
- ✅ Empty state cuando no hay favoritos
- ✅ Botón de eliminar en cada card de favoritos
- ✅ AddToCartButton integrado en página de favoritos
- ✅ Validación: no duplicar productos en wishlist
- ✅ Optimistic updates en WishlistButton
- [ ] Contador de favoritos en navbar (pendiente)
- [ ] Notificación si producto en wishlist baja de precio (pendiente)
- [ ] Wishlist anónima en localStorage (actualmente solo con auth)

**Archivos creados**:
- ✅ `prisma/schema.prisma` - Modelo Wishlist agregado
- ✅ `app/api/wishlist/route.ts` - GET (con includes de product y category), POST (con validaciones)
- ✅ `app/api/wishlist/[productId]/route.ts` - DELETE con verificación de ownership
- ✅ `app/(store)/favoritos/page.tsx` - Página completa con grid responsive, loading states, empty state
- ✅ `components/store/wishlist-button.tsx` - Botón con 2 variantes (icon, default), check de wishlist status
- ✅ `components/store/product-card.tsx` - Modificado: añadido WishlistButton en esquina superior derecha
- ✅ `components/store/navbar.tsx` - Modificado: añadido enlace a favoritos (desktop y mobile)

**Validaciones implementadas**:
- Usuario debe estar autenticado para agregar/ver favoritos
- Producto debe existir y estar activo
- No duplicar productos en wishlist (unique constraint en DB)
- Solo el dueño puede ver/eliminar su wishlist

**Características destacadas**:
- WishlistButton verifica status al cargar (useEffect con checkWishlistStatus)
- Heart icon lleno/vacío según estado (fill-red-500 cuando está en wishlist)
- Redirect a /auth/signin si no está autenticado
- Loading states con disabled mientras hace request
- Stop propagation para evitar navegar al producto al dar click en corazón
- Empty state amigable con CTA a catálogo
- Botón de trash en cada card para rápida eliminación
- Badge de "Agotado" si stock === 0
- Precios de menudeo y mayoreo visibles
- Link directo al producto desde cada card
- Hover effects en imágenes (scale-105)
- Responsive: 1 col mobile, 2 tablet, 3 desktop

**⚠️ IMPORTANTE - Prisma Generate**:
Al igual que con Reviews, requiere ejecutar:
```bash
# Detener servidor
Ctrl + C
# Regenerar Prisma Client
npx prisma generate
# Reiniciar
npm run dev
```

**Pendiente** (10%):
- Contador dinámico en navbar (badge con número de favoritos)
- Notificación por email si producto en wishlist baja de precio
- Wishlist anónima (localStorage) que se merge al autenticarse
- Botón "Agregar todos al carrito" en página de favoritos
- Filtros/ordenamiento en página de favoritos

**Schema Prisma**:
```prisma
model Wishlist {
  id        String   @id @default(cuid())
  userId    String
  productId String
  createdAt DateTime @default(now())

  user    User    @relation(fields: [userId], references: [id], onDelete: Cascade)
  product Product @relation(fields: [productId], references: [id], onDelete: Cascade)

  @@unique([userId, productId])
  @@map("wishlists")
}
```

---

### 11. ✅ Comparador de Precios Menudeo vs Mayoreo

**Estado**: ✅ COMPLETADO (95%) - Página completa con calculadora interactiva y ejemplos reales

**Implementado**:
- ✅ Tabla comparativa en página `/mayoreo` con productos reales de la BD
- ✅ Calculadora interactiva: "Si compras X unidades ahorras Y pesos"
- ✅ Ejemplos con productos reales (top 6 productos con precio mayoreo)
- ✅ Grid de productos destacados con badges de descuento
- ✅ Sección "¿Cómo funciona?" con pasos numerados
- ✅ Tabla de comparación con porcentajes de ahorro
- ✅ ISR (Incremental Static Regeneration) cada 60 segundos
- ✅ Cards de beneficios (mejores precios, sin mínimo total, envíos gratis, asesoría)
- ✅ Diseño responsive (mobile/tablet/desktop)
- [ ] Badge en ProductCard mostrando ahorro potencial (pendiente)

**Archivos creados**:
- ✅ `components/store/price-calculator.tsx` - Calculadora interactiva con estados visuales
- ✅ `app/(store)/mayoreo/page.tsx` - Página completa reescrita con productos reales

**Características de la Calculadora**:
- Input de cantidad con validación
- Comparativa side-by-side (menudeo vs mayoreo)
- Cálculo automático de ahorro en pesos y porcentaje
- Indicador visual cuando alcanza cantidad mínima
- Mensaje motivador cuando no alcanza el mínimo
- Diseño con cards coloreados según estado (gris/púrpura/verde)
- Iconos: Calculator (título), TrendingDown (ahorro)

**Características de la Página Mayoreo**:
- Hero con badges (descuento hasta 30%, desde X piezas)
- 4 cards de beneficios en grid responsive
- Calculadora integrada con producto de ejemplo
- Sección "¿Cómo Funciona?" con 3 pasos numerados
- Tabla de comparación con 5 productos reales:
  * Nombre (link al producto)
  * Badge de categoría
  * Cantidad mínima
  * Precio menudeo / mayoreo
  * Porcentaje de ahorro con icono TrendingDown
- Grid de 6 productos destacados:
  * Imagen del producto
  * Badge de descuento en esquina
  * Precios comparativos (menudeo tachado, mayoreo destacado)
  * Link a página de producto
  * Hover effects (scale en imagen, color en título)
- CTA final con gradiente y 2 botones (catálogo, contacto)

**Validaciones y Edge Cases**:
- Si no hay productos con wholesalePrice: usa producto de ejemplo fallback
- Cantidad mínima de 1 en calculadora (evita valores negativos)
- ISR para mantener productos actualizados sin rebuild completo
- Filtra solo productos activos, con stock y precio mayoreo

**UX Highlights**:
- Calculadora muestra feedback en tiempo real al cambiar cantidad
- Colores semánticos: gris (inactivo), púrpura (mayoreo), verde (ahorro)
- Mensajes claros: "¡Ahorras $XXX!" con porcentaje
- Tabla ordenada por featured (productos destacados primero)
- Links en nombres de productos para fácil navegación

**Pendiente** (5%):
- Badge dinámico en ProductCard del catálogo mostrando "Ahorras X% en mayoreo"
- Envío de calculadora de ahorros por email/WhatsApp
- Comparador de múltiples productos (seleccionar 2-3 y comparar)
- Gráfica de evolución de precio según cantidad (ej. 1 pza, 12 pzas, 24 pzas, etc.)

---

### 12. Gestión de Inventario Avanzada

**Implementar**:
- ✅ Alertas visuales de stock bajo (< 10 unidades) en admin
- ✅ Historial de movimientos de inventario (entradas, salidas, ajustes)
- ✅ Reporte de productos agotados
- ✅ Predicción de reabastecimiento basado en ventas
- ✅ Exportar inventario a CSV
- ✅ Importar inventario masivo desde CSV

**Schema Prisma**:
```prisma
model InventoryLog {
  id        String   @id @default(cuid())
  productId String
  type      String   // SALE, PURCHASE, ADJUSTMENT, RETURN
  quantity  Int      // positivo o negativo
  note      String?
  userId    String?
  createdAt DateTime @default(now())

  product Product @relation(fields: [productId], references: [id])
  user    User?   @relation(fields: [userId], references: [id])

  @@map("inventory_logs")
}
```

**Archivos a crear**:
- `app/api/admin/inventory/logs/route.ts` - Historial
- `app/api/admin/inventory/adjust/route.ts` - Ajustar stock
- `app/(admin)/admin/inventario/page.tsx` - Página de inventario
- `components/admin/inventory-table.tsx` - Tabla con alertas

---

### 13. Cupones de Descuento ✅ COMPLETADO (90%)

**Implementado**:
- ✅ Modelo `Coupon` en Prisma con relación a Order
- ✅ Enum `DiscountType` (PERCENTAGE, FIXED)
- ✅ Campo `couponId` en modelo Order
- ✅ API de validación de cupones (`/api/coupons/validate`)
- ✅ APIs admin completas (listar, crear, editar, desactivar)
- ✅ Componente `CouponInput` para clientes
- ✅ Panel admin `/admin/cupones` con tabla, filtros y estadísticas
- ✅ Diálogos de creación y edición de cupones
- ✅ Validaciones avanzadas (fechas, usos, compra mínima)
- ✅ Soft delete (campo `active`)
- ✅ Documentación completa en `SETUP_COUPONS.md`

**Archivos creados**:
1. `app/api/coupons/validate/route.ts` - POST: Validar cupón con todas las reglas
2. `app/api/admin/coupons/route.ts` - GET con filtros, POST crear cupón
3. `app/api/admin/coupons/[id]/route.ts` - GET detalles, PUT actualizar, DELETE desactivar
4. `components/store/coupon-input.tsx` - Input con validación en tiempo real
5. `app/(admin)/admin/cupones/page.tsx` - Panel admin completo con tabla y stats
6. `components/admin/create-coupon-dialog.tsx` - Dialog con formulario de creación
7. `components/admin/edit-coupon-dialog.tsx` - Dialog para editar (código no modificable)
8. `components/admin/coupon-actions.tsx` - Dropdown con acciones (editar/desactivar)
9. `components/admin/coupon-filters.tsx` - Filtros (todos/activos/expirados)
10. `SETUP_COUPONS.md` - Documentación completa con ejemplos

**Schema Prisma** (YA APLICADO):
```prisma
model Coupon {
  id            String       @id @default(cuid())
  code          String       @unique
  discountType  DiscountType
  discountValue Float
  maxUses       Int?         // null = ilimitado
  usedCount     Int          @default(0)
  minPurchase   Float?       // compra mínima requerida
  startDate     DateTime
  endDate       DateTime
  active        Boolean      @default(true)
  createdAt     DateTime     @default(now())
  orders Order[]
  @@map("coupons")
}

enum DiscountType {
  PERCENTAGE
  FIXED
}

// Order model actualizado:
model Order {
  // ... campos existentes
  couponId String?
  coupon   Coupon? @relation(fields: [couponId], references: [id])
}
```

**Validaciones implementadas**:
- ✅ Código único (case-insensitive)
- ✅ Patrón de código: solo A-Z, 0-9, -, _ 
- ✅ Cupón activo (`active = true`)
- ✅ Fechas válidas (actual entre startDate y endDate)
- ✅ Usos disponibles (`usedCount < maxUses`)
- ✅ Compra mínima cumplida (`subtotal >= minPurchase`)
- ✅ Porcentaje máximo 100%
- ✅ Descuento nunca excede subtotal
- ✅ EndDate posterior a startDate
- ✅ Valores numéricos positivos

**Características destacadas**:
- 🎨 Panel admin con estadísticas en tiempo real
- 🔄 Filtros: todos / activos / expirados
- 🎯 Estados visuales con badges de colores:
  - Verde: Activo y vigente
  - Rojo: Expirado
  - Gris: Inactivo o límite alcanzado
  - Blanco: Programado (aún no inicia)
- 📊 Contador de usos: X / max o X / ∞
- 💰 Soporte para dos tipos de descuento:
  - PERCENTAGE: 1-100%
  - FIXED: monto exacto en MXN
- ⚡ Validación en tiempo real en el input
- 🎁 Fondo verde cuando cupón está aplicado
- 🔒 Código no modificable después de creación
- 🗑️ Soft delete para mantener historial
- 📝 Últimos 10 pedidos que usaron el cupón
- 🔐 Solo admin puede gestionar cupones
- 📖 Documentación extensa con ejemplos

**Configuración requerida**:
```powershell
# Instalar componente shadcn faltante
npx shadcn@latest add dropdown-menu

# Generar tipos de Prisma
npx prisma generate

# Crear migración
npx prisma migrate dev --name add_coupons
```

**Cómo integrar en checkout** (ver SETUP_COUPONS.md):
```typescript
import { CouponInput } from '@/components/store/coupon-input';

// En componente de carrito/checkout
<CouponInput
  subtotal={subtotalAmount}
  onCouponApplied={(coupon) => {
    // Guardar cupón aplicado
    // Recalcular total con descuento
  }}
  onCouponRemoved={() => {
    // Limpiar cupón
    // Recalcular total sin descuento
  }}
  appliedCoupon={currentCoupon}
/>
```

**Pendiente (10%)**:
- [ ] Integrar CouponInput en página de carrito/checkout real
- [ ] Implementar incremento de usedCount al confirmar orden
- [ ] Usar transacciones Prisma para aplicar cupón atómicamente
- [ ] Cupones con restricciones avanzadas (por categoría/producto)
- [ ] Generación de códigos únicos por usuario
- [ ] Reportes de conversión por cupón
- [ ] Email cuando cupón está por expirar

---

### 14. Mejoras en Checkout

**Implementar**:
- ✅ Validación de dirección con Google Places API
- ✅ Cálculo de costo de envío por código postal
- ✅ Opción de recoger en tienda física (sin envío)
- ✅ Campo "¿Es un regalo?" con mensaje personalizado
- ✅ Guardar múltiples direcciones de envío
- ✅ Autocompletar dirección si ya está guardada

**Dependencias**:
```bash
npm install @react-google-maps/api
```

**Variables de entorno**:
```env
NEXT_PUBLIC_GOOGLE_MAPS_API_KEY=AIzaSy...
```

**Archivos a modificar**:
- `app/(store)/checkout/page.tsx` - Agregar opciones
- `components/store/checkout-form.tsx` - Extender formulario

---

### 15. Integración con Paqueterías

**Implementar**:
- ✅ API de FedEx/DHL/Estafeta para generar guías automáticamente
- ✅ Cotización de envío en tiempo real
- ✅ Seguimiento automático del paquete
- ✅ Webhooks de actualización de estado de envío
- ✅ Descarga de etiquetas de envío en PDF

**Archivos a crear**:
- `lib/shipping/fedex.ts` - Cliente FedEx
- `lib/shipping/estafeta.ts` - Cliente Estafeta
- `app/api/shipping/quote/route.ts` - Cotización
- `app/api/shipping/create-label/route.ts` - Generar guía

**Variables de entorno**:
```env
FEDEX_API_KEY=...
FEDEX_API_SECRET=...
ESTAFETA_USER=...
ESTAFETA_PASSWORD=...
```

---

### 16. Paginación en Catálogo ✅ COMPLETADO (100%)

**Problema resuelto**: Anteriormente cargaba todos los productos sin límite.

**Implementado**:
- ✅ Paginación completa con navegación (Primera, Anterior, Siguiente, Última)
- ✅ Números de página con ellipsis inteligente (1 ... 5 6 7 ... 20)
- ✅ Selector de productos por página (12, 24, 48)
- ✅ Indicador de rango actual (Mostrando 1 - 24 de 156)
- ✅ Total de productos encontrados
- ✅ Scroll automático al cambiar página
- ✅ Persistencia en URL (page, limit en query params)
- ✅ Reset a página 1 al cambiar filtros/orden
- ✅ Versión responsive (números en desktop, indicador en mobile)
- ✅ Iconos Lucide para navegación

**Archivos creados**:
1. `components/store/pagination.tsx` - Componente de paginación reutilizable:
   * Props: currentPage, totalPages, onPageChange, hasNextPage, hasPrevPage
   * Botones: Primera (<<), Anterior (<), números, Siguiente (>), Última (>>)
   * Lógica de ellipsis: muestra páginas relevantes alrededor de la actual
   * Responsive: números en desktop, "X / Y" en mobile
   * Accesibilidad: aria-labels en todos los botones

**Archivos modificados**:
1. `app/api/products/route.ts` - API con paginación:
   * Nuevos parámetros: `page` (default 1), `limit` (default 24)
   * Cálculo de skip/take para Prisma
   * `prisma.product.count()` para total
   * Respuesta estructurada:
     ```typescript
     {
       products: Product[],
       pagination: {
         page, limit, total, totalPages,
         hasNextPage, hasPrevPage
       }
     }
     ```

2. `app/(store)/catalogo/page.tsx` - Integración completa:
   * Estados nuevos: currentPage, itemsPerPage, pagination
   * Funciones: handlePageChange, handleItemsPerPageChange
   * Fetch incluye page y limit en params
   * UI actualizada:
     - Contador mejorado con rango (Mostrando X - Y de Z)
     - Selector de items por página (antes de ordenamiento)
     - Componente Pagination al final del grid
   * Reset a página 1 cuando cambian filtros u ordenamiento
   * Scroll top smooth al cambiar página

**Características destacadas**:
- 📄 Navegación intuitiva con 4 tipos de botones
- 🔢 Números de página inteligentes (ellipsis cuando hay muchas)
- 📱 Responsive: botones completos en desktop, compacto en mobile
- ⚡ Performance: solo carga productos de la página actual
- 🔗 SEO-friendly: URLs con page y limit
- ♿ Accesible: labels descriptivos, estados disabled claros
- 🎨 Consistente con shadcn/ui design system

**Ejemplos de uso de API**:
```bash
# Primera página, 24 items (default)
GET /api/products?page=1&limit=24

# Página 3, 48 items
GET /api/products?page=3&limit=48

# Con filtros y paginación
GET /api/products?categories=cat1,cat2&page=2&limit=12
```

**Lógica de ellipsis**:
- Siempre muestra primera y última página
- Muestra páginas ±1 de la actual
- Ellipsis (...) cuando hay salto > 1 página
- Ejemplos:
  * Total 5 páginas: [1] [2] [3] [4] [5]
  * Total 20, actual 10: [1] [...] [9] [10] [11] [...] [20]
  * Total 20, actual 2: [1] [2] [3] [...] [20]

**Estado**: ✅ Completado (100%) - Totalmente funcional

---

### 17. Optimizaciones SEO ✅ COMPLETADO (100%)

**Problema**: Los productos y páginas no tenían metadata optimizada para motores de búsqueda, limitando el tráfico orgánico.

**✅ Implementado**:
- ✅ Sitemap XML dinámico (`/sitemap.xml`) con todas las páginas
- ✅ Meta tags dinámicos en productos/categorías (title, description, og:image)
- ✅ Schema.org markup (Product, Offer, Review, BreadcrumbList)
- ✅ Open Graph tags para compartir en redes sociales
- ✅ Twitter Card metadata
- ✅ Robots.txt optimizado con reglas específicas
- ✅ Metadata por producto con precio, stock y ratings
- ✅ Helpers reutilizables para generar JSON-LD
- ✅ Integración con ISR (revalidación cada 60s)
- ✅ Breadcrumb navigation estructurada

**Archivos creados**:
1. `app/sitemap.ts` - Sitemap dinámico Next.js 14 (93 líneas):
   * Query Prisma de productos activos y categorías
   * URLs estáticas: home, catálogo, mayoreo, nosotros, contacto
   * URLs dinámicas: productos (priority 0.8) + categorías (priority 0.7)
   * lastModified basado en updatedAt del producto
   * Error handling: fallback a URLs estáticas si falla DB
   * baseUrl configurable vía NEXTAUTH_URL

2. `app/robots.ts` - Robots.txt optimizado (44 líneas):
   * Regla general: allow catálogo/categoría/mayoreo/nosotros/contacto
   * Bloqueo: /admin, /api, /mi-cuenta, /carrito, /checkout, /_next
   * Regla específica para Googlebot
   * Referencia a sitemap.xml

3. `lib/seo.ts` - Helpers SEO completos (282 líneas):
   * `generateProductJsonLd()`: Schema.org Product con Offer
   * Soporte para aggregateRating (promedio + count de reseñas)
   * Soporte para oferta de mayoreo (eligibleQuantity)
   * `generateBreadcrumbJsonLd()`: Navegación estructurada
   * `generateOrganizationJsonLd()`: Info de la empresa
   * `generateOgMetadata()`: Open Graph + Twitter Card
   * `generateProductMetadata()`: Metadata completa de producto
   * `generateCatalogMetadata()`: Metadata para listados

4. `app/(store)/catalogo/layout.tsx` - Layout con metadata estática (11 líneas):
   * Metadata optimizada para catálogo
   * Descripción SEO-friendly
   * Reutiliza generateCatalogMetadata()

**Archivos modificados**:
1. `app/(store)/catalogo/[slug]/page.tsx` - Producto con SEO completo:
   * Función `generateMetadata()` exportada
   * Query incluye reviews aprobadas para aggregateRating
   * Conversión Decimal → Number para JSON-LD
   * Script JSON-LD de Product incrustado en página
   * Script JSON-LD de Breadcrumb
   * Type assertion para compatibilidad con Prisma types

**Características destacadas**:
- 🎯 **SEO-First**: Metadata completa en todas las páginas
- 📊 **Schema.org**: Google Rich Results (estrellas, precio, stock)
- 🌐 **Social Ready**: OG tags para Facebook/Twitter/LinkedIn
- 🤖 **Bot-Friendly**: Robots.txt optimizado + sitemap XML
- 💰 **Price Display**: Precio menudeo + mayoreo en metadata
- ⭐ **Reviews**: Aggregate rating visible en SERP
- 🍞 **Breadcrumbs**: Navegación estructurada (Home → Catálogo → Categoría → Producto)
- 📱 **Mobile Optimized**: OG images 1200x630px
- 🔄 **Dynamic**: Sitemap actualiza automáticamente con nuevos productos
- 🚀 **Performance**: ISR con revalidación 60s

**Schema.org implementados**:
```json
{
  "@type": "Product",
  "name": "Charamuscas Colores",
  "price": "12.50",
  "priceCurrency": "MXN",
  "availability": "InStock",
  "aggregateRating": {
    "ratingValue": "4.5",
    "reviewCount": "23"
  },
  "offers": [{
    "name": "Precio Mayoreo",
    "price": "10.00",
    "eligibleQuantity": { "minValue": 24 }
  }]
}
```

**Metadata ejemplo**:
```html
<title>Charamuscas Colores - Dulcería Online</title>
<meta name="description" content="Compra Charamuscas Colores en Dulcería Online. Precio menudeo $12.50 MXN | Mayoreo $10.00 desde 24 piezas. Envío a todo México." />
<meta property="og:type" content="website" />
<meta property="og:image" content="https://cloudinary.com/.../charamuscas.jpg" />
<meta property="og:locale" content="es_MX" />
<script type="application/ld+json">
  {"@context": "https://schema.org", "@type": "Product", ...}
</script>
```

**URLs accesibles**:
- ✅ `/sitemap.xml` - Sitemap completo con todos los productos
- ✅ `/robots.txt` - Reglas para crawlers

**Validación recomendada**:
```bash
# 1. Verificar sitemap
curl http://localhost:3000/sitemap.xml

# 2. Verificar robots
curl http://localhost:3000/robots.txt

# 3. Google Rich Results Test
https://search.google.com/test/rich-results

# 4. Facebook Sharing Debugger
https://developers.facebook.com/tools/debug/

# 5. Twitter Card Validator
https://cards-dev.twitter.com/validator
```

**Impacto esperado**:
- 📈 +40-60% tráfico orgánico en 3 meses
- ⭐ Rich snippets en Google (estrellas + precio)
- 🔗 Mejor CTR en redes sociales (OG images)
- 🎯 Posicionamiento para keywords de productos
- 💻 Mejor experiencia de compartir enlaces

**Estado**: ✅ COMPLETADO (100%) - SEO totalmente optimizado

---

### 18. Analytics y Tracking

**Implementar**:
- ✅ Google Analytics 4 (GA4)
- ✅ Vercel Analytics (si deployado en Vercel)
- ✅ Facebook Pixel para remarketing
- ✅ Eventos personalizados:
  - `view_item` - Ver producto
  - `add_to_cart` - Agregar al carrito
  - `begin_checkout` - Iniciar checkout
  - `purchase` - Compra completada
- ✅ Heatmaps con Hotjar o Microsoft Clarity

**Dependencias**:
```bash
npm install @vercel/analytics
npm install react-ga4
```

**Variables de entorno**:
```env
NEXT_PUBLIC_GA_MEASUREMENT_ID=G-XXXXXXXXXX
NEXT_PUBLIC_FB_PIXEL_ID=12345678
```

**Archivos a crear**:
- `lib/analytics.ts` - Helpers para tracking
- `components/analytics-scripts.tsx` - Scripts de terceros

**Archivos a modificar**:
- `app/layout.tsx` - Inyectar scripts

---

### 19. Modo Oscuro Completo ✅ COMPLETADO (100%)

**Implementado**:
- ✅ Botón toggle en navbar (sol/luna) con iconos de Lucide
- ✅ Persistencia de preferencia con localStorage (automático en next-themes)
- ✅ Detección automática de preferencia del sistema (defaultTheme="system")
- ✅ Transición suave entre temas (CSS transition)
- ✅ Prevención de flash (mounting check en ThemeToggle)
- ✅ Variables CSS completas para dark mode en globals.css
- ✅ Accesibilidad (aria-label, sr-only)
- ✅ Integración en mobile menu

**Archivos creados**:
1. `components/theme-toggle.tsx` - Botón de toggle con:
   * useTheme hook de next-themes
   * Mounted state para evitar hydration mismatch
   * Iconos: Sun (amarillo) para dark mode, Moon (gris) para light mode
   * Tamaño icon button (9x9)

**Archivos modificados**:
1. `components/providers.tsx` - Agregado ThemeProvider con:
   * attribute="class" para usar Tailwind dark: prefix
   * defaultTheme="system" para detectar preferencia del sistema
   * enableSystem para permitir modo automático
2. `components/store/navbar.tsx` - Integrado ThemeToggle:
   * Desktop: antes del botón de Mi Cuenta
   * Mobile: al final del menú con label "Tema:"

**Dependencias instaladas**:
```bash
npm install next-themes  # ✅ Instalado
```

**Configuración existente**:
- `tailwind.config.ts`: darkMode: "class" ✅ Ya configurado
- `app/globals.css`: Variables CSS para .dark ✅ Ya configuradas

**Características destacadas**:
- 🌓 Toggle suave entre light/dark/system
- 💾 Persistencia automática en localStorage
- 🎨 Colores optimizados para ambos modos
- ⚡ Sin flash al cargar página
- 📱 Funciona en desktop y mobile
- ♿ Completamente accesible
- 🔄 Detección automática de preferencia del sistema
- 🎭 Iconos distintos para cada modo (sun/moon)

**Modo system**:
- Detecta automáticamente la preferencia del OS
- Se actualiza si el usuario cambia el tema del sistema
- Primera vez que entra: usa preferencia del sistema
- Usuario puede override con light/dark manual

**Variables CSS dark mode** (ya en globals.css):
```css
.dark {
  --background: 222.2 84% 4.9%;
  --foreground: 210 40% 98%;
  --primary: 346 77% 60%;
  /* ... todas las variables */
}
```

**Uso en componentes**:
```tsx
// Tailwind classes automáticas
<div className="bg-white dark:bg-gray-900" />
<p className="text-gray-900 dark:text-white" />
```

**Estado**: ✅ Completado (100%) - Totalmente funcional y sin pendientes

---

### 20. Multi-idioma (i18n)

**Implementar**:
- ✅ Traducción a inglés (mercado US/Canadá)
- ✅ Selector de idioma en footer
- ✅ URLs con locale (`/es/catalogo`, `/en/catalog`)
- ✅ Traducción de contenido dinámico (productos, categorías)
- ✅ Detección automática de idioma del navegador

**Dependencias**:
```bash
npm install next-intl
```

**Archivos a crear**:
- `i18n/es.json` - Traducciones español
- `i18n/en.json` - Traducciones inglés
- `middleware.ts` - Actualizar con locale detection

**Schema Prisma** (contenido multiidioma):
```prisma
model Product {
  // ... campos existentes
  nameEn        String?
  descriptionEn String?
}

model Category {
  // ... campos existentes
  nameEn String?
}
```

---

## 📊 Priorización Recomendada

Si el tiempo es limitado, implementar en este orden:

### Sprint 1 - Fundamentos (1-2 semanas)
1. ✅ **Autenticación completa** (login/registro/perfil)
2. ✅ **Pedidos del usuario** (historial y detalle)
3. ✅ **CRUD de categorías** (con API)

### Sprint 2 - UX Crítica (1 semana)
4. ✅ **Búsqueda de productos** (básica con autocomplete)
5. ✅ **Filtros en catálogo** (categoría, precio, ordenamiento)
6. ✅ **Paginación** (básica con anterior/siguiente)

### Sprint 3 - Admin & Operaciones (1-2 semanas)
7. ✅ **Gestión de estados de pedidos** (admin)
8. ✅ **Emails transaccionales** (confirmación de pedido)
9. ✅ **Reportes con datos reales** (ventas, productos)

### Sprint 4 - Features Avanzados (2 semanas)
10. ✅ **Reseñas y calificaciones**
11. ✅ **Cupones de descuento**
12. ✅ **Wishlist / favoritos**

### Sprint 5 - Growth & Optimización (1 semana)
13. ✅ **SEO completo** (sitemap, meta tags, schema.org)
14. ✅ **Analytics** (GA4, eventos)
15. ✅ **Mejoras en checkout** (validación, costo envío)

### Backlog - Nice to Have
16. ⏳ **Integración con paqueterías**
17. ⏳ **Gestión de inventario avanzada**
18. ⏳ **Multi-idioma (i18n)**
19. ⏳ **Modo oscuro**
20. ⏳ **Calculadora mayoreo vs menudeo**

---

## 📦 Dependencias Adicionales Requeridas

```bash
# Autenticación
npm install bcryptjs @types/bcryptjs

# Emails
npm install resend react-email @react-email/components

# Gráficas
npm install recharts date-fns

# Búsqueda
npm install fuse.js # Para fuzzy search en frontend

# Analytics
npm install @vercel/analytics react-ga4

# Temas
npm install next-themes

# i18n
npm install next-intl

# Maps
npm install @react-google-maps/api

# Exportación
npm install papaparse @types/papaparse # CSV
npm install jspdf jspdf-autotable # PDF
```

---

## 🔐 Variables de Entorno Adicionales

```env
# Emails
RESEND_API_KEY=re_...
EMAIL_FROM=noreply@dulceriaonline.com

# Google
NEXT_PUBLIC_GOOGLE_MAPS_API_KEY=AIzaSy...

# Analytics
NEXT_PUBLIC_GA_MEASUREMENT_ID=G-XXXXXXXXXX
NEXT_PUBLIC_FB_PIXEL_ID=12345678

# Paqueterías
FEDEX_API_KEY=...
FEDEX_API_SECRET=...
ESTAFETA_USER=...
ESTAFETA_PASSWORD=...
```

---

## 💡 Notas de Implementación

### Consideraciones de Seguridad
- Validar TODOS los inputs con Zod en API Routes
- Sanitizar búsquedas para evitar SQL injection
- Rate limiting en endpoints públicos (búsqueda, registro)
- CAPTCHA en formularios de registro y recuperación de contraseña
- Headers de seguridad (CSP, HSTS, X-Frame-Options)

### Performance
- Implementar ISR en páginas de productos (ya implementado)
- Cachear resultados de búsqueda en Redis (opcional)
- Lazy loading de imágenes (ya con next/image)
- Code splitting por ruta (ya con App Router)
- Comprimir responses con gzip/brotli

### Testing
- Tests unitarios para funciones críticas (cálculo de precios, descuentos)
- Tests de integración para API Routes
- Tests E2E para flujos críticos (checkout, pago)
- Usar Jest + React Testing Library + Playwright

### Monitoreo
- Logs estructurados con Winston o Pino
- Error tracking con Sentry
- Uptime monitoring con Better Uptime o Checkly
- Performance monitoring con Vercel Speed Insights

---

## 📅 Última Actualización

**Fecha**: 30 de Marzo, 2026  
**Versión actual**: 1.1.0  
**Features completadas**: 10/40 (25%)  
**Features críticas pendientes**: 4

---

## 🤝 Contribuciones

Para implementar cualquiera de estas features:

1. Crear branch desde `main`: `git checkout -b feature/nombre-feature`
2. Implementar la funcionalidad siguiendo las convenciones del proyecto
3. Agregar tests si aplica
4. Actualizar este documento marcando como completado: `[x]`
5. Crear Pull Request con descripción detallada

---

_Este roadmap es un documento vivo y se actualiza conforme se implementan nuevas features._
