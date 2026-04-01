'use client';

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import Image from 'next/image';
import Link from 'next/link';
import { formatPrice } from '@/lib/utils';
import { AlertTriangle, Package } from 'lucide-react';

interface LowStockProduct {
  id: string;
  name: string;
  slug: string;
  image: string;
  category: string;
  stock: number;
  price: number;
}

interface LowStockAlertsProps {
  products: LowStockProduct[];
  title?: string;
}

export function LowStockAlerts({
  products,
  title = 'Alertas de Stock Bajo',
}: LowStockAlertsProps) {
  const getStockBadgeVariant = (stock: number) => {
    if (stock === 0) return 'destructive';
    if (stock <= 5) return 'destructive';
    if (stock <= 10) return 'default';
    return 'secondary';
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <AlertTriangle className="h-5 w-5 text-yellow-600" />
          {title}
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-3">
          {products.length === 0 ? (
            <div className="text-center py-8">
              <Package className="h-12 w-12 mx-auto text-muted-foreground mb-2" />
              <p className="text-sm text-muted-foreground">
                Todos los productos tienen stock suficiente
              </p>
            </div>
          ) : (
            products.map((product) => (
              <div
                key={product.id}
                className="flex items-center gap-3 p-3 rounded-lg border hover:bg-accent/50 transition-colors"
              >
                {/* Imagen */}
                <Link
                  href={`/catalogo/${product.slug}`}
                  className="flex-shrink-0 relative h-12 w-12 rounded overflow-hidden"
                >
                  <Image
                    src={product.image}
                    alt={product.name}
                    fill
                    className="object-cover"
                  />
                </Link>

                {/* Información */}
                <div className="flex-1 min-w-0">
                  <Link
                    href={`/catalogo/${product.slug}`}
                    className="font-medium text-sm hover:text-primary transition-colors line-clamp-1"
                  >
                    {product.name}
                  </Link>
                  <div className="flex items-center gap-2 mt-1">
                    <span className="text-xs text-muted-foreground">
                      {product.category}
                    </span>
                    <span className="text-xs text-muted-foreground">•</span>
                    <span className="text-xs text-muted-foreground">
                      {formatPrice(product.price)}
                    </span>
                  </div>
                </div>

                {/* Stock y Acción */}
                <div className="flex-shrink-0 flex items-center gap-2">
                  <Badge variant={getStockBadgeVariant(product.stock)}>
                    {product.stock} {product.stock === 1 ? 'unidad' : 'unidades'}
                  </Badge>
                  <Link href={`/admin/productos/${product.id}/editar`}>
                    <Button variant="outline" size="sm">
                      Reabastecer
                    </Button>
                  </Link>
                </div>
              </div>
            ))
          )}
        </div>
      </CardContent>
    </Card>
  );
}
