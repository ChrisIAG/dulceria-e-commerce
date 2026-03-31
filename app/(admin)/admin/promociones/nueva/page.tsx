import { prisma } from '@/lib/prisma';
import { PromoCreator } from '@/components/admin/promo-creator';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { ChevronLeft } from 'lucide-react';
import Link from 'next/link';

export default async function NuevaPromocionPage() {
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

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-4">
        <Link href="/admin/promociones">
          <Button variant="outline" size="icon">
            <ChevronLeft className="h-4 w-4" />
          </Button>
        </Link>
        <div>
          <h2 className="text-3xl font-bold">Nueva Promoción</h2>
          <p className="text-muted-foreground">Crea una nueva oferta especial</p>
        </div>
      </div>

      <Card>
        <CardContent className="pt-6">
          <PromoCreator products={products} />
        </CardContent>
      </Card>
    </div>
  );
}
