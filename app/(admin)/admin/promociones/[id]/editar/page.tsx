import { prisma } from '@/lib/prisma';
import { PromoCreator } from '@/components/admin/promo-creator';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { ChevronLeft } from 'lucide-react';
import Link from 'next/link';
import { notFound } from 'next/navigation';

export default async function EditarPromocionPage({
  params,
}: {
  params: { id: string };
}) {
  // Obtener productos para la selección
  const products = await prisma.product.findMany({
    where: { active: true },
    select: {
      id: true,
      name: true,
      price: true,
      wholesalePrice: true,
      images: true,
    },
    orderBy: { name: 'asc' },
  });

  // Obtener la promoción a editar
  const promotion = await prisma.promotion.findUnique({
    where: { id: params.id },
    include: {
      products: {
        select: {
          id: true,
        },
      },
    },
  });

  if (!promotion) {
    notFound();
  }

  // Transformar datos para el componente
  const promotionData = {
    ...promotion,
    productIds: promotion.products.map((p: any) => p.id),
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-4">
        <Link href="/admin/promociones">
          <Button variant="outline" size="icon">
            <ChevronLeft className="h-4 w-4" />
          </Button>
        </Link>
        <div>
          <h2 className="text-3xl font-bold">Editar Promoción</h2>
          <p className="text-muted-foreground">Actualiza los detalles de la oferta</p>
        </div>
      </div>

      <Card>
        <CardContent className="pt-6">
          <PromoCreator products={products} promotion={promotionData} />
        </CardContent>
      </Card>
    </div>
  );
}
