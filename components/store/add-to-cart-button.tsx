'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { useCartStore } from '@/store/cart';
import { ShoppingCart, Plus, Minus } from 'lucide-react';
import { addToCart as trackAddToCart } from '@/lib/analytics';

interface Product {
  id: string;
  name: string;
  slug: string;
  images: string[];
  price: number;
  wholesalePrice: number;
  minWholesale: number;
  stock: number;
}

interface AddToCartButtonProps {
  product: Product;
}

export default function AddToCartButton({ product }: AddToCartButtonProps) {
  const [quantity, setQuantity] = useState(1);
  const addItem = useCartStore((state) => state.addItem);

  const handleAddToCart = () => {
    // Track add_to_cart event in Google Analytics
    trackAddToCart({
      id: product.id,
      name: product.name,
      price: Number(product.price),
      quantity: quantity,
    });

    for (let i = 0; i < quantity; i++) {
      addItem({
        id: product.id,
        productId: product.id,
        name: product.name,
        slug: product.slug,
        image: product.images[0] || '/placeholder.png',
        price: Number(product.price),
        wholesalePrice: Number(product.wholesalePrice),
        minWholesale: product.minWholesale,
        stock: product.stock,
      });
    }
    setQuantity(1);
  };

  const increment = () => {
    if (quantity < product.stock) {
      setQuantity(quantity + 1);
    }
  };

  const decrement = () => {
    if (quantity > 1) {
      setQuantity(quantity - 1);
    }
  };

  if (product.stock === 0) {
    return (
      <Button disabled className="w-full">
        Agotado
      </Button>
    );
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center gap-4">
        <div className="flex items-center border rounded-lg">
          <Button
            variant="ghost"
            size="icon"
            onClick={decrement}
            disabled={quantity <= 1}
          >
            <Minus className="h-4 w-4" />
          </Button>
          <Input
            type="number"
            value={quantity}
            onChange={(e) => {
              const val = parseInt(e.target.value) || 1;
              setQuantity(Math.min(Math.max(1, val), product.stock));
            }}
            className="w-20 border-0 text-center"
          />
          <Button
            variant="ghost"
            size="icon"
            onClick={increment}
            disabled={quantity >= product.stock}
          >
            <Plus className="h-4 w-4" />
          </Button>
        </div>

        <Button onClick={handleAddToCart} className="flex-1" size="lg">
          <ShoppingCart className="mr-2 h-5 w-5" />
          Agregar al Carrito
        </Button>
      </div>
    </div>
  );
}
