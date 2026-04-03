'use client';

import { useEffect } from 'react';
import { viewItem } from '@/lib/analytics';

interface ProductViewTrackerProps {
  product: {
    id: string;
    name: string;
    category?: string;
    price: number;
  };
}

/**
 * Componente para trackear la vista de un producto en GA4
 * Se monta en la página del producto y dispara el evento view_item
 */
export function ProductViewTracker({ product }: ProductViewTrackerProps) {
  useEffect(() => {
    // Track view_item event
    viewItem({
      id: product.id,
      name: product.name,
      category: product.category || 'Sin categoría',
      price: product.price,
    });
  }, [product]);

  // Este componente no renderiza nada
  return null;
}
