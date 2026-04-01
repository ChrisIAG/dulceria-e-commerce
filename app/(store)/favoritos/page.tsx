'use client';

import { useEffect, useState } from 'react';
import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import Image from 'next/image';
import Link from 'next/link';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Heart, ShoppingCart, Trash2, AlertCircle } from 'lucide-react';
import { formatPrice } from '@/lib/utils';
import AddToCartButton from '@/components/store/add-to-cart-button';

interface WishlistItem {
  id: string;
  productId: string;
  createdAt: string;
  product: {
    id: string;
    name: string;
    slug: string;
    description: string | null;
    price: number;
    wholesalePrice: number | null;
    minWholesale: number | null;
    stock: number;
    images: string[];
    active: boolean;
    category: {
      id: string;
      name: string;
    } | null;
  };
}

export default function FavoritosPage() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const [items, setItems] = useState<WishlistItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (status === 'unauthenticated') {
      router.push('/auth/signin');
      return;
    }

    if (status === 'authenticated') {
      fetchWishlist();
    }
  }, [status]);

  const fetchWishlist = async () => {
    setIsLoading(true);
    setError(null);

    try {
      const response = await fetch('/api/wishlist');

      if (!response.ok) {
        throw new Error('Error al cargar favoritos');
      }

      const data = await response.json();
      setItems(data.items);
    } catch (err: any) {
      setError(err.message || 'Error al cargar favoritos');
    } finally {
      setIsLoading(false);
    }
  };

  const handleRemove = async (productId: string) => {
    try {
      const response = await fetch(`/api/wishlist/${productId}`, {
        method: 'DELETE',
      });

      if (!response.ok) {
        throw new Error('Error al eliminar de favoritos');
      }

      // Actualizar lista
      setItems((prev) => prev.filter((item) => item.productId !== productId));
    } catch (err: any) {
      alert(err.message || 'Error al eliminar de favoritos');
    }
  };

  if (status === 'loading' || isLoading) {
    return (
      <div className="container mx-auto px-4 py-8">
        <Skeleton className="h-10 w-64 mb-6" />
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {[...Array(6)].map((_, i) => (
            <Skeleton key={i} className="h-96 w-full" />
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      {/* Header */}
      <div className="flex items-center gap-3 mb-6">
        <Heart className="h-8 w-8 text-red-500 fill-red-500" />
        <div>
          <h1 className="text-3xl font-bold">Mis Favoritos</h1>
          <p className="text-gray-600">
            {items.length} {items.length === 1 ? 'producto' : 'productos'}
          </p>
        </div>
      </div>

      {/* Error */}
      {error && (
        <Alert variant="destructive" className="mb-6">
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}

      {/* Empty state */}
      {!isLoading && items.length === 0 && (
        <Card className="p-12">
          <div className="flex flex-col items-center gap-4 text-center">
            <Heart className="h-16 w-16 text-gray-300" />
            <div>
              <h2 className="text-2xl font-bold mb-2">
                No tienes productos favoritos
              </h2>
              <p className="text-gray-600 mb-4">
                Agrega productos a tu lista de favoritos para encontrarlos fácilmente
              </p>
            </div>
            <Button asChild>
              <Link href="/catalogo">Explorar catálogo</Link>
            </Button>
          </div>
        </Card>
      )}

      {/* Grid de productos */}
      {items.length > 0 && (
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {items.map((item) => (
            <Card key={item.id} className="overflow-hidden group">
              <div className="relative aspect-square">
                <Link href={`/catalogo/${item.product.slug}`}>
                  <Image
                    src={item.product.images[0] || '/placeholder.png'}
                    alt={item.product.name}
                    fill
                    className="object-cover transition-transform group-hover:scale-105"
                  />
                </Link>

                {/* Badge de agotado */}
                {item.product.stock === 0 && (
                  <Badge
                    variant="destructive"
                    className="absolute top-2 left-2"
                  >
                    Agotado
                  </Badge>
                )}

                {/* Botón de eliminar */}
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={() => handleRemove(item.product.id)}
                  className="absolute top-2 right-2 bg-white/90 hover:bg-white"
                  aria-label="Eliminar de favoritos"
                >
                  <Trash2 className="h-4 w-4 text-red-500" />
                </Button>
              </div>

              <CardContent className="p-4 space-y-3">
                {/* Categoría */}
                {item.product.category && (
                  <Badge variant="secondary" className="text-xs">
                    {item.product.category.name}
                  </Badge>
                )}

                {/* Nombre */}
                <Link href={`/catalogo/${item.product.slug}`}>
                  <h3 className="font-semibold line-clamp-2 hover:text-purple-600">
                    {item.product.name}
                  </h3>
                </Link>

                {/* Precios */}
                <div className="space-y-1">
                  <div className="flex items-baseline gap-2">
                    <span className="text-xl font-bold">
                      {formatPrice(item.product.price)}
                    </span>
                    <span className="text-xs text-gray-500">menudeo</span>
                  </div>

                  {item.product.wholesalePrice && (
                    <div className="flex items-baseline gap-2">
                      <span className="text-lg font-bold text-purple-600">
                        {formatPrice(item.product.wholesalePrice)}
                      </span>
                      <span className="text-xs text-gray-500">
                        mayoreo (desde {item.product.minWholesale} pzs)
                      </span>
                    </div>
                  )}
                </div>

                {/* Stock */}
                <p className="text-sm text-gray-600">
                  {item.product.stock > 0
                    ? `${item.product.stock} disponibles`
                    : 'Sin stock'}
                </p>

                {/* Botón agregar al carrito */}
                {item.product.stock > 0 ? (
                  <AddToCartButton
                    product={{
                      id: item.product.id,
                      name: item.product.name,
                      slug: item.product.slug,
                      price: item.product.price,
                      wholesalePrice: item.product.wholesalePrice || item.product.price,
                      minWholesale: item.product.minWholesale || 12,
                      stock: item.product.stock,
                      images: item.product.images,
                    }}
                  />
                ) : (
                  <Button disabled variant="secondary" className="w-full">
                    Agotado
                  </Button>
                )}
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
