'use client';

import { useState } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { Card, CardContent, CardFooter } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { ShoppingCart, Star } from 'lucide-react';
import { formatPrice } from '@/lib/utils';
import { useCartStore } from '@/store/cart';
import WishlistButton from './wishlist-button';

interface ProductCardProps {
  product: {
    id: string;
    name: string;
    slug: string;
    images: string[];
    price: number;
    wholesalePrice: number | null;
    minWholesale: number | null;
    stock: number;
    active: boolean;
    featured: boolean;
    avgRating?: number | null;
    reviewCount?: number;
  };
  promotion?: {
    id: string;
    title: string;
    discount: number;
    type: 'PERCENTAGE' | 'FIXED' | 'TWO_FOR_ONE' | 'BUNDLE';
  } | null;
}

export function ProductCard({ product, promotion }: ProductCardProps) {
  const [imageLoaded, setImageLoaded] = useState(false);
  const addItem = useCartStore((state) => state.addItem);
  const [isAdding, setIsAdding] = useState(false);

  const handleAddToCart = async (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    
    if (product.stock === 0) return;
    
    setIsAdding(true);
    addItem({
      id: product.id,
      productId: product.id,
      name: product.name,
      slug: product.slug,
      image: product.images[0] || '/placeholder.png',
      price: Number(product.price),
      wholesalePrice: Number(product.wholesalePrice),
      minWholesale: product.minWholesale || 12,
      stock: product.stock,
    });
    
    // Feedback visual
    setTimeout(() => setIsAdding(false), 500);
  };

  const hasWholesale = product.wholesalePrice && product.minWholesale;
  const isOutOfStock = product.stock === 0;

  return (
    <Link href={`/catalogo/${product.slug}`}>
      <Card className="group overflow-hidden transition-all hover:shadow-lg relative h-full flex flex-col">
        {/* Badges superiores */}
        <div className="absolute top-2 left-2 z-10 flex flex-col gap-1">
          {promotion && (
            <Badge variant="destructive" className="font-semibold">
              {promotion.type === 'PERCENTAGE' && `-${promotion.discount}%`}
              {promotion.type === 'FIXED' && `-${formatPrice(promotion.discount)}`}
              {promotion.type === 'TWO_FOR_ONE' && '2x1'}
              {promotion.type === 'BUNDLE' && promotion.title}
            </Badge>
          )}
          {product.featured && (
            <Badge className="bg-yellow-500 text-white">
              Destacado
            </Badge>
          )}
          {isOutOfStock && (
            <Badge variant="secondary" className="bg-gray-500 text-white">
              Agotado
            </Badge>
          )}
        </div>

        {/* Wishlist button en esquina superior derecha */}
        <div className="absolute top-2 right-2 z-10">
          <WishlistButton productId={product.id} />
        </div>

        {/* Imagen con lazy load */}
        <div className="relative aspect-square overflow-hidden bg-gray-100">
          <Image
            src={product.images[0] || '/placeholder.png'}
            alt={product.name}
            fill
            loading="lazy"
            className={`object-cover transition-all duration-300 group-hover:scale-105 ${
              imageLoaded ? 'opacity-100' : 'opacity-0'
            }`}
            onLoad={() => setImageLoaded(true)}
            sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
          />
          {!imageLoaded && (
            <div className="absolute inset-0 flex items-center justify-center">
              <div className="h-8 w-8 animate-spin rounded-full border-4 border-gray-200 border-t-primary" />
            </div>
          )}
        </div>

        <CardContent className="p-4 flex-1 flex flex-col">
          <h3 className="font-semibold text-lg line-clamp-2 mb-1 group-hover:text-primary transition-colors">
            {product.name}
          </h3>

          {/* Rating */}
          {product.avgRating != null && product.avgRating > 0 && (
            <div className="flex items-center gap-1 mb-2">
              <Star className="h-3.5 w-3.5 fill-yellow-400 text-yellow-400" />
              <span className="text-sm font-medium">{product.avgRating.toFixed(1)}</span>
              {product.reviewCount != null && product.reviewCount > 0 && (
                <span className="text-xs text-muted-foreground">({product.reviewCount})</span>
              )}
            </div>
          )}

          <div className="mt-auto space-y-2">
            {/* Precio menudeo */}
            <div className="flex items-baseline gap-2">
              <span className="text-2xl font-bold text-primary">
                {formatPrice(Number(product.price))}
              </span>
              <span className="text-sm text-muted-foreground">por pieza</span>
            </div>

            {/* Badge mayoreo disponible */}
            {hasWholesale && (
              <Badge variant="outline" className="w-fit border-primary text-primary">
                💼 Mayoreo disponible desde {product.minWholesale} pzas
              </Badge>
            )}
          </div>
        </CardContent>

        <CardFooter className="p-4 pt-0">
          <Button
            onClick={handleAddToCart}
            disabled={isOutOfStock || isAdding}
            className="w-full"
            variant={isOutOfStock ? 'secondary' : 'default'}
          >
            {isAdding ? (
              <>
                <div className="mr-2 h-4 w-4 animate-spin rounded-full border-2 border-background border-t-transparent" />
                Agregando...
              </>
            ) : isOutOfStock ? (
              'Agotado'
            ) : (
              <>
                <ShoppingCart className="mr-2 h-4 w-4" />
                Agregar al carrito
              </>
            )}
          </Button>
        </CardFooter>
      </Card>
    </Link>
  );
}
