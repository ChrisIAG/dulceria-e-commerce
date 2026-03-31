import { prisma } from '@/lib/prisma';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { PromoBanner } from '@/components/store/promo-banner';
import { Calendar, TrendingUp, Package } from 'lucide-react';
import Link from 'next/link';
import Image from 'next/image';
import { formatPrice } from '@/lib/utils';

export default async function PromocionesPage() {
  const now = new Date();

  // Obtener promociones activas y dentro del período
  const promotions = await (prisma as any).promotion.findMany({
    where: {
      active: true,
      startDate: { lte: now },
      endDate: { gte: now },
    },
    include: {
      products: {
        select: {
          id: true,
          name: true,
          slug: true,
          images: true,
          price: true,
        },
      },
    },
    orderBy: {
      startDate: 'desc',
    },
  });

  // Promociones con banner para el carrusel
  const promosWithBanner = promotions.filter((p: any) => p.bannerImage);

  return (
    <div className="min-h-screen">
      {/* Banner carousel - solo si hay promociones con imagen */}
      {promosWithBanner.length > 0 && (
        <div className="mb-8">
          <PromoBanner promotions={promosWithBanner as any} />
        </div>
      )}

      <div className="container mx-auto px-4 py-8">
        <div className="mb-8">
          <h1 className="text-4xl font-bold mb-2">Promociones Activas</h1>
          <p className="text-muted-foreground">
            Aprovecha nuestras ofertas especiales en productos seleccionados
          </p>
        </div>

        {promotions.length === 0 ? (
          <Card>
            <CardHeader>
              <CardTitle>No hay promociones activas en este momento</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-muted-foreground">
                Vuelve pronto para descubrir nuestras ofertas especiales. Síguenos en
                redes sociales para estar al tanto de todas las promociones.
              </p>
            </CardContent>
          </Card>
        ) : (
          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            {promotions.map((promo: any) => (
              <Card key={promo.id} className="overflow-hidden hover:shadow-lg transition-shadow">
                {promo.bannerImage && (
                  <div className="relative aspect-video">
                    <Image
                      src={promo.bannerImage}
                      alt={promo.title}
                      fill
                      className="object-cover"
                    />
                  </div>
                )}
                
                <CardHeader>
                  <div className="flex items-start justify-between gap-2">
                    <CardTitle className="text-xl">{promo.title}</CardTitle>
                    <Badge variant="default" className="bg-green-600 shrink-0">
                      Activa
                    </Badge>
                  </div>
                  {promo.description && (
                    <p className="text-sm text-muted-foreground mt-2">
                      {promo.description}
                    </p>
                  )}
                </CardHeader>

                <CardContent className="space-y-4">
                  {/* Descuento */}
                  <div className="bg-primary/10 rounded-lg p-4 text-center">
                    <div className="text-3xl font-black text-primary">
                      {promo.type === 'PERCENTAGE' && `${promo.discount}% OFF`}
                      {promo.type === 'FIXED' && `-${formatPrice(promo.discount)}`}
                      {promo.type === 'TWO_FOR_ONE' && '2x1'}
                      {promo.type === 'BUNDLE' && 'PACK ESPECIAL'}
                    </div>
                    <p className="text-sm text-muted-foreground mt-1">
                      {promo.type === 'PERCENTAGE' && 'de descuento'}
                      {promo.type === 'FIXED' && 'de descuento'}
                      {promo.type === 'TWO_FOR_ONE' && 'en productos seleccionados'}
                      {promo.type === 'BUNDLE' && 'precio especial'}
                    </p>
                  </div>

                  {/* Fechas */}
                  <div className="flex items-center gap-2 text-sm text-muted-foreground">
                    <Calendar className="h-4 w-4" />
                    <span>
                      Válido hasta {new Date(promo.endDate).toLocaleDateString('es-MX', {
                        day: 'numeric',
                        month: 'long',
                        year: 'numeric'
                      })}
                    </span>
                  </div>

                  {/* Productos incluidos */}
                  <div className="space-y-2">
                    <div className="flex items-center gap-2 text-sm font-medium">
                      <Package className="h-4 w-4" />
                      <span>{promo.products.length} productos incluidos</span>
                    </div>
                    
                    {promo.products.length > 0 && (
                      <div className="flex gap-2 flex-wrap">
                        {promo.products.slice(0, 3).map((product: any) => (
                          <Link
                            key={product.id}
                            href={`/catalogo/${product.slug}`}
                            className="text-xs bg-secondary/20 hover:bg-secondary/30 px-2 py-1 rounded transition-colors"
                          >
                            {product.name}
                          </Link>
                        ))}
                        {promo.products.length > 3 && (
                          <span className="text-xs text-muted-foreground px-2 py-1">
                            +{promo.products.length - 3} más
                          </span>
                        )}
                      </div>
                    )}
                  </div>

                  {/* Botón ver productos */}
                  <Link href="/catalogo" className="block">
                    <Button className="w-full" variant="default">
                      <TrendingUp className="mr-2 h-4 w-4" />
                      Ver Productos
                    </Button>
                  </Link>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
