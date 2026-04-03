'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useCartStore } from '@/store/cart';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { formatPrice, calculatePrice } from '@/lib/utils';
import { Loader2 } from 'lucide-react';
import { useHydration } from '@/hooks/use-hydration';
import { CouponInput } from '@/components/store/coupon-input';
import { beginCheckout } from '@/lib/analytics';

export default function CheckoutPage() {
  const hydrated = useHydration();
  const router = useRouter();
  const { items, getSubtotal, clearCart } = useCartStore();
  const [loading, setLoading] = useState(false);
  const [appliedCoupon, setAppliedCoupon] = useState<{
    id: string;
    code: string;
    discountType: 'PERCENTAGE' | 'FIXED';
    discountValue: number;
    discountAmount: number;
  } | null>(null);
  const [formData, setFormData] = useState({
    customerName: '',
    customerEmail: '',
    customerPhone: '',
    street: '',
    city: '',
    state: '',
    zipCode: '',
  });

  const subtotal = getSubtotal();
  const discount = appliedCoupon?.discountAmount || 0;
  const total = subtotal - discount;

  // Track begin_checkout event when user submits the form
  useEffect(() => {
    if (hydrated && items.length > 0) {
      beginCheckout(
        items.map((item) => ({
          item_id: item.productId,
          item_name: item.name,
          price: item.price,
          quantity: item.quantity,
        })),
        total
      );
    }
  }, [hydrated, items, total]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      console.log('[Checkout] Sending request to create Stripe session...');
      
      const response = await fetch('/api/stripe/create-session', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          items: items.map((item) => ({
            productId: item.productId,
            quantity: item.quantity,
          })),
          customerName: formData.customerName,
          customerEmail: formData.customerEmail,
          customerPhone: formData.customerPhone,
          shippingAddress: {
            street: formData.street,
            city: formData.city,
            state: formData.state,
            zipCode: formData.zipCode,
            country: 'MX',
          },
          couponId: appliedCoupon?.id || null,
          couponCode: appliedCoupon?.code || null,
          discountAmount: discount,
        }),
      });

      console.log('[Checkout] Response status:', response.status);

      if (!response.ok) {
        const errorData = await response.json();
        console.error('[Checkout] Error response:', errorData);
        throw new Error(errorData.message || errorData.error || `Error ${response.status}`);
      }

      const data = await response.json();
      console.log('[Checkout] Session created:', data);

      if (data.url) {
        console.log('[Checkout] Redirecting to Stripe...');
        clearCart();
        window.location.href = data.url;
      } else {
        throw new Error('No se recibió URL de pago de Stripe');
      }
    } catch (error) {
      console.error('[Checkout] Error:', error);
      const errorMessage = error instanceof Error ? error.message : 'Error desconocido';
      alert(`Error al procesar el pago:\n${errorMessage}\n\nPor favor, verifica la consola del servidor para más detalles.`);
    } finally {
      setLoading(false);
    }
  };

  // Esperar a que el store se hidrate
  if (!hydrated) {
    return (
      <div className="container mx-auto px-4 py-16 text-center">
        <Loader2 className="h-8 w-8 animate-spin mx-auto" />
      </div>
    );
  }

  if (items.length === 0) {
    router.push('/carrito');
    return null;
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="mb-8 text-4xl font-bold">Checkout</h1>

      <div className="grid gap-8 lg:grid-cols-3">
        {/* Formulario */}
        <div className="lg:col-span-2">
          <form onSubmit={handleSubmit} className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Información de Contacto</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <label className="block text-sm font-medium mb-2">
                    Nombre Completo *
                  </label>
                  <Input
                    required
                    value={formData.customerName}
                    onChange={(e) =>
                      setFormData({ ...formData, customerName: e.target.value })
                    }
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-2">Email *</label>
                  <Input
                    type="email"
                    required
                    value={formData.customerEmail}
                    onChange={(e) =>
                      setFormData({ ...formData, customerEmail: e.target.value })
                    }
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-2">
                    Teléfono *
                  </label>
                  <Input
                    type="tel"
                    required
                    value={formData.customerPhone}
                    onChange={(e) =>
                      setFormData({ ...formData, customerPhone: e.target.value })
                    }
                  />
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Dirección de Envío</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <label className="block text-sm font-medium mb-2">
                    Calle y Número *
                  </label>
                  <Input
                    required
                    value={formData.street}
                    onChange={(e) =>
                      setFormData({ ...formData, street: e.target.value })
                    }
                  />
                </div>
                <div className="grid gap-4 md:grid-cols-2">
                  <div>
                    <label className="block text-sm font-medium mb-2">
                      Ciudad *
                    </label>
                    <Input
                      required
                      value={formData.city}
                      onChange={(e) =>
                        setFormData({ ...formData, city: e.target.value })
                      }
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium mb-2">
                      Estado *
                    </label>
                    <Input
                      required
                      value={formData.state}
                      onChange={(e) =>
                        setFormData({ ...formData, state: e.target.value })
                      }
                    />
                  </div>
                </div>
                <div>
                  <label className="block text-sm font-medium mb-2">
                    Código Postal *
                  </label>
                  <Input
                    required
                    value={formData.zipCode}
                    onChange={(e) =>
                      setFormData({ ...formData, zipCode: e.target.value })
                    }
                  />
                </div>
              </CardContent>
            </Card>

            <Button type="submit" className="w-full" size="lg" disabled={loading}>
              {loading ? (
                <>
                  <Loader2 className="mr-2 h-5 w-5 animate-spin" />
                  Procesando...
                </>
              ) : (
                'Continuar al Pago'
              )}
            </Button>
          </form>
        </div>

        {/* Resumen */}
        <div>
          <Card className="sticky top-20">
            <CardHeader>
              <CardTitle>Resumen del Pedido</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                {items.map((item) => {
                  const price = calculatePrice(
                    item.quantity,
                    item.price,
                    item.wholesalePrice,
                    item.minWholesale
                  );
                  return (
                    <div key={item.id} className="flex justify-between text-sm">
                      <span className="text-muted-foreground">
                        {item.name} x{item.quantity}
                      </span>
                      <span>{formatPrice(price * item.quantity)}</span>
                    </div>
                  );
                })}
              </div>

              <div className="border-t pt-4 space-y-2">
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Subtotal</span>
                  <span>{formatPrice(subtotal)}</span>
                </div>
                {discount > 0 && (
                  <div className="flex justify-between text-green-600">
                    <span>Descuento</span>
                    <span>-{formatPrice(discount)}</span>
                  </div>
                )}
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Envío</span>
                  <span>Calculado en pago</span>
                </div>
              </div>

              <CouponInput
                subtotal={subtotal}
                onCouponApplied={(coupon) => setAppliedCoupon(coupon)}
                onCouponRemoved={() => setAppliedCoupon(null)}
                appliedCoupon={appliedCoupon}
              />

              <div className="border-t pt-4">
                <div className="flex justify-between text-lg font-bold">
                  <span>Total</span>
                  <span>{formatPrice(total)}</span>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
