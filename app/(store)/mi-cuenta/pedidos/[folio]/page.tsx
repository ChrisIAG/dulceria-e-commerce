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
import { ArrowLeft, Package, Calendar, MapPin, CreditCard, TrendingDown, CheckCircle2, Clock, Truck, Home } from 'lucide-react';
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

const statusTimeline = {
  PENDING: [
    { step: 'Confirmación', status: 'current', icon: Clock },
    { step: 'Preparación', status: 'pending', icon: Package },
    { step: 'Envío', status: 'pending', icon: Truck },
    { step: 'Entrega', status: 'pending', icon: Home },
  ],
  PAID: [
    { step: 'Confirmación', status: 'completed', icon: CheckCircle2 },
    { step: 'Preparación', status: 'current', icon: Package },
    { step: 'Envío', status: 'pending', icon: Truck },
    { step: 'Entrega', status: 'pending', icon: Home },
  ],
  PREPARING: [
    { step: 'Confirmación', status: 'completed', icon: CheckCircle2 },
    { step: 'Preparación', status: 'current', icon: Package },
    { step: 'Envío', status: 'pending', icon: Truck },
    { step: 'Entrega', status: 'pending', icon: Home },
  ],
  SHIPPED: [
    { step: 'Confirmación', status: 'completed', icon: CheckCircle2 },
    { step: 'Preparación', status: 'completed', icon: Package },
    { step: 'Envío', status: 'current', icon: Truck },
    { step: 'Entrega', status: 'pending', icon: Home },
  ],
  DELIVERED: [
    { step: 'Confirmación', status: 'completed', icon: CheckCircle2 },
    { step: 'Preparación', status: 'completed', icon: Package },
    { step: 'Envío', status: 'completed', icon: Truck },
    { step: 'Entrega', status: 'completed', icon: Home },
  ],
  CANCELLED: [
    { step: 'Cancelado', status: 'cancelled', icon: Clock },
  ],
};

const statusConfig = {
  PENDING: {
    label: 'En Espera de Pago',
    color: 'bg-yellow-50 border-yellow-200',
    badge: 'bg-yellow-100 text-yellow-800',
    description: 'Por favor completa tu pago para procesar el pedido',
  },
  PAID: {
    label: 'Pago Confirmado',
    color: 'bg-blue-50 border-blue-200',
    badge: 'bg-blue-100 text-blue-800',
    description: 'Tu pago fue recibido. Estamos preparando tu pedido',
  },
  PREPARING: {
    label: 'Preparando Pedido',
    color: 'bg-indigo-50 border-indigo-200',
    badge: 'bg-indigo-100 text-indigo-800',
    description: 'Tu pedido está siendo empacado con cuidado',
  },
  SHIPPED: {
    label: 'En Tránsito',
    color: 'bg-purple-50 border-purple-200',
    badge: 'bg-purple-100 text-purple-800',
    description: 'Tu pedido está en camino. Pronto llegará a ti',
  },
  DELIVERED: {
    label: 'Entregado',
    color: 'bg-green-50 border-green-200',
    badge: 'bg-green-100 text-green-800',
    description: 'Pedido entregado exitosamente',
  },
  CANCELLED: {
    label: 'Cancelado',
    color: 'bg-red-50 border-red-200',
    badge: 'bg-red-100 text-red-800',
    description: 'Este pedido fue cancelado',
  },
};

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
        <div className="mx-auto max-w-6xl">
          <Skeleton className="h-10 w-64 mb-8" />
          <Skeleton className="h-[600px] w-full" />
        </div>
      </div>
    );
  }

  if (error || !order) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="mx-auto max-w-6xl">
          <Link href="/mi-cuenta/pedidos">
            <Button variant="ghost" className="mb-4">
              <ArrowLeft className="mr-2 h-4 w-4" />
              Volver a Mis Pedidos
            </Button>
          </Link>
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

  const config = statusConfig[order.status as keyof typeof statusConfig] || {
    label: order.status,
    color: 'bg-gray-50 border-gray-200',
    badge: 'bg-gray-100 text-gray-800',
    description: '',
  };

  const timeline = statusTimeline[order.status as keyof typeof statusTimeline] || [];

  // Parsear dirección si viene como string JSON
  const parseAddress = (address: any) => {
    if (!address) return null;
    
    if (typeof address === 'string') {
      try {
        return JSON.parse(address);
      } catch {
        return address; // Si no se puede parsear, retornar como está
      }
    }
    return address;
  };

  const addressData = parseAddress(order.address);

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="mx-auto max-w-6xl">
        {/* Header */}
        <div className="mb-8">
          <Link href="/mi-cuenta/pedidos">
            <Button variant="ghost" className="mb-4">
              <ArrowLeft className="mr-2 h-4 w-4" />
              Volver a Mis Pedidos
            </Button>
          </Link>
          
          <div className="flex items-start justify-between gap-4">
            <div>
              <h1 className="text-4xl font-bold mb-2">Pedido #{order.folio.slice(0, 8).toUpperCase()}</h1>
              <p className="text-muted-foreground">
                Realizado {format(new Date(order.createdAt), "d 'de' MMMM 'de' yyyy", { locale: es })}
              </p>
            </div>
            <Badge className={config.badge} style={{ fontSize: '0.875rem', padding: '0.5rem 1rem' }}>
              {config.label}
            </Badge>
          </div>
        </div>

        {/* Estado del pedido - Timeline */}
        <Card className={`mb-8 border ${config.color}`}>
          <CardContent className="pt-6">
            <p className="text-sm font-medium mb-4 text-gray-700">{config.description}</p>
            <div className="flex justify-between items-center relative">
              {timeline.map((item, index) => {
                const IconComponent = item.icon;
                return (
                  <div key={index} className="flex flex-col items-center flex-1 relative z-10">
                    <div className={`flex items-center justify-center w-12 h-12 rounded-full mb-2 ${
                      item.status === 'completed' ? 'bg-green-500' :
                      item.status === 'current' ? 'bg-blue-500' :
                      item.status === 'cancelled' ? 'bg-red-500' :
                      'bg-gray-300'
                    }`}>
                      <IconComponent className="w-6 h-6 text-white" />
                    </div>
                    <p className="text-xs font-medium text-center text-gray-700">{item.step}</p>
                  </div>
                );
              })}
            </div>
          </CardContent>
        </Card>

        {/* Contenido principal */}
        <div className="grid gap-6 lg:grid-cols-3">
          {/* Productos */}
          <Card className="lg:col-span-2">
            <CardHeader className="border-b">
              <CardTitle className="flex items-center gap-2">
                <Package className="w-5 h-5" />
                Productos ({order.items.length})
              </CardTitle>
            </CardHeader>
            <CardContent className="p-0">
              <div className="divide-y">
                {order.items.map((item, index) => (
                  <div key={item.id} className="p-4 hover:bg-gray-50 transition-colors">
                    <div className="flex gap-4">
                      {/* Imagen del producto */}
                      <Link href={`/catalogo/${item.product.slug}`} className="flex-shrink-0">
                        <div className="relative h-24 w-24 rounded-lg overflow-hidden border border-gray-200 bg-gray-100">
                          <Image
                            src={item.product.images[0] || '/placeholder.png'}
                            alt={item.product.name}
                            fill
                            className="object-cover hover:scale-105 transition-transform"
                            sizes="96px"
                          />
                        </div>
                      </Link>

                      {/* Información del producto */}
                      <div className="flex-1 min-w-0">
                        <Link href={`/catalogo/${item.product.slug}`} className="hover:text-primary transition-colors">
                          <h3 className="font-semibold text-base line-clamp-2 mb-1">
                            {item.product.name}
                          </h3>
                        </Link>
                        <p className="text-sm text-muted-foreground mb-2">
                          Cantidad: <span className="font-medium text-foreground">{item.quantity} {item.quantity === 1 ? 'unidad' : 'unidades'}</span>
                        </p>
                        <div className="flex gap-4">
                          <div>
                            <p className="text-xs text-muted-foreground">Precio unitario</p>
                            <p className="text-sm font-medium">{formatPrice(item.unitPrice)}</p>
                          </div>
                          <div>
                            <p className="text-xs text-muted-foreground">Subtotal</p>
                            <p className="text-sm font-medium">{formatPrice(item.total)}</p>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* Sidebar derecho */}
          <div className="space-y-6">
            {/* Resumen financiero */}
            <Card className="border-gray-200">
              <CardHeader className="border-b pb-4">
                <CardTitle className="text-lg">Resumen de Pago</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4 pt-6">
                <div className="flex justify-between items-center">
                  <span className="text-sm text-muted-foreground">Subtotal</span>
                  <span className="font-medium">{formatPrice(order.subtotal)}</span>
                </div>

                {order.discount > 0 && (
                  <>
                    <div className="flex justify-between items-center text-green-600">
                      <span className="text-sm flex items-center gap-1">
                        <TrendingDown className="w-4 h-4" />
                        Descuento
                      </span>
                      <span className="font-medium">-{formatPrice(order.discount)}</span>
                    </div>
                  </>
                )}

                <Separator className="my-2" />

                <div className="flex justify-between items-center">
                  <span className="text-base font-semibold">Total a pagar</span>
                  <span className="text-2xl font-bold text-primary">{formatPrice(order.total)}</span>
                </div>

                {order.discount > 0 && (
                  <div className="text-xs text-green-600 text-center pt-2">
                    ¡Ahorraste {formatPrice(order.discount)}!
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Información de envío */}
            <Card className="border-gray-200">
              <CardHeader className="border-b pb-4">
                <CardTitle className="text-lg flex items-center gap-2">
                  <Truck className="w-5 h-5" />
                  Envío
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4 pt-6">
                {addressData && (
                  <div>
                    <p className="text-xs text-muted-foreground uppercase font-semibold mb-2">Dirección de entrega</p>
                    <div className="flex gap-2">
                      <MapPin className="w-4 h-4 text-muted-foreground flex-shrink-0 mt-0.5" />
                      <p className="text-sm text-foreground leading-relaxed">
                        {typeof addressData === 'string'
                          ? addressData
                          : `${addressData?.street || ''}, ${addressData?.city || ''}, ${addressData?.state || ''} ${addressData?.zipCode || ''}`}
                      </p>
                    </div>
                  </div>
                )}

                <div>
                  <p className="text-xs text-muted-foreground uppercase font-semibold mb-2">Tipo de cliente</p>
                  <div className="flex gap-2">
                    <CreditCard className="w-4 h-4 text-muted-foreground flex-shrink-0 mt-0.5" />
                    <p className="text-sm text-foreground">
                      {order.clientType === 'RETAIL' ? 'Menudeo' : 'Mayoreo'}
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Notas adicionales */}
            {order.notes && (
              <Card className="border-gray-200">
                <CardHeader className="border-b pb-4">
                  <CardTitle className="text-lg">Notas adicionales</CardTitle>
                </CardHeader>
                <CardContent className="pt-6">
                  <p className="text-sm text-foreground">{order.notes}</p>
                </CardContent>
              </Card>
            )}

            {/* Soporte */}
            <Card className="border-blue-200 bg-blue-50">
              <CardContent className="pt-6">
                <p className="text-sm font-medium text-gray-900 mb-3">¿Necesitas ayuda?</p>
                <p className="text-xs text-gray-700 mb-4">
                  Si tienes preguntas sobre tu pedido, no dudes en contactarnos.
                </p>
                <Button variant="outline" className="w-full" size="sm">
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
