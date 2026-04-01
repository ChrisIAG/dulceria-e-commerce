'use client';

import { useState, useEffect } from 'react';
import { useSearchParams } from 'next/navigation';
import Link from 'next/link';
import Image from 'next/image';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';
import { Search, ArrowLeft } from 'lucide-react';
import { formatPrice } from '@/lib/utils';
import AddToCartButton from '@/components/store/add-to-cart-button';

interface Product {
  id: string;
  name: string;
  slug: string;
  description: string | null;
  priceRetail: number;
  priceWholesale: number | null;
  wholesaleMinQty: number | null;
  stock: number;
  images: string[];
  category: {
    name: string;
    slug: string;
  } | null;
}

export default function BuscarPage() {
  const searchParams = useSearchParams();
  const query = searchParams?.get('q') || '';
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    if (query) {
      searchProducts();
    }
  }, [query]);

  const searchProducts = async () => {
    setLoading(true);
    setError('');

    try {
      const response = await fetch(`/api/search?q=${encodeURIComponent(query)}&limit=50`);
      if (!response.ok) throw new Error('Error al buscar');
      
      const data = await response.json();
      setProducts(data.products || []);
    } catch (err) {
      setError('Error al realizar la búsqueda');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  if (!query) {
    return (
      <div className="container mx-auto px-4 py-16 text-center">
        <Search className="mx-auto h-16 w-16 text-muted-foreground mb-4" />
        <h1 className="text-2xl font-bold mb-2">Buscar Productos</h1>
        <p className="text-muted-foreground">
          Usa el buscador para encontrar tus dulces favoritos
        </p>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <Link href="/catalogo">
        <Button variant="ghost" className="mb-4">
          <ArrowLeft className="mr-2 h-4 w-4" />
          Volver al Catálogo
        </Button>
      </Link>

      <div className="mb-8">
        <h1 className="text-4xl font-bold mb-2">
          Resultados para: "{query}"
        </h1>
        {!loading && (
          <p className="text-muted-foreground">
            {products.length === 0
              ? 'No se encontraron productos'
              : `${products.length} ${products.length === 1 ? 'producto encontrado' : 'productos encontrados'}`}
          </p>
        )}
      </div>

      {error && (
        <Card className="p-6 mb-6 border-red-200 bg-red-50">
          <p className="text-red-800 text-center">{error}</p>
        </Card>
      )}

      {loading ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
          {[1, 2, 3, 4, 5, 6, 7, 8].map((i) => (
            <Card key={i} className="overflow-hidden">
              <Skeleton className="h-48 w-full" />
              <div className="p-4 space-y-2">
                <Skeleton className="h-4 w-3/4" />
                <Skeleton className="h-4 w-1/2" />
                <Skeleton className="h-10 w-full" />
              </div>
            </Card>
          ))}
        </div>
      ) : products.length === 0 ? (
        <Card className="p-12 text-center">
          <Search className="mx-auto h-16 w-16 text-muted-foreground mb-4" />
          <h3 className="text-xl font-semibold mb-2">
            No se encontraron productos
          </h3>
          <p className="text-muted-foreground mb-6">
            Intenta con otras palabras clave o revisa nuestra oferta completa
          </p>
          <Link href="/catalogo">
            <Button>Ver Catálogo Completo</Button>
          </Link>
        </Card>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
          {products.map((product) => (
            <Card key={product.id} className="group overflow-hidden hover:shadow-lg transition-shadow">
              <Link href={`/catalogo/${product.slug}`}>
                <div className="relative aspect-square overflow-hidden bg-muted">
                  <Image
                    src={product.images[0] || '/placeholder.png'}
                    alt={product.name}
                    fill
                    className="object-cover transition-transform group-hover:scale-105"
                    sizes="(max-width: 640px) 100vw, (max-width: 768px) 50vw, (max-width: 1024px) 33vw, 25vw"
                  />
                  {product.stock === 0 && (
                    <div className="absolute inset-0 bg-black/50 flex items-center justify-center">
                      <span className="bg-red-600 text-white px-3 py-1 rounded-full text-sm font-semibold">
                        Agotado
                      </span>
                    </div>
                  )}
                </div>
              </Link>

              <div className="p-4">
                {product.category && (
                  <p className="text-xs text-muted-foreground mb-1">
                    {product.category.name}
                  </p>
                )}
                <Link href={`/catalogo/${product.slug}`}>
                  <h3 className="font-semibold mb-2 line-clamp-2 hover:text-primary transition-colors min-h-[2.5rem]">
                    {product.name}
                  </h3>
                </Link>

                <div className="mb-3">
                  <p className="text-2xl font-bold text-primary">
                    {formatPrice(product.priceRetail)}
                  </p>
                  {product.priceWholesale && product.wholesaleMinQty && (
                    <p className="text-xs text-muted-foreground">
                      Mayoreo: {formatPrice(product.priceWholesale)} (desde {product.wholesaleMinQty} pzs)
                    </p>
                  )}
                </div>

                <AddToCartButton
                  product={{
                    id: product.id,
                    name: product.name,
                    slug: product.slug,
                    price: product.priceRetail,
                    wholesalePrice: product.priceWholesale ?? product.priceRetail,
                    minWholesale: product.wholesaleMinQty || 12,
                    stock: product.stock,
                    images: product.images.length > 0 ? product.images : ['/placeholder.png'],
                  }}
                />
              </div>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
