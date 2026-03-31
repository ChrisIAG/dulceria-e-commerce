import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Package, Truck, DollarSign, Users } from 'lucide-react';
import Link from 'next/link';

export default function MayoreoPage() {
  return (
    <div className="container mx-auto px-4 py-8">
      <div className="mx-auto max-w-4xl">
        <div className="mb-12 text-center">
          <h1 className="mb-4 text-5xl font-bold">Venta al Mayoreo</h1>
          <p className="text-xl text-muted-foreground">
            Precios especiales para revendedores y negocios
          </p>
        </div>

        {/* Benefits */}
        <div className="mb-12 grid gap-6 md:grid-cols-2">
          <Card>
            <CardHeader>
              <DollarSign className="h-10 w-10 text-primary mb-2" />
              <CardTitle>Mejores Precios</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-muted-foreground">
                Obtén descuentos de hasta 30% al comprar desde 12 piezas del mismo producto
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <Package className="h-10 w-10 text-primary mb-2" />
              <CardTitle>Pedidos Personalizados</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-muted-foreground">
                Crea paquetes mixtos y personaliza tus pedidos según las necesidades de tu negocio
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <Truck className="h-10 w-10 text-primary mb-2" />
              <CardTitle>Envíos Gratis</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-muted-foreground">
                Envíos sin costo en pedidos mayores a $2,500 MXN
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <Users className="h-10 w-10 text-primary mb-2" />
              <CardTitle>Asesoría Personalizada</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-muted-foreground">
                Equipo de ventas dedicado para ayudarte a maximizar tus ganancias
              </p>
            </CardContent>
          </Card>
        </div>

        {/* Pricing Table */}
        <Card className="mb-12">
          <CardHeader>
            <CardTitle>Ejemplo de Precios</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b">
                    <th className="pb-3 text-left font-semibold">Cantidad</th>
                    <th className="pb-3 text-left font-semibold">Tipo</th>
                    <th className="pb-3 text-right font-semibold">Precio por Pieza</th>
                    <th className="pb-3 text-right font-semibold">Descuento</th>
                  </tr>
                </thead>
                <tbody className="divide-y">
                  <tr>
                    <td className="py-3">1 - 11 piezas</td>
                    <td className="py-3">Menudeo</td>
                    <td className="py-3 text-right">$15.00</td>
                    <td className="py-3 text-right">—</td>
                  </tr>
                  <tr>
                    <td className="py-3">12 - 35 piezas</td>
                    <td className="py-3">Mayoreo</td>
                    <td className="py-3 text-right">$12.00</td>
                    <td className="py-3 text-right text-green-600">20%</td>
                  </tr>
                  <tr>
                    <td className="py-3">36+ piezas</td>
                    <td className="py-3">Mayoreo Premium</td>
                    <td className="py-3 text-right">$10.50</td>
                    <td className="py-3 text-right text-green-600">30%</td>
                  </tr>
                </tbody>
              </table>
            </div>
          </CardContent>
        </Card>

        {/* CTA */}
        <Card className="bg-primary/5">
          <CardContent className="p-8 text-center">
            <h2 className="mb-4 text-2xl font-bold">¿Listo para empezar?</h2>
            <p className="mb-6 text-muted-foreground">
              Los precios de mayoreo se aplican automáticamente al agregar la cantidad mínima al carrito
            </p>
            <Link href="/catalogo">
              <Button size="lg">Ver Catálogo Completo</Button>
            </Link>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
