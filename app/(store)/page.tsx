import { prisma } from '@/lib/prisma';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { ArrowRight, Truck, ShieldCheck, Tag } from 'lucide-react';
import { PromoBanner } from '@/components/store/promo-banner';

// Revalidar cada 60 segundos (ISR)
export const revalidate = 60;

export default async function HomePage() {
  // Obtener promociones activas con banner
  const now = new Date();
  const promotions = await (prisma as any).promotion.findMany({
    where: {
      active: true,
      startDate: { lte: now },
      endDate: { gte: now },
      bannerImage: { not: null },
    },
    orderBy: {
      startDate: 'desc',
    },
    take: 5, // Máximo 5 promociones en el carrusel
  });

  return (
    <div>
      {/* Banner de Promociones */}
      {promotions.length > 0 && (
        <section className="mb-8">
          <PromoBanner promotions={promotions as any} />
        </section>
      )}

      {/* Hero Section */}
      <section className="bg-gradient-to-r from-primary/10 via-primary/5 to-background py-20">
        <div className="container mx-auto px-4">
          <div className="mx-auto max-w-3xl text-center">
            <h1 className="mb-6 text-5xl font-bold tracking-tight">
              Dulces Mexicanos al <span className="text-primary">Mejor Precio</span>
            </h1>
            <p className="mb-8 text-xl text-muted-foreground">
              Venta al por mayor y menudeo. Ofertas especiales para revendedores.
              ¡Envíos a toda la República Mexicana!
            </p>
            <div className="flex flex-col gap-4 sm:flex-row sm:justify-center">
              <Link href="/catalogo">
                <Button size="lg" className="w-full sm:w-auto">
                  Ver Catálogo
                  <ArrowRight className="ml-2 h-5 w-5" />
                </Button>
              </Link>
              <Link href="/mayoreo">
                <Button size="lg" variant="outline" className="w-full sm:w-auto">
                  Precios Mayoreo
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* Features */}
      <section className="py-16">
        <div className="container mx-auto px-4">
          <div className="grid gap-8 md:grid-cols-3">
            <Card>
              <CardContent className="flex flex-col items-center p-6 text-center">
                <Truck className="mb-4 h-12 w-12 text-primary" />
                <h3 className="mb-2 text-xl font-semibold">Envíos a Todo México</h3>
                <p className="text-muted-foreground">
                  Entrega rápida y segura a cualquier parte del país
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="flex flex-col items-center p-6 text-center">
                <Tag className="mb-4 h-12 w-12 text-primary" />
                <h3 className="mb-2 text-xl font-semibold">Precios de Mayoreo</h3>
                <p className="text-muted-foreground">
                  Descuentos especiales por volumen para revendedores
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="flex flex-col items-center p-6 text-center">
                <ShieldCheck className="mb-4 h-12 w-12 text-primary" />
                <h3 className="mb-2 text-xl font-semibold">Pago Seguro</h3>
                <p className="text-muted-foreground">
                  Acepta tarjetas, OXXO y transferencias bancarias
                </p>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="bg-primary/5 py-16">
        <div className="container mx-auto px-4 text-center">
          <h2 className="mb-4 text-3xl font-bold">¿Eres revendedor?</h2>
          <p className="mb-8 text-lg text-muted-foreground">
            Obtén precios especiales de mayoreo con pedidos desde 12 piezas
          </p>
          <Link href="/mayoreo">
            <Button size="lg">Conoce Más Aquí</Button>
          </Link>
        </div>
      </section>
    </div>
  );
}
