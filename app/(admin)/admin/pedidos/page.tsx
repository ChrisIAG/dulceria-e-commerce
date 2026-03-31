import { prisma } from '@/lib/prisma';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { formatPrice } from '@/lib/utils';
import { format } from 'date-fns';
import { es } from 'date-fns/locale';

export const dynamic = 'force-dynamic';

export default async function PedidosPage() {
  const orders = await prisma.order.findMany({
    include: {
      items: {
        include: {
          product: true,
        },
      },
    },
    orderBy: { createdAt: 'desc' },
  });

  return (
    <div className="space-y-8">
      <div>
        <h2 className="text-3xl font-bold">Pedidos</h2>
        <p className="text-muted-foreground">Gestiona todos los pedidos de la tienda</p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Todos los Pedidos ({orders.length})</CardTitle>
        </CardHeader>
        <CardContent>
          {orders.length === 0 ? (
            <p className="text-center text-muted-foreground py-8">
              No hay pedidos todavía
            </p>
          ) : (
            <div className="space-y-4">
              {orders.map((order) => (
                <div
                  key={order.id}
                  className="border rounded-lg p-4 space-y-3"
                >
                  <div className="flex items-start justify-between">
                    <div>
                      <h3 className="font-bold">{order.folio}</h3>
                      <p className="text-sm text-muted-foreground">
                        {format(new Date(order.createdAt), "d 'de' MMMM yyyy, HH:mm", {
                          locale: es,
                        })}
                      </p>
                    </div>
                    <div className="text-right">
                      <p className="text-2xl font-bold">
                        {formatPrice(Number(order.total))}
                      </p>
                      <div className="flex gap-2 mt-2">
                        <span
                          className={`inline-block px-2 py-1 text-xs rounded-full ${
                            order.status === 'PAID'
                              ? 'bg-green-100 text-green-800'
                              : 'bg-yellow-100 text-yellow-800'
                          }`}
                        >
                          {order.status}
                        </span>
                      </div>
                    </div>
                  </div>

                  <div className="border-t pt-3">
                    <p className="text-sm text-muted-foreground">
                      Cliente: {order.clientType === 'RETAIL' ? 'Menudeo' : 'Mayoreo'}
                    </p>
                    {order.notes && (
                      <p className="text-sm text-muted-foreground">Notas: {order.notes}</p>
                    )}
                  </div>

                  <div className="border-t pt-3">
                    <p className="text-sm font-medium mb-2">Productos ({order.items.length})</p>
                    <div className="space-y-1">
                      {order.items.map((item) => (
                        <p key={item.id} className="text-sm text-muted-foreground">
                          {item.product?.name || 'Producto eliminado'} x{item.quantity} -{' '}
                          {formatPrice(Number(item.total))}
                        </p>
                      ))}
                    </div>
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
