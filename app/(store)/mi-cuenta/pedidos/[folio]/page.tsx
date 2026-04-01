'use client';

import { useState, useEffect } from 'react';
import { useSession } from 'next-auth/react';
import { useRouter, useParams } from 'next/navigation';
import Link from 'next/link';
import Image from 'next/image';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import { Separator } from '@/components/ui/separator';
import { ArrowLeft, Package, Calendar, MapPin, CreditCard, TrendingDown } from 'lucide-react';
import { formatPrice } from '@/lib/utils';
import { format } from 'date-fns';
import { es } from 'date-fns/locale';

interface OrderItem {
  id: string;
  quantity: number;
  unitPrice: number;
  total: number;
  product: {
    id: string;
    name: string;
    slug: string;
    images: string[];
  };
}

interface Order {
  id: string;
  folio: string;
  status: string;
  subtotal: number;
  discount: number;
  total: number;
  clientType: string;
  createdAt: string;
  address: any;
  notes: string | null;
  items: OrderItem[];
}

const statusTranslations: Record<string, { label: string; color: string; description: string }> = {
  PENDING: {
    label: 'Pendiente',
    color: 'bg-yellow-100 text-yellow-800',
    description: 'El pago está siendo procesado',
  },
  PAID: {
    label: 'Pagado',
    color: 'bg-green-100 text-green-800',
    description: 'Pago confirmado, preparando envío',
  },
  PREPARING: {
    label: 'Preparando',
    color: 'bg-blue-100 text-blue-800',
    description: 'Tu pedido está siendo empacado',
  },
  SHIPPED: {
    label: 'Enviado',
    color: 'bg-purple-100 text-purple-800',
    description: 'Tu pedido va en camino',
  },
  DELIVERED: {
    label: 'Entregado',
    color: 'bg-green-100 text-green-800',
    description: 'Pedido entregado exitosamente',
  },
  CANCELLED: {
    label: 'Cancelado',
    color: 'bg-red-100 text-red-800',
    description: 'Este pedido fue cancelado',
  },
};

export default function PedidoDetallePage() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const params = useParams();
  const folio = params?.folio as string;
  
  const [order, setOrder] = useState<Order | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    if (status === 'unauthenticated') {
      router.push('/login');
    } else if (status === 'authenticated' && folio) {
      fetchOrder();
    }
  }, [status, folio, router]);

  const fetchOrder = async () => {
    try {
      const response = await fetch(`/api/orders/${folio}`);
      if (!response.ok) {
        if (response.status === 404) {
          throw new Error('Pedido no encontrado');
        }
        throw new Error('Error al cargar el pedido');
      }
      
      const data = await response.json();
      setOrder(data.order);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error al cargar el pedido');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  if (status === 'loading' || loading) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="mx-auto max-w-4xl">
          <Skeleton className="h-10 w-64 mb-8" />
          <Skeleton className="h-[400px] w-full" />
        </div>
      </div>
    );
  }

  if (error || !order) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="mx-auto max-w-4xl">
          <Card className="border-red-200 bg-red-50">
            <CardContent className="py-12 text-center">
              <Package className="mx-auto h-16 w-16 text-red-400 mb-4" />
              <h3 className="text-xl font-semibold text-red-800 mb-2">{error}</h3>
              <Link href="/mi-cuenta/pedidos">
                <Button variant="outline" className="mt-4">
                  Ver Todos los Pedidos
                </Button>
              </Link>
            </CardContent>
          </Card>
        </div>
      </div>
    );
  }

  const statusInfo = statusTranslations[order.status] || {
    label: order.status,
    color: 'bg-gray-100 text-gray-800',
    description: '',
  };

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="mx-auto max-w-4xl">
        <Link href="/mi-cuenta/pedidos">
          <Button variant="ghost" className="mb-4">
            <ArrowLeft className="mr-2 h-4 w-4" />
            Volver a Mis Pedidos
          </Button>
        </Link>

        <div className="mb-6">
          <h1 className="text-4xl font-bold mb-2">
            Pedido #{order.folio.slice(0, 8).toUpperCase()}
          </h1>
          <div className="flex items-center gap-3">
            <Badge className={statusInfo.color}>
              {statusInfo.label}
            </Badge>
            <span className="text-sm text-muted-foreground">
              {statusInfo.description}
            </span>
          </div>
        </div>

        <div className="grid gap-6 lg:grid-cols-3">
          {/* Productos */}
          <Card className="lg:col-span-2">
            <CardHeader>
              <CardTitle>Productos ({order.items.length})</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {order.items.map((item) => (
                  <div key={item.id} className="flex gap-4 pb-4 border-b last:border-0">
                    <Link href={`/catalogo/${item.product.slug}`} className="flex-shrink-0">
                      <div className="relative h-20 w-20 rounded-md overflow-hidden border">
                        <Image
                          src={item.product.images[0] || '/placeholder.png'}
                          alt={item.product.name}
                          fill
                          className="object-cover"
                          sizes="80px"
                        />
                      </div>
                    </Link>
                    <div className="flex-1 min-w-0">
                      <Link
                        href={`/catalogo/${item.product.slug}`}
                        className="font-semibold hover:text-primary transition-colors line-clamp-2"
                      >
                        {item.product.name}
                      </Link>
                      <p className="text-sm text-muted-foreground mt-1">
                        Cantidad: {item.quantity}
                      </p>
                      <p className="text-sm text-muted-foreground">
                        Precio unitario: {formatPrice(item.unitPrice)}
                      </p>
                    </div>
                    <div className="text-right">
                      <p className="font-semibold">
                        {formatPrice(item.total)}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* Resumen y detalles */}
          <div className="space-y-6">
            {/* Resumen del pedido */}
            <Card>
              <CardHeader>
                <CardTitle>Resumen</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">Subtotal</span>
                  <span>{formatPrice(order.subtotal)}</span>
                </div>
                {order.discount > 0 && (
                  <div className="flex justify-between text-sm text-green-600">
                    <span className="flex items-center gap-1">
                      <TrendingDown className="h-4 w-4" />
                      Descuento
                    </span>
                    <span>-{formatPrice(order.discount)}</span>
                  </div>
                )}
                <Separator />
                <div className="flex justify-between font-semibold text-lg">
                  <span>Total</span>
                  <span className="text-primary">{formatPrice(order.total)}</span>
                </div>
              </CardContent>
            </Card>

            {/* Información del pedido */}
            <Card>
              <CardHeader>
                <CardTitle>Detalles</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-start gap-3">
                  <Calendar className="h-5 w-5 text-muted-foreground mt-0.5" />
                  <div>
                    <p className="text-sm font-medium">Fecha de pedido</p>
                    <p className="text-sm text-muted-foreground">
                      {format(new Date(order.createdAt), "d 'de' MMMM yyyy, HH:mm", {
                        locale: es,
                      })}
                    </p>
                  </div>
                </div>

                <div className="flex items-start gap-3">
                  <CreditCard className="h-5 w-5 text-muted-foreground mt-0.5" />
                  <div>
                    <p className="text-sm font-medium">Tipo de cliente</p>
                    <p className="text-sm text-muted-foreground">
                      {order.clientType === 'RETAIL' ? 'Menudeo' : 'Mayoreo'}
                    </p>
                  </div>
                </div>

                {order.address && (
                  <div className="flex items-start gap-3">
                    <MapPin className="h-5 w-5 text-muted-foreground mt-0.5" />
                    <div>
                      <p className="text-sm font-medium">Dirección de envío</p>
                      <p className="text-sm text-muted-foreground whitespace-pre-line">
                        {typeof order.address === 'string'
                          ? order.address
                          : JSON.stringify(order.address, null, 2)}
                      </p>
                    </div>
                  </div>
                )}

                {order.notes && (
                  <div>
                    <p className="text-sm font-medium mb-1">Notas</p>
                    <p className="text-sm text-muted-foreground">{order.notes}</p>
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Ayuda */}
            <Card>
              <CardContent className="pt-6">
                <p className="text-sm text-muted-foreground mb-3">
                  ¿Tienes alguna pregunta sobre tu pedido?
                </p>
                <Button variant="outline" className="w-full">
                  Contactar Soporte
                </Button>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
}
