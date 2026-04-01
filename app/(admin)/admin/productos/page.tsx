import { prisma } from '@/lib/prisma';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import Link from 'next/link';
import Image from 'next/image';
import { formatPrice } from '@/lib/utils';
import { Plus } from 'lucide-react';
import { ProductActions } from './product-actions';

export const dynamic = 'force-dynamic';

export default async function ProductosPage() {
  const products = await prisma.product.findMany({
    include: { category: true },
    orderBy: { createdAt: 'desc' },
  });

  return (
    <div className="space-y-8">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-3xl font-bold">Productos</h2>
          <p className="text-muted-foreground">Gestiona tu catálogo de productos</p>
        </div>
        <Link href="/admin/productos/nuevo">
          <Button>
            <Plus className="mr-2 h-4 w-4" />
            Nuevo Producto
          </Button>
        </Link>
      </div>

      <Card className="bg-white border-gray-200 shadow-sm">
        <CardHeader>
          <CardTitle className="text-gray-900">Todos los Productos ({products.length})</CardTitle>
        </CardHeader>
        <CardContent>
          {products.length === 0 ? (
            <p className="text-center text-muted-foreground py-8">
              No hay productos registrados. Crea tu primer producto.
            </p>
          ) : (
            <div className="space-y-4">
              {products.map((product: any) => (
                <div
                  key={product.id}
                  className="flex items-center gap-4 border-b pb-4 last:border-0"
                >
                  <div className="relative h-16 w-16 flex-shrink-0 overflow-hidden rounded-lg">
                    <Image
                      src={product.images[0] || '/placeholder.png'}
                      alt={product.name}
                      fill
                      className="object-cover"
                    />
                  </div>

                  <div className="flex-1">
                    <h3 className="font-semibold">{product.name}</h3>
                    <p className="text-sm text-muted-foreground">
                      {product.category?.name || 'Sin categoría'}
                    </p>
                  </div>

                  <div className="text-right">
                    <p className="font-medium">
                      {formatPrice(Number(product.price))} / {formatPrice(Number(product.wholesalePrice))}
                    </p>
                    <p className="text-sm text-muted-foreground">
                      Stock: {product.stock}
                    </p>
                  </div>

                  <ProductActions productId={product.id} productName={product.name} />
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
