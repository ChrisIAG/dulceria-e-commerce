import { prisma } from '@/lib/prisma';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Package, ShoppingCart, DollarSign, Users } from 'lucide-react';
import { formatPrice } from '@/lib/utils';

export const dynamic = 'force-dynamic';

export default async function AdminDashboard() {
  // Obtener métricas
  const [productsCount, ordersCount, totalRevenue, customers] = await Promise.all([
    prisma.product.count(),
    prisma.order.count(),
    prisma.order.aggregate({
      _sum: {
        total: true,
      },
      where: {
        status: 'PAID',
      },
    }),
    prisma.user.count({ where: { role: 'CUSTOMER' } }),
  ]);

  // Órdenes recientes
  const recentOrders = await prisma.order.findMany({
    take: 10,
    orderBy: { createdAt: 'desc' },
    include: {
      items: true,
    },
  });

  return (
    <div className="space-y-8">
      <div>
        <h2 className="text-3xl font-bold text-gray-900">Dashboard</h2>
        <p className="text-gray-600">Vista general de tu negocio</p>
      </div>

      {/* Métricas */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card className="bg-white border-gray-200 shadow-sm hover:shadow-md transition-shadow">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-gray-600">Total de Ventas</CardTitle>
            <div className="h-10 w-10 rounded-full bg-emerald-100 flex items-center justify-center">
              <DollarSign className="h-5 w-5 text-emerald-600" />
            </div>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-gray-900">
              {formatPrice(Number(totalRevenue._sum.total || 0))}
            </div>
            <p className="text-xs text-gray-500 mt-1">Pedidos pagados</p>
          </CardContent>
        </Card>

        <Card className="bg-white border-gray-200 shadow-sm hover:shadow-md transition-shadow">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-gray-600">Pedidos</CardTitle>
            <div className="h-10 w-10 rounded-full bg-blue-100 flex items-center justify-center">
              <ShoppingCart className="h-5 w-5 text-blue-600" />
            </div>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-gray-900">{ordersCount}</div>
            <p className="text-xs text-gray-500 mt-1">Órdenes totales</p>
          </CardContent>
        </Card>

        <Card className="bg-white border-gray-200 shadow-sm hover:shadow-md transition-shadow">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-gray-600">Productos</CardTitle>
            <div className="h-10 w-10 rounded-full bg-violet-100 flex items-center justify-center">
              <Package className="h-5 w-5 text-violet-600" />
            </div>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-gray-900">{productsCount}</div>
            <p className="text-xs text-gray-500 mt-1">En catálogo</p>
          </CardContent>
        </Card>

        <Card className="bg-white border-gray-200 shadow-sm hover:shadow-md transition-shadow">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-gray-600">Clientes</CardTitle>
            <div className="h-10 w-10 rounded-full bg-amber-100 flex items-center justify-center">
              <Users className="h-5 w-5 text-amber-600" />
            </div>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-gray-900">{customers}</div>
            <p className="text-xs text-gray-500 mt-1">Registrados</p>
          </CardContent>
        </Card>
      </div>

      {/* Órdenes recientes */}
      <Card className="bg-white border-gray-200 shadow-sm">
        <CardHeader className="bg-white">
          <CardTitle className="text-gray-900">Pedidos Recientes</CardTitle>
        </CardHeader>
        <CardContent className="bg-white">
          {recentOrders.length === 0 ? (
            <p className="text-center text-gray-500 py-8">
              No hay pedidos todavía
            </p>
          ) : (
            <div className="space-y-4">
              {recentOrders.map((order) => (
                <div
                  key={order.id}
                  className="flex items-center justify-between border-b border-gray-200 pb-4 last:border-0"
                >
                  <div>
                    <p className="font-medium text-gray-900">{order.folio}</p>
                    <p className="text-sm text-gray-500">
                      {order.items.length} productos
                    </p>
                  </div>
                  <div className="text-right">
                    <p className="font-medium text-gray-900">{formatPrice(Number(order.total))}</p>
                    <p className="text-sm text-gray-500">{order.status}</p>
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
