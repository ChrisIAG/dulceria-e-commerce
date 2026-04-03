'use client';

import { useState, useEffect } from 'react';
import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import { Heart } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import { addToWishlist as trackAddToWishlist } from '@/lib/analytics';

interface WishlistButtonProps {
  productId: string;
  variant?: 'default' | 'icon';
  className?: string;
  // Datos opcionales del producto para analytics
  productName?: string;
  productPrice?: number;
  productCategory?: string;
}

export default function WishlistButton({
  productId,
  variant = 'icon',
  className,
  productName,
  productPrice,
  productCategory,
}: WishlistButtonProps) {
  const { data: session, status } = useSession();
  const router = useRouter();
  const [isInWishlist, setIsInWishlist] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  // Verificar si el producto está en wishlist al cargar
  useEffect(() => {
    if (session?.user?.id) {
      checkWishlistStatus();
    }
  }, [session, productId]);

  const checkWishlistStatus = async () => {
    try {
      const response = await fetch('/api/wishlist');
      if (response.ok) {
        const data = await response.json();
        const inList = data.items.some(
          (item: any) => item.productId === productId
        );
        setIsInWishlist(inList);
      }
    } catch (error) {
      console.error('Error al verificar wishlist:', error);
    }
  };

  const handleToggle = async (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();

    // Verificar autenticación
    if (status === 'unauthenticated') {
      router.push('/auth/signin');
      return;
    }

    if (status === 'loading' || isLoading) {
      return;
    }

    setIsLoading(true);

    try {
      if (isInWishlist) {
        // Eliminar de wishlist
        const response = await fetch(`/api/wishlist/${productId}`, {
          method: 'DELETE',
        });

        if (response.ok) {
          setIsInWishlist(false);
        } else {
          const data = await response.json();
          throw new Error(data.error || 'Error al eliminar de favoritos');
        }
      } else {
        // Agregar a wishlist
        const response = await fetch('/api/wishlist', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ productId }),
        });

        if (response.ok) {
          setIsInWishlist(true);
          
          // Track add to wishlist event (solo si tenemos los datos del producto)
          if (productName && productPrice !== undefined) {
            trackAddToWishlist({
              id: productId,
              name: productName,
              category: productCategory,
              price: productPrice,
            });
          }
        } else {
          const data = await response.json();
          throw new Error(data.error || 'Error al agregar a favoritos');
        }
      }
    } catch (error: any) {
      console.error('Error al actualizar wishlist:', error);
      // Podríamos mostrar un toast aquí
    } finally {
      setIsLoading(false);
    }
  };

  if (variant === 'icon') {
    return (
      <Button
        variant="ghost"
        size="icon"
        onClick={handleToggle}
        disabled={isLoading}
        className={cn(
          'transition-colors',
          isInWishlist && 'text-red-500 hover:text-red-600',
          className
        )}
        aria-label={
          isInWishlist ? 'Quitar de favoritos' : 'Agregar a favoritos'
        }
      >
        <Heart
          className={cn(
            'h-5 w-5 transition-all',
            isInWishlist && 'fill-red-500'
          )}
        />
      </Button>
    );
  }

  return (
    <Button
      variant={isInWishlist ? 'default' : 'outline'}
      onClick={handleToggle}
      disabled={isLoading}
      className={cn(className)}
    >
      <Heart
        className={cn(
          'h-4 w-4 mr-2',
          isInWishlist && 'fill-current'
        )}
      />
      {isInWishlist ? 'En favoritos' : 'Agregar a favoritos'}
    </Button>
  );
}
