import { prisma } from '@/lib/prisma';
import { notFound } from 'next/navigation';
import Image from 'next/image';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { formatPrice } from '@/lib/utils';
import AddToCartButton from '@/components/store/add-to-cart-button';
import ProductReviews from '@/components/store/product-reviews';
import ReviewForm from '@/components/store/review-form';
import { ProductViewTracker } from '@/components/store/product-view-tracker';
import {
  generateProductMetadata,
  generateProductJsonLd,
  generateBreadcrumbJsonLd,
} from '@/lib/seo';

// Revalidar cada 60 segundos (ISR)
export const revalidate = 60;

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

export async function generateMetadata({ params }: ProductPageProps) {
  try {
    const product: any = await prisma.product.findUnique({
      where: { slug: params.slug },
      include: {
        category: true,
        reviews: {
          where: { approved: true },
          include: { user: { select: { name: true } } },
        },
      } as any,
    });

    if (!product || !product.active) {
      return {
        title: 'Producto no encontrado',
        description: 'El producto que buscas no está disponible.',
      };
    }

    // Convert Decimal to number
    const productForSeo = {
      ...product,
      price: Number(product.price),
      wholesalePrice: product.wholesalePrice ? Number(product.wholesalePrice) : null,
    };

    return generateProductMetadata(productForSeo, product.reviews);
  } catch (error) {
    console.error('❌ Error generating metadata:', error);
    return {
      title: 'Dulcería Online',
      description: 'Dulces típicos mexicanos al mejor precio.',
    };
  }
}

export default async function ProductPage({ params }: ProductPageProps) {
  const product: any = await prisma.product.findUnique({
    where: { slug: params.slug },
    include: {
      category: true,
      reviews: {
        where: { approved: true },
        include: { user: { select: { name: true } } },
      },
    } as any,
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

  // Generate JSON-LD structured data
  const productJsonLd = generateProductJsonLd(productForClient, product.reviews);
  const breadcrumbJsonLd = generateBreadcrumbJsonLd([
    { name: 'Inicio', url: process.env.NEXTAUTH_URL || 'https://dulceria-online.com' },
    { name: 'Catálogo', url: `${process.env.NEXTAUTH_URL || 'https://dulceria-online.com'}/catalogo` },
    ...(product.category
      ? [
          {
            name: product.category.name,
            url: `${process.env.NEXTAUTH_URL || 'https://dulceria-online.com'}/categoria/${product.category.slug}`,
          },
        ]
      : []),
    {
      name: product.name,
      url: `${process.env.NEXTAUTH_URL || 'https://dulceria-online.com'}/catalogo/${product.slug}`,
    },
  ]);

  return (
    <>
     {/* Analytics Tracking */}
      <ProductViewTracker
        product={{
          id: product.id,
          name: product.name,
          category: product.category?.name,
          price: Number(product.price),
        }}
      />

      {/* JSON-LD Structured Data */}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(productJsonLd) }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbJsonLd) }}
      />

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
              {product.images.slice(1, 5).map((image: string, index: number) => (
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

      {/* Reviews Section */}
      <div className="mt-12 space-y-8">
        <hr />
        
        {/* Review Form */}
        <ReviewForm
          productId={product.id}
          productName={product.name}
        />

        {/* Reviews List */}
        <ProductReviews productId={product.id} />
      </div>
    </div>
    </>
  );
}
