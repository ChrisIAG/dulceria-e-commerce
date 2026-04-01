# Sistema de Diseño - Panel Administrativo

Guía de diseño unificado para mantener consistencia visual en todo el panel de administración.

## 📐 Principios de Diseño

### 1. **Fondo Principal**
- Fondo de página: `bg-gray-50`
- Todas las cards: `bg-white`
- Sin fondos oscuros (negro, slate-900, etc.)

### 2. **Espaciado y Estructura**
```tsx
<div className="space-y-8">
  {/* Contenido de la página */}
</div>
```

---

## 🎨 Componentes Estándar

### Headers de Página
```tsx
<div className="flex items-center justify-between">
  <div>
    <h2 className="text-3xl font-bold text-gray-900">Título</h2>
    <p className="text-gray-600 mt-1">Descripción breve</p>
  </div>
  <Button>
    <Plus className="mr-2 h-4 w-4" />
    Acción Principal
  </Button>
</div>
```

### Cards de Contenido
```tsx
<Card className="bg-white border-gray-200 shadow-sm">
  <CardHeader>
    <CardTitle className="text-gray-900">Título de la Card</CardTitle>
  </CardHeader>
  <CardContent>
    {/* Contenido */}
  </CardContent>
</Card>
```

### Cards de Estadísticas
```tsx
<Card className="bg-white border-gray-200 shadow-sm hover:shadow-md transition-shadow">
  <CardHeader className="flex flex-row items-center justify-between pb-2">
    <CardTitle className="text-sm font-medium text-gray-600">
      Título de Métrica
    </CardTitle>
    <div className="h-10 w-10 rounded-full bg-{color}-100 flex items-center justify-center">
      <Icon className="h-5 w-5 text-{color}-600" />
    </div>
  </CardHeader>
  <CardContent>
    <div className="text-3xl font-bold text-gray-900">
      {valor}
    </div>
    <p className="text-xs text-gray-500 mt-1">
      Descripción opcional
    </p>
  </CardContent>
</Card>
```

---

## 🎨 Paleta de Colores

### Colores de Iconos en Estadísticas
Cada tipo de métrica tiene su color asociado:

| Métrica | Color | Uso |
|---------|-------|-----|
| **Ventas / Ingresos** | `emerald` (verde) | `bg-emerald-100`, `text-emerald-600` |
| **Pedidos / Órdenes** | `blue` (azul) | `bg-blue-100`, `text-blue-600` |
| **Productos / Inventario** | `violet` (violeta) | `bg-violet-100`, `text-violet-600` |
| **Clientes / Usuarios** | `amber` (ámbar) | `bg-amber-100`, `text-amber-600` |
| **Análisis / Reportes** | `violet` (violeta) | `bg-violet-100`, `text-violet-600` |

### Colores de Estado (Badges)

#### Badges Sutiles (Recomendado)
```tsx
{/* Activo / Éxito */}
<Badge className="bg-emerald-100 text-emerald-700 hover:bg-emerald-200 border-emerald-300">
  Activo
</Badge>

{/* Advertencia / Expirado */}
<Badge className="bg-amber-100 text-amber-700 hover:bg-amber-200 border-amber-300">
  Expirado
</Badge>

{/* Información / Programado */}
<Badge className="bg-blue-100 text-blue-700 hover:bg-blue-200 border-blue-300">
  Programado
</Badge>

{/* Neutral / Inactivo */}
<Badge className="bg-gray-100 text-gray-700 hover:bg-gray-200 border-gray-300">
  Inactivo
</Badge>
```

### Texto y Tipografía

| Elemento | Clase |
|----------|-------|
| Título principal (H1) | `text-3xl font-bold text-gray-900` |
| Subtítulo / Descripción | `text-gray-600` |
| Título de card | `text-gray-900` |
| Label / Etiqueta | `text-sm font-medium text-gray-600` |
| Texto secundario | `text-xs text-gray-500` |
| Valores / Métricas | `text-3xl font-bold text-gray-900` |

---

## 📊 Indicadores de Rendimiento

### Tendencias (Crecimiento/Decrecimiento)
```tsx
<p className="text-xs text-gray-500 flex items-center gap-1 mt-1">
  {isPositive ? (
    <TrendingUp className="h-3 w-3 text-emerald-600" />
  ) : (
    <TrendingDown className="h-3 w-3 text-red-600" />
  )}
  <span className={isPositive ? 'text-emerald-600 font-medium' : 'text-red-600 font-medium'}>
    {percentage}%
  </span>
  <span className="text-gray-500">vs período anterior</span>
</p>
```

---

## 🔲 Sidebar (Navegación)

```tsx
<aside className="w-64 bg-white border-r border-gray-200">
  <div className="flex h-16 items-center border-b border-gray-200 px-6">
    <Link href="/admin" className="text-xl font-bold text-gray-900">
      Admin Panel
    </Link>
  </div>
  <nav className="space-y-1 p-4">
    <Link
      href="/admin/seccion"
      className="flex items-center space-x-3 rounded-lg px-3 py-2 text-gray-700 hover:bg-blue-50 hover:text-blue-700 transition-colors"
    >
      <Icon className="h-5 w-5" />
      <span className="font-medium">Sección</span>
    </Link>
  </nav>
</aside>
```

---

## 📋 Ejemplos por Página

### Dashboard (Home)
- **4 Cards de métricas**: Ventas (emerald), Pedidos (blue), Productos (violet), Clientes (amber)  
- **Card de pedidos recientes**: Lista simple con bordes entre items

### Cupones
- **3 Cards de estadísticas**: Activos (blue), Expirados (amber), Usos Totales (emerald)
- **Tabla con badges**: Estados con colores sutiles (fondos claros con texto oscuro)

### Promociones
- **3 Cards de métricas**: Total (violet), Activas (emerald), Próximas (blue)
- **Tabla de promociones**: Card blanca con lista

### Productos
- **Card con listado**: Items con imagen, nombre, precio y acciones

### Categorías
- **Grid de cards**: 3 columnas en desktop, cada categoría en card individual

### Reportes
- **4 Métricas principales**: Ventas (emerald), Pedidos (blue), Ticket Promedio (violet), Productos Activos (amber)
- **Gráfica**: Card blanca con título
- **2 Columnas**: Top productos + Bajo stock

---

## ✅ Checklist de Consistencia

Antes de crear una nueva vista o componente, verifica:

- ✅ Fondo de página es `bg-gray-50`
- ✅ Todas las cards tienen `bg-white border-gray-200 shadow-sm`
- ✅ Títulos principales usan `text-3xl font-bold text-gray-900`
- ✅ Iconos en estadísticas están dentro de círculos de color (`h-10 w-10 rounded-full bg-{color}-100`)
- ✅ Números grandes usan `text-3xl font-bold text-gray-900`
- ✅ No hay fondos negros, slate-900, o fondos de colores sólidos en las cards principales
- ✅ Badges usan fondos claros (bg-{color}-100) con texto oscuro (text-{color}-700)
- ✅ Hover states incluyen `hover:shadow-md transition-shadow` en cards interactivas

---

## 🚫 Evitar

❌ Fondos oscuros en cards (bg-black, bg-slate-900, bg-gray-900)  
❌ Cards sin `bg-white` explícito  
❌ Badges con fondos sólidos oscuros (bg-green-600 text-white) - usar versiones sutiles  
❌ Iconos sin contenedor circular en estadísticas  
❌ Títulos sin especificar `text-gray-900`  
❌ Texto secundario sin `text-gray-500` o `text-gray-600`  

---

## 📱 Responsive

- Grids de métricas: `grid gap-4 md:grid-cols-2 lg:grid-cols-4`
- Grids de contenido: `grid gap-4 md:grid-cols-2 lg:grid-cols-3`
- Sidebar: Fija en desktop, colapsable en mobile (por implementar)

---

**Última actualización**: 31 de Marzo, 2026  
**Versión**: 1.0
