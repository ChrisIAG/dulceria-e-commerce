'use client';

import { useEffect } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { X, Plus, Minus, Trash2, ShoppingBag, Loader2 } from 'lucide-react';
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from '@/components/ui/sheet';
import { Button } from '@/components/ui/button';
import { Separator } from '@/components/ui/separator';
import { useCartStore } from '@/store/cart';
import { formatPrice, calculatePrice } from '@/lib/utils';
import { useSession } from 'next-auth/react';
import { useHydration } from '@/hooks/use-hydration';

interface CartDrawerProps {
  children: React.ReactNode;
}

export function CartDrawer({ children }: CartDrawerProps) {
  const hydrated = useHydration();
  const { items, updateQuantity, removeItem, getSubtotal } = useCartStore();
  const { data: session } = useSession();

  // Sincronizar con BD cuando hay sesión
  useEffect(() => {
    if (session?.user?.id) {
      // TODO: Implementar sincronización con BD
      // Fetch cart from server and merge with local storage
      syncCartWithServer();
    }
  }, [session?.user?.id]);

  const syncCartWithServer = async () => {
    if (!session?.user?.id) return;

    try {
      // Obtener carrito del servidor
      const response = await fetch('/api/cart');
      if (response.ok) {
        const serverCart = await response.json();
        // TODO: Merge logic - combinar carrito local con servidor
        // Por ahora solo trabajamos con localStorage vía Zustand
      }
    } catch (error) {
      console.error('Error syncing cart:', error);
    }
  };

  const subtotal = getSubtotal();

  return (
    <Sheet>
      <SheetTrigger asChild>{children}</SheetTrigger>
      <SheetContent className="w-full sm:max-w-lg flex flex-col">
        <SheetHeader>
          <SheetTitle>Carrito de Compras</SheetTitle>
          <SheetDescription>
            {!hydrated
              ? 'Cargando...'
              : items.length === 0
              ? 'Tu carrito está vacío'
              : `${items.length} producto${items.length !== 1 ? 's' : ''} en tu carrito`}
          </SheetDescription>
        </SheetHeader>

        {!hydrated ? (
          <div className="flex flex-1 flex-col items-center justify-center">
            <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
          </div>
        ) : items.length === 0 ? (
          <div className="flex flex-1 flex-col items-center justify-center text-center p-8">
            <ShoppingBag className="h-16 w-16 text-muted-foreground mb-4" />
            <h3 className="text-lg font-semibold mb-2">Tu carrito está vacío</h3>
            <p className="text-sm text-muted-foreground mb-6">
              Agrega productos de nuestro catálogo
            </p>
            <Link href="/catalogo">
              <Button>Ver Catálogo</Button>
            </Link>
          </div>
        ) : (
          <>
            {/* Lista de items - scrollable */}
            <div className="flex-1 overflow-y-auto py-4 space-y-4">
              {items.map((item) => {
                const price = calculatePrice(
                  item.quantity,
                  item.price,
                  item.wholesalePrice,
                  item.minWholesale
                );
                const isPriceWholesale = item.quantity >= item.minWholesale;

                return (
                  <div key={item.id} className="flex gap-3">
                    {/* Imagen */}
                    <div className="relative h-20 w-20 flex-shrink-0 overflow-hidden rounded-lg border">
                      <Image
                        src={item.image}
                        alt={item.name}
                        fill
                        className="object-cover"
                        sizes="80px"
                      />
                    </div>

                    {/* Info */}
                    <div className="flex flex-1 flex-col justify-between">
                      <div className="flex justify-between">
                        <div className="flex-1 pr-2">
                          <Link
                            href={`/catalogo/${item.slug}`}
                            className="text-sm font-medium hover:text-primary line-clamp-2"
                          >
                            {item.name}
                          </Link>
                          {isPriceWholesale && (
                            <p className="text-xs text-green-600 font-medium mt-1">
                              💼 Precio mayoreo aplicado
                            </p>
                          )}
                        </div>
                        <Button
                          variant="ghost"
                          size="icon"
                          className="h-6 w-6 flex-shrink-0"
                          onClick={() => removeItem(item.productId)}
                        >
                          <Trash2 className="h-3 w-3" />
                        </Button>
                      </div>

                      {/* Cantidad y precio */}
                      <div className="flex items-center justify-between mt-2">
                        <div className="flex items-center border rounded-md">
                          <Button
                            variant="ghost"
                            size="icon"
                            className="h-7 w-7"
                            onClick={() =>
                              updateQuantity(item.productId, item.quantity - 1)
                            }
                            disabled={item.quantity <= 1}
                          >
                            <Minus className="h-3 w-3" />
                          </Button>
                          <span className="px-2 text-sm font-medium min-w-[2rem] text-center">
                            {item.quantity}
                          </span>
                          <Button
                            variant="ghost"
                            size="icon"
                            className="h-7 w-7"
                            onClick={() =>
                              updateQuantity(item.productId, item.quantity + 1)
                            }
                            disabled={item.quantity >= item.stock}
                          >
                            <Plus className="h-3 w-3" />
                          </Button>
                        </div>

                        <div className="text-right">
                          <p className="text-sm font-bold">
                            {formatPrice(price * item.quantity)}
                          </p>
                          <p className="text-xs text-muted-foreground">
                            {formatPrice(price)} c/u
                          </p>
                        </div>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>

            <Separator />

            {/* Footer con subtotal y botón checkout */}
            <div className="space-y-4 pt-4">
              <div className="space-y-2">
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">Subtotal</span>
                  <span className="font-medium">{formatPrice(subtotal)}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">Envío</span>
                  <span className="text-xs">Calculado en checkout</span>
                </div>
              </div>

              <Separator />

              <div className="flex justify-between font-bold text-lg">
                <span>Total</span>
                <span className="text-primary">{formatPrice(subtotal)}</span>
              </div>

              <Link href="/checkout" className="block">
                <Button className="w-full" size="lg">
                  Ir al Checkout
                </Button>
              </Link>

              <Link href="/carrito" className="block">
                <Button variant="outline" className="w-full">
                  Ver Carrito Completo
                </Button>
              </Link>
            </div>
          </>
        )}
      </SheetContent>
    </Sheet>
  );
}
