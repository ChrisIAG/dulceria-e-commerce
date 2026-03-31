'use client';

import { useState } from 'react';
import { useCartStore } from '@/store/cart';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import Image from 'next/image';
import Link from 'next/link';
import { formatPrice, calculatePrice, cn } from '@/lib/utils';
import { 
  Trash2, 
  Plus, 
  Minus, 
  ShoppingBag, 
  Loader2, 
  Package, 
  AlertCircle, 
  Sparkles,
  TrendingDown,
  ArrowRight
} from 'lucide-react';
import { useHydration } from '@/hooks/use-hydration';

export default function CarritoPage() {
  const hydrated = useHydration();
  const { items, updateQuantity, removeItem, getSubtotal, clearCart } = useCartStore();
  const [isClearing, setIsClearing] = useState(false);

  // Esperar a que el store se hidrate
  if (!hydrated) {
    return (
      <div className="container mx-auto px-4 py-16 text-center">
        <Loader2 className="h-10 w-10 animate-spin mx-auto text-primary" />
        <p className="mt-4 text-muted-foreground">Cargando tu carrito...</p>
      </div>
    );
  }

  if (items.length === 0) {
    return (
      <div className="container mx-auto px-4 py-16">
        <Card className="mx-auto max-w-2xl">
          <CardContent className="flex flex-col items-center p-16 text-center">
            <div className="rounded-full bg-primary/10 p-8 mb-6">
              <ShoppingBag className="h-20 w-20 text-primary" />
            </div>
            <h2 className="text-3xl font-bold mb-3">Tu carrito está vacío</h2>
            <p className="text-muted-foreground mb-8 text-lg max-w-md">
              Explora nuestro catálogo de dulces mexicanos y comienza a agregar productos
            </p>
            <div className="flex gap-4">
              <Link href="/catalogo">
                <Button size="lg" className="min-w-[200px]">
                  Ver Catálogo
                  <ArrowRight className="ml-2 h-5 w-5" />
                </Button>
              </Link>
              <Link href="/promociones">
                <Button size="lg" variant="outline">
                  Ver Promociones
                </Button>
              </Link>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

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
    <div className="container mx-auto px-4 py-8">
      {/* Header */}
      <div className="mb-8">
        <div className="flex items-center justify-between flex-wrap gap-4">
          <div>
            <h1 className="text-4xl font-bold mb-2">Carrito de Compras</h1>
            <p className="text-muted-foreground">
              {totalItems} {totalItems === 1 ? 'artículo' : 'artículos'} en tu carrito
              {totalSavings > 0 && (
                <span className="ml-2 text-green-600 font-semibold">
                  · Ahorrando {formatPrice(totalSavings)} 🎉
                </span>
              )}
            </p>
          </div>
          <div className="flex gap-3">
            <Link href="/catalogo">
              <Button variant="outline">
                Seguir Comprando
              </Button>
            </Link>
            {items.length > 0 && (
              <Button
                variant="ghost"
                onClick={handleClearCart}
                disabled={isClearing}
                className="text-destructive hover:text-destructive hover:bg-destructive/10"
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
          </div>
        </div>
      </div>

      <div className="grid gap-8 lg:grid-cols-3">
        {/* Items */}
        <div className="lg:col-span-2 space-y-4">
          {items.map((item) => {
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
              <Card 
                key={item.id} 
                className={cn(
                  "group overflow-hidden transition-all hover:shadow-lg",
                  isClearing && "opacity-50 scale-95"
                )}
              >
                <CardContent className="p-6">
                  <div className="flex gap-6">
                    {/* Imagen */}
                    <div className="relative h-32 w-32 flex-shrink-0 overflow-hidden rounded-lg border-2 border-border/50">
                      <Image
                        src={item.image}
                        alt={item.name}
                        fill
                        className="object-cover transition-transform group-hover:scale-105"
                        sizes="128px"
                      />
                      {isPriceWholesale && (
                        <div className="absolute top-2 right-2">
                          <Badge className="bg-gradient-to-r from-amber-500 to-orange-500 text-white text-xs px-2 py-1">
                            <Sparkles className="h-3 w-3 mr-1" />
                            Mayoreo
                          </Badge>
                        </div>
                      )}
                    </div>

                    <div className="flex flex-1 flex-col justify-between">
                      <div className="flex justify-between items-start gap-4">
                        <div className="flex-1 space-y-2">
                          <Link href={`/catalogo/${item.slug}`}>
                            <h3 className="text-lg font-bold hover:text-primary transition-colors line-clamp-2">
                              {item.name}
                            </h3>
                          </Link>
                          
                          {/* Badges informativos */}
                          <div className="flex flex-wrap gap-2">
                            {isPriceWholesale && itemSavings > 0 && (
                              <Badge variant="outline" className="text-sm text-green-700 border-green-300 bg-green-50">
                                <TrendingDown className="h-3 w-3 mr-1" />
                                Ahorras {formatPrice(itemSavings)}
                              </Badge>
                            )}
                            {isLowStock && (
                              <Badge variant="outline" className="text-sm text-orange-700 border-orange-300 bg-orange-50">
                                <AlertCircle className="h-3 w-3 mr-1" />
                                Solo {item.stock} disponibles
                              </Badge>
                            )}
                            {!isPriceWholesale && item.minWholesale > item.quantity && (
                              <Badge variant="outline" className="text-sm text-blue-700 border-blue-300 bg-blue-50">
                                <Package className="h-3 w-3 mr-1" />
                                Precio mayoreo desde {item.minWholesale} pzas
                              </Badge>
                            )}
                          </div>
                        </div>

                        <Button
                          variant="ghost"
                          size="icon"
                          className="opacity-70 group-hover:opacity-100 transition-opacity"
                          onClick={() => removeItem(item.productId)}
                        >
                          <Trash2 className="h-5 w-5 text-destructive" />
                        </Button>
                      </div>

                      {/* Controles de cantidad y precio */}
                      <div className="flex items-center justify-between mt-4">
                        <div className="flex items-center border-2 rounded-lg overflow-hidden">
                          <Button
                            variant="ghost"
                            size="icon"
                            className="h-10 w-10 rounded-none hover:bg-primary/10"
                            onClick={() => updateQuantity(item.productId, item.quantity - 1)}
                            disabled={item.quantity <= 1}
                          >
                            <Minus className="h-4 w-4" />
                          </Button>
                          <span className="px-4 text-base font-bold min-w-[4rem] text-center">
                            {item.quantity}
                          </span>
                          <Button
                            variant="ghost"
                            size="icon"
                            className="h-10 w-10 rounded-none hover:bg-primary/10"
                            onClick={() => updateQuantity(item.productId, item.quantity + 1)}
                            disabled={item.quantity >= item.stock}
                          >
                            <Plus className="h-4 w-4" />
                          </Button>
                        </div>

                        <div className="text-right">
                          <p className="text-2xl font-bold text-foreground">
                            {formatPrice(price * item.quantity)}
                          </p>
                          <p className="text-sm text-muted-foreground">
                            {formatPrice(price)} c/u
                          </p>
                        </div>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>

        {/* Summary */}
        <div>
          <Card className="sticky top-20">
            <CardHeader>
              <CardTitle className="text-2xl">Resumen del Pedido</CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              {/* Desglose de precios */}
              <div className="space-y-3">
                <div className="flex justify-between text-base">
                  <span className="text-muted-foreground">
                    Subtotal ({totalItems} {totalItems === 1 ? 'artículo' : 'artículos'})
                  </span>
                  <span className="font-semibold">{formatPrice(subtotal)}</span>
                </div>

                {totalSavings > 0 && (
                  <div className="flex justify-between text-base">
                    <span className="text-green-700 font-medium">
                      <TrendingDown className="inline h-4 w-4 mr-1" />
                      Ahorros mayoreo
                    </span>
                    <span className="text-green-700 font-bold">
                      -{formatPrice(totalSavings)}
                    </span>
                  </div>
                )}

                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">Envío</span>
                  <span className="text-muted-foreground">Calculado en checkout</span>
                </div>
              </div>

              <Separator />

              {/* Total */}
              <div className="flex justify-between items-center">
                <span className="text-xl font-bold">Total</span>
                <span className="text-3xl font-bold text-primary">
                  {formatPrice(subtotal)}
                </span>
              </div>

              {totalSavings > 0 && (
                <div className="p-4 bg-green-50 border border-green-200 rounded-lg">
                  <p className="text-sm text-green-800 font-medium text-center">
                    ¡Estás ahorrando {formatPrice(totalSavings)} con precios mayoreo! 🎉
                  </p>
                </div>
              )}

              {/* Botones de acción */}
              <div className="space-y-3">
                <Link href="/checkout" className="block">
                  <Button className="w-full h-12 text-base font-semibold" size="lg">
                    Proceder al Pago
                    <ArrowRight className="ml-2 h-5 w-5" />
                  </Button>
                </Link>

                <Link href="/catalogo" className="block">
                  <Button variant="outline" className="w-full h-11">
                    Seguir Comprando
                  </Button>
                </Link>
              </div>

              {/* Beneficios */}
              <div className="pt-4 space-y-3 text-sm text-muted-foreground border-t">
                <div className="flex items-center gap-2">
                  <Package className="h-4 w-4 text-primary" />
                  <span>Envío gratis en compras mayores a $500</span>
                </div>
                <div className="flex items-center gap-2">
                  <Sparkles className="h-4 w-4 text-primary" />
                  <span>Precios mayoreo automáticos</span>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
