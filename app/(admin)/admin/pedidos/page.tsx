'use client';

import { useEffect, useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { OrderActions } from '@/components/admin/order-actions';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Skeleton } from '@/components/ui/skeleton';
import { formatPrice } from '@/lib/utils';
import { format } from 'date-fns';
import { es } from 'date-fns/locale';
import { Search, Filter } from 'lucide-react';
import Link from 'next/link';

interface Order {
  id: string;
  folio: string;
  status: string;
  total: number;
  createdAt: string;
  clientType: string;
  notes: string | null;
  items: Array<{
    id: string;
    quantity: number;
    total: number;
    product: {
      name: string;
    } | null;
  }>;
  user: {
    name: string;
    email: string;
  } | null;
}

const STATUS_LABELS: Record<string, string> = {
  PENDING: 'Pendiente',
  PAID: 'Pagado',
  PREPARING: 'Preparando',
  SHIPPED: 'Enviado',
  DELIVERED: 'Entregado',
  CANCELLED: 'Cancelado',
};

const STATUS_COLORS: Record<string, string> = {
  PENDING: 'bg-yellow-100 text-yellow-800',
  PAID: 'bg-green-100 text-green-800',
  PREPARING: 'bg-blue-100 text-blue-800',
  SHIPPED: 'bg-purple-100 text-purple-800',
  DELIVERED: 'bg-emerald-100 text-emerald-800',
  CANCELLED: 'bg-red-100 text-red-800',
};

export default function PedidosPage() {
  const [orders, setOrders] = useState<Order[]>([]);
  const [filteredOrders, setFilteredOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('ALL');

  useEffect(() => {
    fetchOrders();
  }, []);

  useEffect(() => {
    filterOrders();
  }, [orders, searchQuery, statusFilter]);

  const fetchOrders = async () => {
    setLoading(true);
    try {
      const res = await fetch('/api/admin/orders');
      if (res.ok) {
        const data = await res.json();
        setOrders(data);
      }
    } catch (error) {
      console.error('Error fetching orders:', error);
    } finally {
      setLoading(false);
    }
  };

  const filterOrders = () => {
    let filtered = [...orders];

    // Filtro por búsqueda (folio, email, nombre)
    if (searchQuery) {
      const query = searchQuery.toLowerCase();
      filtered = filtered.filter(
        (order) =>
          order.folio.toLowerCase().includes(query) ||
          order.user?.email?.toLowerCase().includes(query) ||
          order.user?.name?.toLowerCase().includes(query)
      );
    }

    // Filtro por estado
    if (statusFilter !== 'ALL') {
      filtered = filtered.filter((order) => order.status === statusFilter);
    }

    setFilteredOrders(filtered);
  };

  return (
    <div className="space-y-8">
      <div>
        <h2 className="text-3xl font-bold">Pedidos</h2>
        <p className="text-muted-foreground">Gestiona todos los pedidos de la tienda</p>
      </div>

      {/* Filtros y Búsqueda */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg flex items-center gap-2">
            <Filter className="h-5 w-5" />
            Filtros
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex flex-col sm:flex-row gap-4">
            {/* Búsqueda */}
            <div className="flex-1 relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Buscar por folio, email o nombre..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-9"
              />
            </div>

            {/* Filtro por Estado */}
            <Select value={statusFilter} onValueChange={setStatusFilter}>
              <SelectTrigger className="w-full sm:w-[200px]">
                <SelectValue placeholder="Todos los estados" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="ALL">Todos los estados</SelectItem>
                <SelectItem value="PENDING">Pendiente</SelectItem>
                <SelectItem value="PAID">Pagado</SelectItem>
                <SelectItem value="PREPARING">Preparando</SelectItem>
                <SelectItem value="SHIPPED">Enviado</SelectItem>
                <SelectItem value="DELIVERED">Entregado</SelectItem>
                <SelectItem value="CANCELLED">Cancelado</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      {/* Lista de Pedidos */}
      <Card>
        <CardHeader>
          <CardTitle>
            {loading ? (
              <Skeleton className="h-6 w-48" />
            ) : (
              <>
                {filteredOrders.length} {filteredOrders.length === 1 ? 'Pedido' : 'Pedidos'}
                {statusFilter !== 'ALL' && (
                  <span className="text-sm font-normal text-muted-foreground ml-2">
                    ({STATUS_LABELS[statusFilter]})
                  </span>
                )}
              </>
            )}
          </CardTitle>
        </CardHeader>
        <CardContent>
          {loading ? (
            <div className="space-y-4">
              {[...Array(3)].map((_, i) => (
                <Skeleton key={i} className="h-48 w-full" />
              ))}
            </div>
          ) : filteredOrders.length === 0 ? (
            <p className="text-center text-muted-foreground py-8">
              No se encontraron pedidos
            </p>
          ) : (
            <div className="space-y-4">
              {filteredOrders.map((order) => (
                <div key={order.id} className="border rounded-lg p-4 space-y-3">
                  {/* Header del Pedido */}
                  <div className="flex items-start justify-between">
                    <div>
                      <Link
                        href={`/admin/pedidos/${order.folio}`}
                        className="font-bold text-lg hover:text-primary transition-colors"
                      >
                        {order.folio}
                      </Link>
                      <p className="text-sm text-muted-foreground">
                        {format(new Date(order.createdAt), "d 'de' MMMM yyyy, HH:mm", {
                          locale: es,
                        })}
                      </p>
                      {order.user && (
                        <p className="text-sm text-muted-foreground mt-1">
                          👤 {order.user.name} ({order.user.email})
                        </p>
                      )}
                    </div>
                    <div className="text-right space-y-2">
                      <p className="text-2xl font-bold">{formatPrice(Number(order.total))}</p>
                      <Badge className={STATUS_COLORS[order.status]}>
                        {STATUS_LABELS[order.status]}
                      </Badge>
                    </div>
                  </div>

                  {/* Información adicional */}
                  <div className="border-t pt-3 space-y-1">
                    <p className="text-sm text-muted-foreground">
                      <span className="font-medium">Tipo:</span>{' '}
                      {order.clientType === 'RETAIL' ? '🛒 Menudeo' : '💼 Mayoreo'}
                    </p>
                    <p className="text-sm text-muted-foreground">
                      <span className="font-medium">Productos:</span> {order.items.length}{' '}
                      {order.items.length === 1 ? 'artículo' : 'artículos'}
                    </p>
                    {order.notes && (
                      <p className="text-sm text-muted-foreground">
                        <span className="font-medium">Notas:</span> {order.notes}
                      </p>
                    )}
                  </div>

                  {/* Productos (resumido) */}
                  <div className="border-t pt-3">
                    <div className="space-y-1">
                      {order.items.slice(0, 3).map((item) => (
                        <p key={item.id} className="text-sm text-muted-foreground">
                          • {item.product?.name || 'Producto eliminado'} x{item.quantity} -{' '}
                          {formatPrice(Number(item.total))}
                        </p>
                      ))}
                      {order.items.length > 3 && (
                        <p className="text-sm text-muted-foreground font-medium">
                          + {order.items.length - 3} productos más
                        </p>
                      )}
                    </div>
                  </div>

                  {/* Acciones */}
                  <div className="border-t pt-3 flex items-center justify-between">
                    <Link href={`/admin/pedidos/${order.folio}`}>
                      <span className="text-sm text-primary hover:underline">
                        Ver detalles completos →
                      </span>
                    </Link>
                    <OrderActions
                      orderId={order.id}
                      currentStatus={order.status}
                      folio={order.folio}
                    />
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
