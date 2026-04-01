import { prisma } from '@/lib/prisma';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Plus, Calendar, TrendingUp, Package } from 'lucide-react';
import Link from 'next/link';
import Image from 'next/image';
import { PromotionActions } from './promotion-actions';
import { formatPrice } from '@/lib/utils';

export default async function PromocionesAdminPage() {
  const promotions = await prisma.promotion.findMany({
    include: {
      products: {
        select: {
          id: true,
          name: true,
        },
      },
    },
    orderBy: {
      startDate: 'desc',
    },
  });

  // Calcular estadísticas
  const activePromotions = promotions.filter((p: any) => p.active);
  const upcomingPromotions = promotions.filter(
    (p: any) => new Date(p.startDate) > new Date()
  );

  return (
    <div className="space-y-8">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-3xl font-bold">Promociones</h2>
          <p className="text-muted-foreground">Crea ofertas y descuentos especiales</p>
        </div>
        <Link href="/admin/promociones/nueva">
          <Button>
            <Plus className="mr-2 h-4 w-4" />
            Nueva Promoción
          </Button>
        </Link>
      </div>

      {/* Estadísticas */}
      <div className="grid gap-4 md:grid-cols-3">
        <Card className="bg-white border-gray-200 shadow-sm hover:shadow-md transition-shadow">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-gray-600">Total</CardTitle>
            <div className="h-10 w-10 rounded-full bg-violet-100 flex items-center justify-center">
              <Package className="h-5 w-5 text-violet-600" />
            </div>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-gray-900">{promotions.length}</div>
            <p className="text-xs text-gray-500 mt-1">Promociones creadas</p>
          </CardContent>
        </Card>

        <Card className="bg-white border-gray-200 shadow-sm hover:shadow-md transition-shadow">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-gray-600">Activas</CardTitle>
            <div className="h-10 w-10 rounded-full bg-emerald-100 flex items-center justify-center">
              <TrendingUp className="h-5 w-5 text-emerald-600" />
            </div>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-gray-900">{activePromotions.length}</div>
            <p className="text-xs text-gray-500 mt-1">Promociones activas</p>
          </CardContent>
        </Card>

        <Card className="bg-white border-gray-200 shadow-sm hover:shadow-md transition-shadow">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-gray-600">Próximas</CardTitle>
            <div className="h-10 w-10 rounded-full bg-blue-100 flex items-center justify-center">
              <Calendar className="h-5 w-5 text-blue-600" />
            </div>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-gray-900">{upcomingPromotions.length}</div>
            <p className="text-xs text-gray-500 mt-1">Por comenzar</p>
          </CardContent>
        </Card>
      </div>

      {/* Lista de promociones */}
      <Card className="bg-white border-gray-200 shadow-sm">
        <CardHeader>
          <CardTitle className="text-gray-900">Todas las Promociones</CardTitle>
        </CardHeader>
        <CardContent>
          {promotions.length === 0 ? (
            <div className="text-center py-12">
              <Package className="mx-auto h-12 w-12 text-muted-foreground/50" />
              <p className="mt-4 text-muted-foreground">No hay promociones creadas</p>
              <Link href="/admin/promociones/nueva">
                <Button className="mt-4" variant="outline">
                  <Plus className="mr-2 h-4 w-4" />
                  Crear primera promoción
                </Button>
              </Link>
            </div>
          ) : (
            <div className="space-y-4">
              {promotions.map((promotion: any) => {
                const isActive = promotion.active;
                const isUpcoming = new Date(promotion.startDate) > new Date();
                const isExpired = new Date(promotion.endDate) < new Date();

                return (
                  <div
                    key={promotion.id}
                    className="flex items-center justify-between p-4 border rounded-lg hover:bg-accent/50 transition-colors"
                  >
                    <div className="flex items-start gap-4 flex-1">
                      {promotion.bannerImage && (
                        <div className="relative w-24 h-24 rounded-lg overflow-hidden flex-shrink-0">
                          <Image
                            src={promotion.bannerImage}
                            alt={promotion.title}
                            fill
                            className="object-cover"
                          />
                        </div>
                      )}

                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 mb-2">
                          <h3 className="font-semibold text-lg">{promotion.title}</h3>
                          {isActive && !isExpired && !isUpcoming && (
                            <Badge variant="default" className="bg-green-600">Activa</Badge>
                          )}
                          {!isActive && <Badge variant="secondary">Inactiva</Badge>}
                          {isUpcoming && <Badge variant="outline" className="border-blue-600 text-blue-600">Próxima</Badge>}
                          {isExpired && <Badge variant="outline" className="border-red-600 text-red-600">Expirada</Badge>}
                        </div>

                        {promotion.description && (
                          <p className="text-sm text-muted-foreground mb-2 line-clamp-1">
                            {promotion.description}
                          </p>
                        )}

                        <div className="flex flex-wrap gap-4 text-sm text-muted-foreground">
                          <div className="flex items-center gap-1">
                            <TrendingUp className="h-4 w-4" />
                            <span>
                              {promotion.type === 'PERCENTAGE' && `${promotion.discount}% descuento`}
                              {promotion.type === 'FIXED' && `$${promotion.discount} descuento`}
                              {promotion.type === 'TWO_FOR_ONE' && '2x1'}
                              {promotion.type === 'BUNDLE' && 'Pack especial'}
                            </span>
                          </div>

                          <div className="flex items-center gap-1">
                            <Calendar className="h-4 w-4" />
                            <span>
                              {new Date(promotion.startDate).toLocaleDateString('es-MX')} - {new Date(promotion.endDate).toLocaleDateString('es-MX')}
                            </span>
                          </div>

                          <div className="flex items-center gap-1">
                            <Package className="h-4 w-4" />
                            <span>{promotion.products.length} producto(s)</span>
                          </div>
                        </div>
                      </div>
                    </div>

                    <PromotionActions
                      promotionId={promotion.id}
                      promotionTitle={promotion.title}
                    />
                  </div>
                );
              })}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
