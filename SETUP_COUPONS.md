# Setup: Sistema de Cupones de Descuento

## 📝 Descripción
Sistema completo de cupones promocionales con validación avanzada, administración y aplicación en checkout.

---

## 🔧 Configuración Inicial

### 1. Instalar Componentes shadcn/ui

```powershell
# Dropdown Menu (para acciones de cupones)
npx shadcn@latest add dropdown-menu

# Si aún no están instalados:
npx shadcn@latest add dialog
npx shadcn@latest add select
npx shadcn@latest add switch
```

### 2. Generar Cliente de Prisma

El modelo `Coupon` ya fue agregado al schema. Debes generar los tipos:

```powershell
# Detener el servidor de desarrollo si está corriendo
# Ctrl + C en la terminal del servidor

# Generar tipos de Prisma
npx prisma generate

# Opcional: Crear migración para la base de datos
npx prisma migrate dev --name add_coupons

# Reiniciar el servidor
npm run dev
```

**⚠️ Importante - Variable DIRECT_URL**: 
Si obtienes error `Environment variable not found: DIRECT_URL`, agrega esta variable a tu archivo `.env`:

```env
# En .env (desarrollo local)
# IMPORTANTE: Prisma lee .env (no .env.local), así que necesitas las credenciales aquí
DATABASE_URL="postgresql://usuario:password@localhost:5432/dulceria_db"
DIRECT_URL="postgresql://usuario:password@localhost:5432/dulceria_db"

# En producción con Supabase (ejemplo)
DATABASE_URL="postgresql://postgres.PROJECT:PASSWORD@aws-1-us-east-2.pooler.supabase.com:6543/postgres?pgbouncer=true"
DIRECT_URL="postgresql://postgres:PASSWORD@db.PROJECT.supabase.co:5432/postgres"
```

**📌 Nota sobre .env vs .env.local:**
- **Prisma** (migraciones): Lee `.env` por defecto
- **Next.js** (runtime): Prioriza `.env.local` sobre `.env`
- **Solución**: Mantén las credenciales de BD en ambos archivos o copia de `.env.local` a `.env`

La `DIRECT_URL` es necesaria para migraciones ya que evita el connection pooler.

**⚠️ Nota sobre EPERM**: Si obtienes error EPERM al ejecutar `npx prisma generate`:
1. Detén el servidor de desarrollo (`Ctrl + C`)
2. Cierra VSCode si es necesario
3. Ejecuta `npx prisma generate` nuevamente
4. Reinicia el servidor con `npm run dev`

---

## 📦 Archivos Creados

### API Routes

1. **`app/api/coupons/validate/route.ts`**
   - POST: Validar un cupón antes de aplicarlo
   - Validaciones: activo, fechas, usos máximos, compra mínima
   - Retorna: discount amount calculado

2. **`app/api/admin/coupons/route.ts`**
   - GET: Listar cupones con filtros (activos/expirados/todos)
   - POST: Crear nuevo cupón con validaciones

3. **`app/api/admin/coupons/[id]/route.ts`**
   - GET: Detalles de un cupón con últimos pedidos
   - PUT: Actualizar cupón (no se puede cambiar código)
   - DELETE: Desactivar cupón (soft delete)

### Componentes de Administración

4. **`components/admin/create-coupon-dialog.tsx`**
   - Dialog para crear cupones nuevos
   - Formulario con todos los campos
   - Validaciones en tiempo real

5. **`components/admin/edit-coupon-dialog.tsx`**
   - Dialog para editar cupones existentes
   - No permite cambiar código (solo otros campos)
   - Muestra contador de usos actuales

6. **`components/admin/coupon-actions.tsx`**
   - Dropdown menu con acciones (Editar, Desactivar)
   - Integra diálogos de edición y confirmación

7. **`components/admin/coupon-filters.tsx`**
   - Filtros para ver: Todos / Activos / Expirados
   - Actualiza URL con query params

### Componentes de Tienda

8. **`components/store/coupon-input.tsx`**
   - Input para ingresar código de cupón
   - Validación en tiempo real con API
   - Muestra cupón aplicado con opción de remover
   - Estados: loading, error, success

### Páginas

9. **`app/(admin)/admin/cupones/page.tsx`**
   - Panel completo de gestión de cupones
   - Tabla con todos los cupones
   - Estadísticas: activos, expirados, usos totales
   - Filtros y acciones en cada fila

---

## 🔍 Validaciones Implementadas

### Validación de Cupón (API)

- ✅ **Existencia**: Código existe en BD (case-insensitive)
- ✅ **Estado**: Cupón activo (`active = true`)
- ✅ **Fechas**: Fecha actual entre `startDate` y `endDate`
- ✅ **Usos**: `usedCount < maxUses` (si maxUses no es null)
- ✅ **Compra mínima**: `subtotal >= minPurchase` (si minPurchase no es null)
- ✅ **Cálculo**: 
  - PERCENTAGE: `(subtotal * discountValue) / 100`
  - FIXED: `discountValue`
  - Límite: descuento nunca excede el subtotal

### Validación en Creación (Admin)

- ✅ **Código**: 3-20 caracteres, solo A-Z, 0-9, -, _ (mayúsculas)
- ✅ **Único**: No puede existir otro cupón con el mismo código
- ✅ **Porcentaje**: Si tipo es PERCENTAGE, valor máximo 100%
- ✅ **Fechas**: `endDate > startDate`
- ✅ **Valores**: discountValue > 0, maxUses > 0, minPurchase >= 0

---

## 🎨 Características Destacadas

### Panel de Administración

1. **Tabla Completa**
   - Código (font-mono para legibilidad)
   - Tipo de descuento con badge
   - Valor del descuento formateado
   - Contador de usos (X / max o X / ∞)
   - Compra mínima
   - Rango de fechas (inicio y fin)
   - Estado visual con badges de colores:
     - 🟢 Verde: Activo
     - 🔴 Rojo: Expirado
     - ⚫ Gris: Inactivo o límite alcanzado
     - ⚪ Blanco: Programado (aún no inicia)

2. **Estadísticas en Tiempo Real**
   - Cupones activos
   - Cupones expirados
   - Total de usos acumulados

3. **Filtros**
   - Ver todos
   - Solo activos
   - Solo expirados

4. **Diálogos**
   - Crear: Formulario completo con validaciones
   - Editar: Todos los campos excepto código
   - Eliminar: Confirmación antes de desactivar

### Componente de Cliente

1. **CouponInput**
   - Input uppercase automático
   - Enter para aplicar
   - Loading state durante validación
   - Mensajes de error claros
   - Vista de cupón aplicado:
     - Código
     - Tipo y valor del descuento
     - Monto descontado
     - Botón para remover
   - Fondo verde cuando está aplicado

---

## 🧪 Cómo Probar

### 1. Crear Cupón desde Admin

```
1. Ir a /admin/cupones
2. Clic en "Crear Cupón"
3. Llenar formulario:
   - Código: VERANO2024
   - Tipo: Porcentaje
   - Valor: 15
   - Fecha inicio: hoy
   - Fecha fin: +30 días
   - Activo: Sí
4. Guardar
```

### 2. Aplicar Cupón en Checkout

```typescript
// En el componente de carrito o checkout
import { CouponInput } from '@/components/store/coupon-input';

const [coupon, setCoupon] = useState(null);
const [subtotal, setSubtotal] = useState(500); // ejemplo

// Callback cuando se aplica cupón
const handleCouponApplied = (appliedCoupon) => {
  setCoupon(appliedCoupon);
  // Recalcular total con descuento
  const newTotal = subtotal - appliedCoupon.discountAmount;
};

// Callback cuando se remueve
const handleCouponRemoved = () => {
  setCoupon(null);
  // Recalcular total sin descuento
};

// Usar en JSX
<CouponInput
  subtotal={subtotal}
  onCouponApplied={handleCouponApplied}
  onCouponRemoved={handleCouponRemoved}
  appliedCoupon={coupon}
/>
```

### 3. Integrar en Proceso de Orden

```typescript
// Al crear orden, incluir couponId
const orderData = {
  // ... otros campos
  couponId: coupon?.id || null, // ID del cupón aplicado
  discount: coupon?.discountAmount || 0,
  total: subtotal - (coupon?.discountAmount || 0),
};

await fetch('/api/orders', {
  method: 'POST',
  body: JSON.stringify(orderData),
});
```

### 4. Registrar Uso del Cupón

**Opción A**: En el API de creación de orden:

```typescript
// app/api/orders/route.ts
if (couponId) {
  // Incrementar usedCount
  await prisma.coupon.update({
    where: { id: couponId },
    data: { usedCount: { increment: 1 } },
  });
}
```

**Opción B**: Usar transacción para asegurar atomicidad:

```typescript
await prisma.$transaction(async (tx) => {
  // Crear orden
  const order = await tx.order.create({
    data: { ...orderData, couponId },
  });

  // Incrementar uso del cupón
  if (couponId) {
    await tx.coupon.update({
      where: { id: couponId },
      data: { usedCount: { increment: 1 } },
    });
  }

  return order;
});
```

---

## 🔐 Permisos

- **Validar cupón** (`/api/coupons/validate`): Público (no requiere autenticación)
- **Admin endpoints** (`/api/admin/coupons/**`): Solo rol `ADMIN`
- **Página admin** (`/admin/cupones`): Solo rol `ADMIN`

---

## 🚨 Troubleshooting

### Error: Property 'coupon' does not exist on type 'PrismaClient'

**Causa**: Tipos de Prisma no generados después de agregar el modelo.

**Solución**:
```powershell
npx prisma generate
```

### Error: Cannot find module '@/components/ui/dropdown-menu'

**Causa**: Componente shadcn no instalado.

**Solución**:
```powershell
npx shadcn@latest add dropdown-menu
```

### Cupón no se aplica (error 404)

**Causa**: Código no existe o tiene mayúsculas/minúsculas diferentes.

**Solución**: La búsqueda es case-insensitive, pero asegúrate de que el código exista.

### Descuento calculado incorrectamente

**Causa**: Tipo de descuento no coincide con el valor.

**Verificar**: 
- PERCENTAGE debe estar entre 0-100
- FIXED es monto exacto en pesos

---

## 📊 Modelo de Datos

```prisma
model Coupon {
  id            String       @id @default(cuid())
  code          String       @unique   // Código del cupón (ej: VERANO2024)
  discountType  DiscountType           // PERCENTAGE o FIXED
  discountValue Float                  // 15 (%) o 100 ($)
  maxUses       Int?                   // null = ilimitado
  usedCount     Int          @default(0)
  minPurchase   Float?                 // compra mínima requerida
  startDate     DateTime               // cuándo comienza a ser válido
  endDate       DateTime               // cuándo expira
  active        Boolean      @default(true)
  createdAt     DateTime     @default(now())
  orders        Order[]                // relación con pedidos
  @@map("coupons")
}

enum DiscountType {
  PERCENTAGE  // Porcentaje (1-100)
  FIXED       // Monto fijo en MXN
}

// En Order model:
model Order {
  // ... otros campos
  couponId   String?
  discount   Float    @default(0)
  coupon     Coupon?  @relation(fields: [couponId], references: [id])
}
```

---

## ✅ Checklist de Integración

- [ ] Instalar componentes shadcn (dropdown-menu, dialog, select, switch)
- [ ] Ejecutar `npx prisma generate`
- [ ] Ejecutar `npx prisma migrate dev --name add_coupons`
- [ ] Crear cupón de prueba desde /admin/cupones
- [ ] Integrar `CouponInput` en página de carrito
- [ ] Actualizar lógica de creación de orden para incluir `couponId`
- [ ] Implementar incremento de `usedCount` al confirmar orden
- [ ] Probar escenarios:
  - [ ] Cupón válido
  - [ ] Cupón expirado
  - [ ] Cupón con límite de usos alcanzado
  - [ ] Cupón con compra mínima no cumplida
  - [ ] Cupón inactivo
  - [ ] Cupón no existe

---

## 🎯 Próximos Pasos

1. **Integrar en carrito/checkout**: Agregar `CouponInput` y lógica de descuento
2. **Dashboard de cupones**: Agregar gráficas de uso por cupón
3. **Reportes**: Métricas de conversión por cupones
4. **Notificaciones**: Email cuando un cupón está por expirar
5. **Cupones personalizados**: Generar cupones únicos por usuario
6. **Restricciones avanzadas**: Cupones por categoría, producto, o cliente específico

---

## 📝 Notas Finales

- Los cupones usan **soft delete** (campo `active`) para mantener historial
- El código del cupón **no se puede cambiar** una vez creado
- Los descuentos **nunca exceden el subtotal** (tope en 100%)
- La validación de fechas usa la zona horaria del servidor
- Se recomienda usar **transacciones** al aplicar cupones en órdenes para evitar condiciones de carrera
