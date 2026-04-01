import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Package, Truck, DollarSign, Users, TrendingDown } from 'lucide-react';
import Link from 'next/link';
import Image from 'next/image';
import { prisma } from '@/lib/prisma';
import { formatPrice } from '@/lib/utils';
import PriceCalculator from '@/components/store/price-calculator';

export const revalidate = 60; // ISR: revalidar cada minuto

async function getFeaturedWholesaleProducts() {
  try {
    const products = await prisma.product.findMany({
      where: {
        active: true,
        wholesalePrice: { not: null },
        stock: { gt: 0 },
      },
      include: {
        category: true,
      },
      orderBy: {
        featured: 'desc',
      },
      take: 6,
    });

    return products.map((p) => ({
      ...p,
      price: Number(p.price),
      wholesalePrice: Number(p.wholesalePrice),
    }));
  } catch (error) {
    console.error('Error fetching wholesale products:', error);
    return [];
  }
}

export default async function MayoreoPage() {
  const products = await getFeaturedWholesaleProducts();
  const exampleProduct = products[0] || {
    name: 'Producto de ejemplo',
    price: 15,
    wholesalePrice: 12,
    minWholesale: 12,
  };
  return (
    <div className="container mx-auto px-4 py-8">
      <div className="mx-auto max-w-6xl">
        {/* Hero Section */}
        <div className="mb-12 text-center">
          <h1 className="mb-4 text-5xl font-bold">Venta al Mayoreo</h1>
          <p className="text-xl text-muted-foreground">
            Precios especiales para revendedores y negocios
          </p>
          <div className="mt-6 flex justify-center gap-4 flex-wrap">
            <Badge className="text-base px-4 py-2">
              🎯 Hasta 30% de descuento
            </Badge>
            <Badge variant="secondary" className="text-base px-4 py-2">
              📦 Desde {exampleProduct.minWholesale || 12} piezas
            </Badge>
          </div>
        </div>

        {/* Benefits Grid */}
        <div className="mb-12 grid gap-6 md:grid-cols-2 lg:grid-cols-4">
          <Card>
            <CardHeader>
              <DollarSign className="h-10 w-10 text-primary mb-2" />
              <CardTitle>Mejores Precios</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-muted-foreground">
                Descuentos automáticos de hasta 30% al comprar cantidades
                mayoristas
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <Package className="h-10 w-10 text-primary mb-2" />
              <CardTitle>Sin Mínimo Total</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-muted-foreground">
                Solo necesitas alcanzar la cantidad mínima por producto, sin
                mínimo de compra total
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <Truck className="h-10 w-10 text-primary mb-2" />
              <CardTitle>Envíos Gratis</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-muted-foreground">
                Envíos sin costo en pedidos mayores a $2,500 MXN
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <Users className="h-10 w-10 text-primary mb-2" />
              <CardTitle>Asesoría</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-muted-foreground">
                Equipo dedicado para ayudarte a maximizar tus ganancias
              </p>
            </CardContent>
          </Card>
        </div>

        {/* Price Calculator */}
        <div className="mb-12">
          <h2 className="text-3xl font-bold mb-6 text-center">
            Calculadora de Ahorros
          </h2>
          <div className="max-w-2xl mx-auto">
            <PriceCalculator
              retailPrice={exampleProduct.price}
              wholesalePrice={exampleProduct.wholesalePrice || exampleProduct.price}
              minWholesale={exampleProduct.minWholesale || 12}
              productName={exampleProduct.name}
            />
          </div>
        </div>

        {/* How it Works */}
        <Card className="mb-12">
          <CardHeader>
            <CardTitle className="text-2xl">¿Cómo Funciona?</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="flex items-start gap-4">
                <div className="flex-shrink-0 w-8 h-8 rounded-full bg-purple-600 text-white flex items-center justify-center font-bold">
                  1
                </div>
                <div>
                  <h3 className="font-semibold mb-1">
                    Navega el catálogo normalmente
                  </h3>
                  <p className="text-sm text-gray-600">
                    No necesitas registro especial. Todos los productos tienen
                    precios de menudeo y mayoreo.
                  </p>
                </div>
              </div>

              <div className="flex items-start gap-4">
                <div className="flex-shrink-0 w-8 h-8 rounded-full bg-purple-600 text-white flex items-center justify-center font-bold">
                  2
                </div>
                <div>
                  <h3 className="font-semibold mb-1">
                    Agrega la cantidad mínima
                  </h3>
                  <p className="text-sm text-gray-600">
                    Cada producto muestra su cantidad mínima para mayoreo
                    (generalmente 12 piezas). En el carrito verás ambos
                    precios.
                  </p>
                </div>
              </div>

              <div className="flex items-start gap-4">
                <div className="flex-shrink-0 w-8 h-8 rounded-full bg-purple-600 text-white flex items-center justify-center font-bold">
                  3
                </div>
                <div>
                  <h3 className="font-semibold mb-1">
                    El descuento se aplica automáticamente
                  </h3>
                  <p className="text-sm text-gray-600">
                    Si tu cantidad alcanza el mínimo, el precio mayorista se
                    aplica automáticamente. ¡Sin códigos ni complicaciones!
                  </p>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Price Comparison Table */}
        {products.length > 0 && (
          <Card className="mb-12">
            <CardHeader>
              <CardTitle className="text-2xl">
                Ejemplos de Precios Reales
              </CardTitle>
              <p className="text-sm text-gray-600">
                Compara el ahorro en productos populares
              </p>
            </CardHeader>
            <CardContent>
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b">
                      <th className="pb-3 text-left font-semibold">Producto</th>
                      <th className="pb-3 text-center font-semibold">
                        Cantidad Mínima
                      </th>
                      <th className="pb-3 text-right font-semibold">Menudeo</th>
                      <th className="pb-3 text-right font-semibold">Mayoreo</th>
                      <th className="pb-3 text-right font-semibold text-green-600">
                        Ahorro
                      </th>
                    </tr>
                  </thead>
                  <tbody className="divide-y">
                    {products.slice(0, 5).map((product) => {
                      const savings =
                        ((product.price - product.wholesalePrice!) / product.price) *
                        100;
                      return (
                        <tr key={product.id} className="hover:bg-gray-50">
                          <td className="py-3">
                            <Link
                              href={`/catalogo/${product.slug}`}
                              className="hover:text-purple-600 font-medium"
                            >
                              {product.name}
                            </Link>
                            {product.category && (
                              <Badge
                                variant="secondary"
                                className="ml-2 text-xs"
                              >
                                {product.category.name}
                              </Badge>
                            )}
                          </td>
                          <td className="py-3 text-center">
                            {product.minWholesale || 12} pzas
                          </td>
                          <td className="py-3 text-right">
                            {formatPrice(product.price)}
                          </td>
                          <td className="py-3 text-right font-bold text-purple-700">
                            {formatPrice(product.wholesalePrice!)}
                          </td>
                          <td className="py-3 text-right">
                            <span className="inline-flex items-center gap-1 text-green-600 font-semibold">
                              <TrendingDown className="h-4 w-4" />
                              {savings.toFixed(0)}%
                            </span>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Featured Products Grid */}
        {products.length > 0 && (
          <div className="mb-12">
            <h2 className="text-3xl font-bold mb-6 text-center">
              Productos Destacados para Mayoreo
            </h2>
            <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
              {products.slice(0, 6).map((product) => {
                const savings =
                  ((product.price - product.wholesalePrice!) / product.price) *
                  100;
                return (
                  <Link
                    key={product.id}
                    href={`/catalogo/${product.slug}`}
                    className="group"
                  >
                    <Card className="overflow-hidden h-full hover:shadow-lg transition-shadow">
                      <div className="relative aspect-square">
                        <Image
                          src={product.images[0] || '/placeholder.png'}
                          alt={product.name}
                          fill
                          className="object-cover group-hover:scale-105 transition-transform"
                        />
                        <Badge
                          variant="destructive"
                          className="absolute top-2 right-2"
                        >
                          -{savings.toFixed(0)}%
                        </Badge>
                      </div>
                      <CardContent className="p-4">
                        <h3 className="font-semibold mb-2 line-clamp-2 group-hover:text-purple-600">
                          {product.name}
                        </h3>
                        {product.category && (
                          <Badge variant="secondary" className="mb-2 text-xs">
                            {product.category.name}
                          </Badge>
                        )}
                        <div className="space-y-1">
                          <div className="flex items-baseline justify-between">
                            <span className="text-sm text-gray-600">
                              Menudeo:
                            </span>
                            <span className="font-medium line-through text-gray-500">
                              {formatPrice(product.price)}
                            </span>
                          </div>
                          <div className="flex items-baseline justify-between">
                            <span className="text-sm font-medium text-purple-700">
                              Mayoreo:
                            </span>
                            <span className="text-xl font-bold text-purple-700">
                              {formatPrice(product.wholesalePrice!)}
                            </span>
                          </div>
                          <p className="text-xs text-gray-500 mt-2">
                            Desde {product.minWholesale || 12} piezas
                          </p>
                        </div>
                      </CardContent>
                    </Card>
                  </Link>
                );
              })}
            </div>
          </div>
        )}

        {/* CTA Final */}
        <Card className="bg-gradient-to-r from-purple-50 to-blue-50">
          <CardContent className="p-8 text-center">
            <h2 className="mb-4 text-3xl font-bold">¿Listo para empezar?</h2>
            <p className="mb-6 text-muted-foreground max-w-2xl mx-auto">
              Los precios de mayoreo se aplican automáticamente al agregar la
              cantidad mínima al carrito. Sin registro especial, sin
              complicaciones.
            </p>
            <div className="flex gap-4 justify-center flex-wrap">
              <Link href="/catalogo">
                <Button size="lg">Ver Catálogo Completo</Button>
              </Link>
              <Link href="/nosotros">
                <Button size="lg" variant="outline">
                  Contactar Ventas
                </Button>
              </Link>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
