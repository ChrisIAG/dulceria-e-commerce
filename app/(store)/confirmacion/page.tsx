import { CheckCircle } from 'lucide-react';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Suspense } from 'react';
import { PurchaseTracker } from '@/components/analytics/purchase-tracker';

export default function ConfirmacionPage() {
  return (
    <div className="container mx-auto px-4 py-16">
      {/* Analytics: Rastrear evento de purchase */}
      <Suspense fallback={null}>
        <PurchaseTracker />
      </Suspense>
      
      <Card className="mx-auto max-w-2xl">
        <CardContent className="p-12 text-center">
          <CheckCircle className="mx-auto h-20 w-20 text-green-600 mb-6" />
          <h1 className="text-4xl font-bold mb-4">¡Pedido Confirmado!</h1>
          <p className="text-xl text-muted-foreground mb-8">
            Gracias por tu compra. Hemos recibido tu pedido y te enviaremos un correo electrónico con los detalles.
          </p>
          <div className="space-y-4">
            <Link href="/mi-cuenta">
              <Button className="w-full" size="lg">
                Ver Mis Pedidos
              </Button>
            </Link>
            <Link href="/catalogo">
              <Button variant="outline" className="w-full" size="lg">
                Seguir Comprando
              </Button>
            </Link>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
