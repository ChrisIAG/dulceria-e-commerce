'use client';

import { useEffect, useState } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { X, Plus, Minus, Trash2, ShoppingBag, Loader2, Package, AlertCircle, Sparkles } from 'lucide-react';
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
import { Badge } from '@/components/ui/badge';
import { useCartStore } from '@/store/cart';
import { formatPrice, calculatePrice } from '@/lib/utils';
import { useSession } from 'next-auth/react';
import { useHydration } from '@/hooks/use-hydration';
import { cn } from '@/lib/utils';

interface CartDrawerProps {
  children: React.ReactNode;
}

export function CartDrawer({ children }: CartDrawerProps) {
  const hydrated = useHydration();
  const { items, updateQuantity, removeItem, getSubtotal, clearCart } = useCartStore();
  const { data: session } = useSession();
  const [isClearing, setIsClearing] = useState(false);

  const handleClearCart = () => {
    setIsClearing(true);
    setTimeout(() => {
      clearCart();
      setIsClearing(false);
    }, 300);
  };

  const subtotal = getSubtotal();
  const totalItems = items.reduce((acc, item) => acc + item.quantity, 0);
  
  // Calcular ahorros por precio mayoreo
  const totalSavings = items.reduce((acc, item) => {
    if (item.quantity >= item.minWholesale) {
      const retailTotal = item.price * item.quantity;
      const wholesaleTotal = (item.wholesalePrice || item.price) * item.quantity;
      return acc + (retailTotal - wholesaleTotal);
    }
    return acc;
  }, 0);

  return (
    <Sheet>
      <SheetTrigger asChild>{children}</SheetTrigger>
      <SheetContent className="w-full sm:max-w-lg flex flex-col p-0">
        <SheetHeader className="px-6 pt-6 pb-4 space-y-2">
          <div className="flex items-center justify-between">
            <SheetTitle className="text-2xl font-bold">Tu Carrito</SheetTitle>
            {items.length > 0 && hydrated && (
              <Badge variant="secondary" className="text-sm font-semibold">
                {totalItems} {totalItems === 1 ? 'artículo' : 'artículos'}
              </Badge>
            )}
          </div>
          <SheetDescription>
            {!hydrated
              ? 'Cargando tu carrito...'
              : items.length === 0
              ? 'Aún no has agregado productos'
              : totalSavings > 0
              ? `¡Estás ahorrando ${formatPrice(totalSavings)} con precios mayoreo! 🎉`
              : 'Revisa tus productos antes de continuar'}
          </SheetDescription>
        </SheetHeader>

        {!hydrated ? (
          <div className="flex flex-1 flex-col items-center justify-center">
            <Loader2 className="h-10 w-10 animate-spin text-primary" />
            <p className="mt-4 text-sm text-muted-foreground">Cargando...</p>
          </div>
        ) : items.length === 0 ? (
          <div className="flex flex-1 flex-col items-center justify-center text-center p-8">
            <div className="rounded-full bg-primary/10 p-6 mb-6">
              <ShoppingBag className="h-12 w-12 text-primary" />
            </div>
            <h3 className="text-xl font-bold mb-2">Tu carrito está vacío</h3>
            <p className="text-sm text-muted-foreground mb-8 max-w-xs">
              Descubre nuestra selección de dulces mexicanos y comienza a agregar productos
            </p>
            <Link href="/catalogo">
              <Button size="lg" className="w-full min-w-[200px]">
                Explorar Catálogo
              </Button>
            </Link>
          </div>
        ) : (
          <>
            {/* Lista de items - scrollable */}
            <div className="flex-1 overflow-y-auto px-6">
              <div className="space-y-4 pb-4">
                {items.map((item, index) => {
                  const price = calculatePrice(
                    item.quantity,
                    item.price,
                    item.wholesalePrice,
                    item.minWholesale
                  );
                  const isPriceWholesale = item.quantity >= item.minWholesale;
                  const itemSavings = isPriceWholesale
                    ? (item.price - price) * item.quantity
                    : 0;
                  const isLowStock = item.stock < 10;

                  return (
                    <div
                      key={item.id}
                      className={cn(
                        "group relative flex gap-4 p-4 rounded-lg border bg-card transition-all hover:shadow-md",
                        isClearing && "opacity-50 scale-95"
                      )}
                    >
                      {/* Imagen */}
                      <div className="relative h-24 w-24 flex-shrink-0 overflow-hidden rounded-md border-2 border-border/50">
                        <Image
                          src={item.image}
                          alt={item.name}
                          fill
                          className="object-cover transition-transform group-hover:scale-105"
                          sizes="96px"
                        />
                        {isPriceWholesale && (
                          <div className="absolute top-1 right-1">
                            <Badge className="bg-gradient-to-r from-amber-500 to-orange-500 text-white text-[10px] px-1.5 py-0.5">
                              <Sparkles className="h-2.5 w-2.5 mr-0.5" />
                              Mayoreo
                            </Badge>
                          </div>
                        )}
                      </div>

                      {/* Info */}
                      <div className="flex flex-1 flex-col justify-between min-w-0">
                        <div className="space-y-1">
                          <div className="flex items-start justify-between gap-2">
                            <Link
                              href={`/catalogo/${item.slug}`}
                              className="text-sm font-semibold hover:text-primary transition-colors line-clamp-2 flex-1"
                            >
                              {item.name}
                            </Link>
                            <Button
                              variant="ghost"
                              size="icon"
                              className="h-7 w-7 flex-shrink-0 opacity-0 group-hover:opacity-100 transition-opacity"
                              onClick={() => removeItem(item.productId)}
                            >
                              <Trash2 className="h-3.5 w-3.5 text-destructive" />
                            </Button>
                          </div>

                          {/* Badges informativos */}
                          <div className="flex flex-wrap gap-1.5">
                            {isPriceWholesale && itemSavings > 0 && (
                              <Badge variant="outline" className="text-xs text-green-700 border-green-300 bg-green-50">
                                Ahorras {formatPrice(itemSavings)}
                              </Badge>
                            )}
                            {isLowStock && (
                              <Badge variant="outline" className="text-xs text-orange-700 border-orange-300 bg-orange-50">
                                <AlertCircle className="h-2.5 w-2.5 mr-1" />
                                {item.stock} disponibles
                              </Badge>
                            )}
                            {!isPriceWholesale && item.minWholesale > item.quantity && (
                              <Badge variant="outline" className="text-xs text-blue-700 border-blue-300 bg-blue-50">
                                <Package className="h-2.5 w-2.5 mr-1" />
                                Mayoreo desde {item.minWholesale} pzas
                              </Badge>
                            )}
                          </div>
                        </div>

                        {/* Cantidad y precio */}
                        <div className="flex items-center justify-between mt-3">
                          <div className="flex items-center border-2 rounded-lg overflow-hidden">
                            <Button
                              variant="ghost"
                              size="icon"
                              className="h-8 w-8 rounded-none hover:bg-primary/10"
                              onClick={() =>
                                updateQuantity(item.productId, item.quantity - 1)
                              }
                              disabled={item.quantity <= 1}
                            >
                              <Minus className="h-3.5 w-3.5" />
                            </Button>
                            <span className="px-3 text-sm font-bold min-w-[3rem] text-center">
                              {item.quantity}
                            </span>
                            <Button
                              variant="ghost"
                              size="icon"
                              className="h-8 w-8 rounded-none hover:bg-primary/10"
                              onClick={() =>
                                updateQuantity(item.productId, item.quantity + 1)
                              }
                              disabled={item.quantity >= item.stock}
                            >
                              <Plus className="h-3.5 w-3.5" />
                            </Button>
                          </div>

                          <div className="text-right">
                            <p className="text-base font-bold text-foreground">
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
            </div>

            <Separator />

            {/* Footer con subtotal y botones */}
            <div className="px-6 py-4 space-y-4 border-t bg-muted/30">
              {items.length > 1 && (
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={handleClearCart}
                  className="w-full text-destructive hover:text-destructive hover:bg-destructive/10"
                  disabled={isClearing}
                >
                  {isClearing ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Vaciando...
                    </>
                  ) : (
                    <>
                      <Trash2 className="mr-2 h-4 w-4" />
                      Vaciar Carrito
                    </>
                  )}
                </Button>
              )}

              <div className="space-y-2">
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">Subtotal ({totalItems} artículos)</span>
                  <span className="font-semibold">{formatPrice(subtotal)}</span>
                </div>
                {totalSavings > 0 && (
                  <div className="flex justify-between text-sm">
                    <span className="text-green-700 font-medium">Ahorros mayoreo</span>
                    <span className="text-green-700 font-bold">-{formatPrice(totalSavings)}</span>
                  </div>
                )}
                <div className="flex justify-between text-xs">
                  <span className="text-muted-foreground">Envío</span>
                  <span className="text-muted-foreground">Calculado en checkout</span>
                </div>
              </div>

              <Separator />

              <div className="flex justify-between items-center">
                <span className="text-lg font-bold">Total</span>
                <span className="text-2xl font-bold text-primary">{formatPrice(subtotal)}</span>
              </div>

              <div className="space-y-2">
                <Link href="/checkout" className="block">
                  <Button className="w-full h-11 text-base font-semibold" size="lg">
                    Proceder al Pago
                  </Button>
                </Link>

                <Link href="/carrito" className="block">
                  <Button variant="outline" className="w-full">
                    Ver Carrito Completo
                  </Button>
                </Link>
              </div>
            </div>
          </>
        )}
      </SheetContent>
    </Sheet>
  );
}
