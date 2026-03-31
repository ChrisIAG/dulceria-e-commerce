import { prisma } from '@/lib/prisma';
import { notFound } from 'next/navigation';
import Image from 'next/image';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { formatPrice } from '@/lib/utils';
import AddToCartButton from '@/components/store/add-to-cart-button';

export const dynamic = 'force-dynamic'; // Evita pre-render durante build

interface ProductPageProps {
  params: {
    slug: string;
  };
}

export async function generateStaticParams() {
  // Durante el build sin DB, retornar array vacío
  // Las páginas se generarán on-demand
  try {
    const products = await prisma.product.findMany({
      where: { active: true },
      select: { slug: true },
    });

    return products.map((product: any) => ({
      slug: product.slug,
    }));
  } catch (error) {
    console.warn('Could not generate static params, will use on-demand rendering');
    return [];
  }
}

export default async function ProductPage({ params }: ProductPageProps) {
  const product = await prisma.product.findUnique({
    where: { slug: params.slug },
    include: { category: true },
  });

  if (!product || !product.active) {
    notFound();
  }

  // Convert Decimal to number for client component
  const productForClient = {
    ...product,
    price: Number(product.price),
    wholesalePrice: Number(product.wholesalePrice),
    minWholesale: product.minWholesale || 12,
  };

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="grid gap-8 md:grid-cols-2">
        {/* Images */}
        <div className="space-y-4">
          <div className="relative aspect-square overflow-hidden rounded-lg">
            <Image
              src={product.images[0] || '/placeholder.png'}
              alt={product.name}
              fill
              className="object-cover"
              priority
            />
          </div>
          {product.images.length > 1 && (
            <div className="grid grid-cols-4 gap-2">
              {product.images.slice(1, 5).map((image, index) => (
                <div key={index} className="relative aspect-square overflow-hidden rounded-lg">
                  <Image src={image} alt={`${product.name} ${index + 2}`} fill className="object-cover" />
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Info */}
        <div className="space-y-6">
          <div>
            {product.category && (
              <p className="text-sm text-muted-foreground">{product.category.name}</p>
            )}
            <h1 className="text-4xl font-bold">{product.name}</h1>
          </div>

          {product.description && (
            <p className="text-muted-foreground">{product.description}</p>
          )}

          {/* Pricing */}
          <Card>
            <CardContent className="p-6 space-y-4">
              <div>
                <div className="flex items-baseline gap-2">
                  <span className="text-3xl font-bold">
                    {formatPrice(Number(product.price))}
                  </span>
                  <span className="text-muted-foreground">por pieza</span>
                </div>
                <p className="mt-1 text-sm text-muted-foreground">Precio menudeo</p>
              </div>

              <div className="rounded-lg bg-primary/10 p-4">
                <div className="flex items-baseline gap-2">
                  <span className="text-2xl font-bold text-primary">
                    {formatPrice(Number(product.wholesalePrice))}
                  </span>
                  <span className="text-sm">por pieza</span>
                </div>
                <p className="mt-1 text-sm font-medium">
                  Precio mayoreo (desde {product.minWholesale} piezas)
                </p>
              </div>

              <div className="flex items-center justify-between text-sm">
                <span className="text-muted-foreground">Disponibilidad:</span>
                <span className={product.stock > 0 ? 'text-green-600' : 'text-red-600'}>
                  {product.stock > 0 ? `${product.stock} en stock` : 'Agotado'}
                </span>
              </div>
            </CardContent>
          </Card>

          {/* Add to Cart */}
          <AddToCartButton product={productForClient} />
        </div>
      </div>
    </div>
  );
}
