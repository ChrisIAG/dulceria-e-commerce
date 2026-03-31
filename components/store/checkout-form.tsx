'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { loadStripe } from '@stripe/stripe-js';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Separator } from '@/components/ui/separator';
import { Badge } from '@/components/ui/badge';
import { ChevronLeft, ChevronRight, CreditCard, Loader2 } from 'lucide-react';
import { useCartStore } from '@/store/cart';
import { formatPrice, calculatePrice } from '@/lib/utils';
import { z } from 'zod';
import { useHydration } from '@/hooks/use-hydration';

const stripePromise = loadStripe(process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY!);

type Step = 1 | 2 | 3 | 4;

const personalDataSchema = z.object({
  name: z.string().min(2, 'Nombre debe tener al menos 2 caracteres'),
  email: z.string().email('Email inválido'),
  phone: z.string().min(10, 'Teléfono debe tener 10 dígitos'),
});

const addressSchema = z.object({
  street: z.string().min(5, 'Calle y número requeridos'),
  city: z.string().min(2, 'Ciudad requerida'),
  state: z.string().min(2, 'Estado requerido'),
  zipCode: z.string().min(5, 'Código postal requerido'),
  country: z.string().default('MX'),
  notes: z.string().optional(),
});

export function CheckoutForm() {
  const hydrated = useHydration();
  const router = useRouter();
  const { items, getSubtotal, clearCart } = useCartStore();
  const [currentStep, setCurrentStep] = useState<Step>(1);
  const [isProcessing, setIsProcessing] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});

  const [personalData, setPersonalData] = useState({
    name: '',
    email: '',
    phone: '',
  });

  const [address, setAddress] = useState({
    street: '',
    city: '',
    state: '',
    zipCode: '',
    country: 'MX',
    notes: '',
  });

  const subtotal = getSubtotal();

  const validateStep = (step: Step): boolean => {
    setErrors({});

    try {
      if (step === 1) {
        personalDataSchema.parse(personalData);
      } else if (step === 2) {
        addressSchema.parse(address);
      }
      return true;
    } catch (error) {
      if (error instanceof z.ZodError) {
        const newErrors: Record<string, string> = {};
        error.issues.forEach((err) => {
          if (err.path[0]) {
            newErrors[err.path[0] as string] = err.message;
          }
        });
        setErrors(newErrors);
      }
      return false;
    }
  };

  const nextStep = () => {
    if (validateStep(currentStep)) {
      setCurrentStep((prev) => Math.min(4, prev + 1) as Step);
    }
  };

  const prevStep = () => {
    setCurrentStep((prev) => Math.max(1, prev - 1) as Step);
  };

  const handlePayment = async () => {
    if (!validateStep(3)) return;

    setIsProcessing(true);

    try {
      // Crear sesión de pago con Stripe
      const response = await fetch('/api/stripe/create-session', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          items: items.map((item) => ({
            productId: item.productId,
            quantity: item.quantity,
          })),
          customerName: personalData.name,
          customerEmail: personalData.email,
          customerPhone: personalData.phone,
          shippingAddress: address,
        }),
      });

      if (!response.ok) {
        throw new Error('Error al crear sesión de pago');
      }

      const data = await response.json();
      const stripe = await stripePromise;

      if (!stripe) {
        throw new Error('Stripe no pudo cargar');
      }

      // Redirigir a Stripe Checkout usando la URL directa
      window.location.href = data.url;
    } catch (error) {
      console.error('Error en el pago:', error);
      alert('Error al procesar el pago. Por favor intenta de nuevo.');
      setIsProcessing(false);
    }
  };

  const stepTitles = {
    1: 'Datos Personales',
    2: 'Dirección de Envío',
    3: 'Revisión del Pedido',
    4: 'Pago',
  };

  // Esperar hidratación del store
  if (!hydrated) {
    return (
      <div className="container mx-auto px-4 py-16 text-center">
        <Loader2 className="h-8 w-8 animate-spin mx-auto" />
      </div>
    );
  }

  // Verificar carrito vacío
  if (items.length === 0) {
    router.push('/carrito');
    return null;
  }

  return (
    <div className="grid gap-8 lg:grid-cols-3">
      {/* Formulario - 2 columnas */}
      <div className="lg:col-span-2 space-y-6">
        {/* Progress Steps */}
        <div className="flex items-center justify-between mb-8">
          {[1, 2, 3, 4].map((step) => (
            <div key={step} className="flex items-center flex-1">
              <div
                className={`flex h-10 w-10 items-center justify-center rounded-full border-2 transition-colors ${
                  currentStep >= step
                    ? 'border-primary bg-primary text-primary-foreground'
                    : 'border-gray-300 text-gray-400'
                }`}
              >
                {step}
              </div>
              {step < 4 && (
                <div
                  className={`h-1 flex-1 mx-2 transition-colors ${
                    currentStep > step ? 'bg-primary' : 'bg-gray-200'
                  }`}
                />
              )}
            </div>
          ))}
        </div>

        <Card>
          <CardHeader>
            <CardTitle>{stepTitles[currentStep]}</CardTitle>
          </CardHeader>
          <CardContent>
            {/* Step 1: Datos Personales */}
            {currentStep === 1 && (
              <div className="space-y-4">
                <div>
                  <Label htmlFor="name">Nombre Completo *</Label>
                  <Input
                    id="name"
                    value={personalData.name}
                    onChange={(e) =>
                      setPersonalData({ ...personalData, name: e.target.value })
                    }
                    className={errors.name ? 'border-red-500' : ''}
                  />
                  {errors.name && (
                    <p className="text-sm text-red-500 mt-1">{errors.name}</p>
                  )}
                </div>

                <div>
                  <Label htmlFor="email">Email *</Label>
                  <Input
                    id="email"
                    type="email"
                    value={personalData.email}
                    onChange={(e) =>
                      setPersonalData({ ...personalData, email: e.target.value })
                    }
                    className={errors.email ? 'border-red-500' : ''}
                  />
                  {errors.email && (
                    <p className="text-sm text-red-500 mt-1">{errors.email}</p>
                  )}
                </div>

                <div>
                  <Label htmlFor="phone">Teléfono *</Label>
                  <Input
                    id="phone"
                    type="tel"
                    value={personalData.phone}
                    onChange={(e) =>
                      setPersonalData({ ...personalData, phone: e.target.value })
                    }
                    placeholder="10 dígitos"
                    className={errors.phone ? 'border-red-500' : ''}
                  />
                  {errors.phone && (
                    <p className="text-sm text-red-500 mt-1">{errors.phone}</p>
                  )}
                </div>
              </div>
            )}

            {/* Step 2: Dirección */}
            {currentStep === 2 && (
              <div className="space-y-4">
                <div>
                  <Label htmlFor="street">Calle y Número *</Label>
                  <Input
                    id="street"
                    value={address.street}
                    onChange={(e) => setAddress({ ...address, street: e.target.value })}
                    className={errors.street ? 'border-red-500' : ''}
                  />
                  {errors.street && (
                    <p className="text-sm text-red-500 mt-1">{errors.street}</p>
                  )}
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="city">Ciudad *</Label>
                    <Input
                      id="city"
                      value={address.city}
                      onChange={(e) => setAddress({ ...address, city: e.target.value })}
                      className={errors.city ? 'border-red-500' : ''}
                    />
                    {errors.city && (
                      <p className="text-sm text-red-500 mt-1">{errors.city}</p>
                    )}
                  </div>

                  <div>
                    <Label htmlFor="state">Estado *</Label>
                    <Input
                      id="state"
                      value={address.state}
                      onChange={(e) => setAddress({ ...address, state: e.target.value })}
                      className={errors.state ? 'border-red-500' : ''}
                    />
                    {errors.state && (
                      <p className="text-sm text-red-500 mt-1">{errors.state}</p>
                    )}
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="zipCode">Código Postal *</Label>
                    <Input
                      id="zipCode"
                      value={address.zipCode}
                      onChange={(e) =>
                        setAddress({ ...address, zipCode: e.target.value })
                      }
                      className={errors.zipCode ? 'border-red-500' : ''}
                    />
                    {errors.zipCode && (
                      <p className="text-sm text-red-500 mt-1">{errors.zipCode}</p>
                    )}
                  </div>

                  <div>
                    <Label htmlFor="country">País</Label>
                    <Input id="country" value="México" disabled />
                  </div>
                </div>

                <div>
                  <Label htmlFor="notes">Notas de Entrega (Opcional)</Label>
                  <Textarea
                    id="notes"
                    value={address.notes}
                    onChange={(e) => setAddress({ ...address, notes: e.target.value })}
                    placeholder="Referencias, instrucciones especiales..."
                    rows={3}
                  />
                </div>
              </div>
            )}

            {/* Step 3: Revisión */}
            {currentStep === 3 && (
              <div className="space-y-6">
                <div>
                  <h3 className="font-semibold mb-2">Datos de Contacto</h3>
                  <div className="text-sm space-y-1 text-muted-foreground">
                    <p>{personalData.name}</p>
                    <p>{personalData.email}</p>
                    <p>{personalData.phone}</p>
                  </div>
                </div>

                <Separator />

                <div>
                  <h3 className="font-semibold mb-2">Dirección de Envío</h3>
                  <div className="text-sm space-y-1 text-muted-foreground">
                    <p>{address.street}</p>
                    <p>
                      {address.city}, {address.state}
                    </p>
                    <p>
                      C.P. {address.zipCode}, {address.country}
                    </p>
                    {address.notes && (
                      <>
                        <p className="mt-2 italic">Notas: {address.notes}</p>
                      </>
                    )}
                  </div>
                </div>

                <Separator />

                <div>
                  <h3 className="font-semibold mb-2">Productos ({items.length})</h3>
                  <div className="text-sm text-muted-foreground">
                    Ver resumen en el panel derecho →
                  </div>
                </div>
              </div>
            )}

            {/* Step 4: Pago */}
            {currentStep === 4 && (
              <div className="space-y-6 text-center py-8">
                <CreditCard className="h-16 w-16 mx-auto text-muted-foreground" />
                <div>
                  <h3 className="text-xl font-semibold mb-2">Pago con Stripe</h3>
                  <p className="text-sm text-muted-foreground">
                    Serás redirigido a la pasarela de pago segura de Stripe
                  </p>
                </div>
                <Badge className="mx-auto">Tarjeta, OXXO y Transferencia</Badge>
              </div>
            )}

            {/* Navigation Buttons */}
            <div className="flex justify-between mt-8 pt-6 border-t">
              <Button
                variant="outline"
                onClick={prevStep}
                disabled={currentStep === 1 || isProcessing}
              >
                <ChevronLeft className="mr-2 h-4 w-4" />
                Anterior
              </Button>

              {currentStep < 3 ? (
                <Button onClick={nextStep}>
                  Siguiente
                  <ChevronRight className="ml-2 h-4 w-4" />
                </Button>
              ) : currentStep === 3 ? (
                <Button onClick={() => setCurrentStep(4)}>
                  Ir a Pagar
                  <ChevronRight className="ml-2 h-4 w-4" />
                </Button>
              ) : (
                <Button onClick={handlePayment} disabled={isProcessing}>
                  {isProcessing ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Procesando...
                    </>
                  ) : (
                    <>
                      Pagar {formatPrice(subtotal)}
                      <CreditCard className="ml-2 h-4 w-4" />
                    </>
                  )}
                </Button>
              )}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Resumen del Pedido - Sidebar derecho - 1 columna */}
      <div className="lg:col-span-1">
        <Card className="sticky top-20">
          <CardHeader>
            <CardTitle>Resumen del Pedido</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {/* Items */}
            <div className="space-y-3 max-h-96 overflow-y-auto">
              {items.map((item) => {
                const price = calculatePrice(
                  item.quantity,
                  item.price,
                  item.wholesalePrice,
                  item.minWholesale
                );
                return (
                  <div key={item.id} className="flex justify-between text-sm">
                    <div className="flex-1">
                      <p className="font-medium">{item.name}</p>
                      <p className="text-muted-foreground">
                        {item.quantity} x {formatPrice(price)}
                      </p>
                    </div>
                    <p className="font-semibold">
                      {formatPrice(price * item.quantity)}
                    </p>
                  </div>
                );
              })}
            </div>

            <Separator />

            {/* Totales */}
            <div className="space-y-2 text-sm">
              <div className="flex justify-between">
                <span className="text-muted-foreground">Subtotal</span>
                <span>{formatPrice(subtotal)}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Envío</span>
                <span className="text-xs">Gratis</span>
              </div>
            </div>

            <Separator />

            <div className="flex justify-between font-bold text-lg">
              <span>Total</span>
              <span className="text-primary">{formatPrice(subtotal)}</span>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
