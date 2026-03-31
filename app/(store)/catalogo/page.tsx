import { prisma } from '@/lib/prisma';
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import Image from 'next/image';
import Link from 'next/link';
import { formatPrice } from '@/lib/utils';

// Revalidar cada 60 segundos (ISR)
export const revalidate = 60;

export default async function CatalogoPage() {
  const products = await prisma.product.findMany({
    where: { active: true },
    include: { category: true },
    orderBy: { createdAt: 'desc' },
    take: 50, // Limitar a 50 productos inicialmente
  });

  const categories = await prisma.category.findMany({
    orderBy: { name: 'asc' },
  });

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="mb-8">
        <h1 className="text-4xl font-bold">Catálogo de Productos</h1>
        <p className="mt-2 text-muted-foreground">
          Descubre nuestra selección de dulces mexicanos
        </p>
      </div>

      {/* Filters */}
      <div className="mb-8 flex flex-wrap gap-2">
        <Button variant="outline">Todos</Button>
        {categories.map((category) => (
          <Button key={category.id} variant="ghost">
            {category.name}
          </Button>
        ))}
      </div>

      {/* Products Grid */}
      <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
        {products.map((product) => (
          <Card key={product.id} className="overflow-hidden">
            <CardHeader className="p-0">
              <div className="relative aspect-square">
                <Image
                  src={product.images[0] || '/placeholder.png'}
                  alt={product.name}
                  fill
                  className="object-cover"
                />
              </div>
            </CardHeader>
            <CardContent className="p-4">
              <CardTitle className="line-clamp-2 text-lg">{product.name}</CardTitle>
              {product.description && (
                <p className="mt-2 line-clamp-2 text-sm text-muted-foreground">
                  {product.description}
                </p>
              )}
              <div className="mt-4 space-y-1">
                <div className="flex items-baseline gap-2">
                  <span className="text-2xl font-bold">
                    {formatPrice(Number(product.price))}
                  </span>
                  <span className="text-sm text-muted-foreground">menudeo</span>
                </div>
                <div className="text-sm text-muted-foreground">
                  {formatPrice(Number(product.wholesalePrice))} mayoreo ({product.minWholesale}+ pzas)
                </div>
              </div>
            </CardContent>
            <CardFooter className="p-4 pt-0">
              <Link href={`/catalogo/${product.slug}`} className="w-full">
                <Button className="w-full">Ver Detalles</Button>
              </Link>
            </CardFooter>
          </Card>
        ))}
      </div>

      {products.length === 0 && (
        <div className="py-16 text-center">
          <p className="text-muted-foreground">No hay productos disponibles en este momento.</p>
        </div>
      )}
    </div>
  );
}
