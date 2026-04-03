# 📊 Configuración de Analytics - GA4, Facebook Pixel & Microsoft Clarity

## Resumen de Implementación

Se ha implementado un sistema completo de analytics con tracking de eventos de e-commerce para:
- ✅ **Google Analytics 4 (GA4)** - Analytics principal con eventos de e-commerce
- ✅ **Facebook Pixel** (opcional) - Remarketing en Facebook/Instagram
- ✅ **Microsoft Clarity** (opcional) - Heatmaps y grabaciones de sesión (GRATIS)

---

## 🎯 Eventos Rastreados

### E-commerce Events (GA4)
| Evento | Descripción | Ubicación |
|--------|-------------|-----------|
| `page_view` | Vista de página (automático) | Todas las páginas |
| `view_item` | Vista de producto | Página de producto `/catalogo/[slug]` |
| `add_to_cart` | Agregar al carrito | Botón "Agregar al carrito" |
| `remove_from_cart` | Quitar del carrito | Botón "Eliminar" en carrito |
| `view_cart` | Ver carrito | Página `/carrito` |
| `begin_checkout` | Iniciar checkout | Página `/checkout` |
| `apply_coupon` | Aplicar cupón | Input de cupón en checkout |
| `purchase` | Compra completada | Página `/confirmacion` (después de Stripe) |
| `search` | Búsqueda de productos | Barra de búsqueda |
| `add_to_wishlist` | Agregar a favoritos | Botón de corazón en productos |
| `sign_up` | Registro de usuario | Página `/registro` |
| `login` | Inicio de sesión | Página `/login` |

---

## 🔧 Configuración Paso a Paso

### 1. Google Analytics 4 (OBLIGATORIO)

#### Crear Propiedad GA4
1. Ve a [Google Analytics](https://analytics.google.com/)
2. Click en **Admin** (⚙️ abajo a la izquierda)
3. Click en **Crear propiedad**
4. Nombre: `Dulcería E-commerce` (o el que prefieras)
5. Zona horaria: `Mexico City (GMT-6)`
6. Moneda: `Peso mexicano (MXN)`
7. Click en **Siguiente** → **Crear**

#### Obtener Measurement ID
1. En la nueva propiedad, ve a **Admin** → **Flujos de datos**
2. Click en **Añadir flujo** → **Web**
3. URL del sitio web: tu dominio de producción (ej: `https://tudominio.com`)
4. Nombre del flujo: `Web - Producción`
5. Click en **Crear flujo**
6. **Copia el Measurement ID** (formato: `G-XXXXXXXXXX`)

#### Configurar en tu Proyecto
```bash
# .env.local
NEXT_PUBLIC_GA_MEASUREMENT_ID="G-XXXXXXXXXX"  # Reemplaza con tu ID real
```

---

### 2. Facebook Pixel (OPCIONAL - Remarketing)

#### Crear Facebook Pixel
1. Ve a [Facebook Events Manager](https://business.facebook.com/events_manager)
2. Click en **Conectar orígenes de datos** → **Web** → **Facebook Pixel**
3. Nombre: `Dulcería E-commerce`
4. URL del sitio: tu dominio
5. Click en **Crear pixel**
6. **Copia el Pixel ID** (número de 15-16 dígitos)

#### Configurar en tu Proyecto
```bash
# .env.local
NEXT_PUBLIC_FB_PIXEL_ID="1234567890123456"  # Reemplaza con tu Pixel ID
```

---

### 3. Microsoft Clarity (OPCIONAL - Heatmaps y Sesiones GRATIS)

#### Crear Proyecto en Clarity
1. Ve a [Microsoft Clarity](https://clarity.microsoft.com/)
2. Click en **Agregar nuevo proyecto**
3. Nombre: `Dulcería E-commerce`
4. URL del sitio: tu dominio
5. Click en **Agregar**
6. **Copia el Project ID** (formato: alfanumérico, ej: `abcd1234efgh5678`)

#### Configurar en tu Proyecto
```bash
# .env.local
NEXT_PUBLIC_CLARITY_ID="abcd1234efgh5678"  # Reemplaza con tu Project ID
```

---

## ✅ Verificar que Funciona

### Desarrollo Local

1. **Inicia el servidor de desarrollo**:
```bash
npm run dev
```

2. **Abre la consola del navegador** (F12)

3. **Verás mensajes de analytics** si está configurado:
```
[GA4] Page view: /catalogo/chocolates
[GA4] Event: view_item
[GA4] Event: add_to_cart
```

### Producción (Testing)

#### Google Analytics 4
1. Ve a [**Realtime**](https://analytics.google.com/) en GA4
2. Navega por tu sitio en otra pestaña
3. Deberías ver eventos en tiempo real en GA4

#### Facebook Pixel
1. Instala [**Facebook Pixel Helper**](https://chrome.google.com/webstore/detail/facebook-pixel-helper/) (extensión Chrome)
2. Visita tu sitio
3. Click en el icono de la extensión → debería mostrar eventos detectados

#### Microsoft Clarity
1. Ve a tu proyecto en [Clarity Dashboard](https://clarity.microsoft.com/)
2. Ve a la sección **Recordings**
3. Espera unos minutos → deberías ver grabaciones de tus sesiones

---

## 🧪 Testing Manual de Eventos

### Flujo Completo de Compra (Test E2E)

1. **Visita la home** → `page_view`
2. **Busca "chocolate"** → `search`
3. **Click en un producto** → `view_item`
4. **Agregar a favoritos** → `add_to_wishlist`
5. **Agregar al carrito (2 unidades)** → `add_to_cart`
6. **Ir al carrito** → `view_cart`
7. **Eliminar 1 unidad** → `remove_from_cart`
8. **Click en "Proceder al pago"** → `begin_checkout`
9. **Aplicar cupón** → `apply_coupon`
10. **Completar pago en Stripe** → `purchase` (en página de confirmación)

### Flujo de Autenticación

1. **Crear cuenta** → `sign_up`
2. **Auto-login** → `login`
3. **Cerrar sesión**
4. **Entrar de nuevo** → `login`

---

## 📈 Métricas Clave en GA4

Una vez configurado, podrás ver en GA4:

### Reportes Recomendados
1. **Informes → E-commerce**:
   - Visualización de productos
   - Productos agregados al carrito
   - Tasa de conversión de checkout
   - Ingresos totales
   - Productos más comprados

2. **Informes → Engagement**:
   - Búsquedas populares
   - Productos más vistos
   - Cupones más usados

3. **Informes → User Acquisition**:
   - Canales de adquisición (Orgánico, Directo, Social, etc.)
   - Tasa de registro de usuarios

---

## 🔍 Debugging

### No se Rastrean Eventos

**Revisa la consola del navegador**:
- Si ves `[GA4] ...` → Analytics está funcionando
- Si ves `GA not available` → Verifica NEXT_PUBLIC_GA_MEASUREMENT_ID en .env.local

**Verifica que las variables de entorno estén configuradas**:
```bash
# Asegúrate de que las variables empiecen con NEXT_PUBLIC_
NEXT_PUBLIC_GA_MEASUREMENT_ID="G-XXXXXXXXXX"
```

**Reinicia el servidor después de cambiar .env.local**:
```bash
# Ctrl+C para detener
npm run dev
```

### Los Eventos No Aparecen en GA4

- **Espera 24-48 horas** para reportes completos (Realtime es instantáneo)
- Verifica que el **Measurement ID sea correcto**
- Verifica que el **dominio en GA4** coincida con tu dominio de producción
- Revisa **Realtime** en GA4 en lugar de reportes históricos

### Facebook Pixel No Carga

- Verifica que **NEXT_PUBLIC_FB_PIXEL_ID** esté configurado
- Algunos bloqueadores de ads pueden bloquear Facebook Pixel
- Usa **Facebook Pixel Helper** para debugging

---

## 🚀 Próximos Pasos

1. **Configura GA4** (mínimo requerido)
2. **Opcional**: Configura Facebook Pixel si usarás remarketing
3. **Opcional**: Configura Microsoft Clarity para ver sesiones de usuarios
4. **Realiza compras de prueba** para verificar el flujo completo
5. **Espera 7 días** para tener datos significativos en GA4
6. **Crea conversiones personalizadas** en GA4 (ej: "Compra > $500 MXN")
7. **Configura alertas** para caídas en conversiones o errores

---

## 📚 Recursos

- [Documentación de GA4](https://support.google.com/analytics/answer/9304153)
- [Eventos de E-commerce en GA4](https://developers.google.com/analytics/devguides/collection/ga4/ecommerce)
- [Facebook Pixel Documentation](https://developers.facebook.com/docs/meta-pixel)
- [Microsoft Clarity Help](https://learn.microsoft.com/en-us/clarity/)

---

## ⚠️ Notas Importantes

1. **Solo GA4 trackea eventos de e-commerce completos** (Facebook y Clarity son para remarketing/UX)
2. **Las variables deben empezar con `NEXT_PUBLIC_`** para funcionar en el cliente
3. **Reinicia el servidor** después de modificar .env.local
4. **Los eventos se envían solo en producción** (algunos pueden no funcionar en localhost dependiendo de la configuración)
5. **Realtime en GA4** es tu mejor herramienta para verificar que funciona

---

¡Listo! 🎉 Tu e-commerce ahora tiene analytics completo para medir conversiones, comportamiento de usuarios y ROI de marketing.
