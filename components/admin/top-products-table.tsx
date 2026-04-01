'use client';

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import Image from 'next/image';
import Link from 'next/link';
import { formatPrice } from '@/lib/utils';
import { TrendingUp, Package } from 'lucide-react';

interface TopProduct {
  productId: string;
  name: string;
  slug: string;
  image: string;
  category: string;
  stock: number;
  price: number;
  totalSold: number;
  timesOrdered: number;
  revenue: number;
}

interface TopProductsTableProps {
  products: TopProduct[];
  title?: string;
  showRevenue?: boolean;
}

export function TopProductsTable({
  products,
  title = 'Productos Más Vendidos',
  showRevenue = true,
}: TopProductsTableProps) {
  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <TrendingUp className="h-5 w-5" />
          {title}
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {products.length === 0 ? (
            <p className="text-center text-muted-foreground py-8">
              No hay datos de ventas disponibles.
            </p>
          ) : (
            products.map((product, index) => (
              <div
                key={product.productId}
                className="flex items-center gap-4 pb-4 border-b last:border-b-0"
              >
                {/* Ranking */}
                <div className="flex-shrink-0 w-8 text-center">
                  <span
                    className={`text-2xl font-bold ${
                      index === 0
                        ? 'text-yellow-500'
                        : index === 1
                        ? 'text-gray-400'
                        : index === 2
                        ? 'text-amber-600'
                        : 'text-muted-foreground'
                    }`}
                  >
                    {index + 1}
                  </span>
                </div>

                {/* Imagen */}
                <Link
                  href={`/catalogo/${product.slug}`}
                  className="flex-shrink-0 relative h-16 w-16 rounded-lg overflow-hidden hover:opacity-80 transition-opacity"
                >
                  <Image
                    src={product.image}
                    alt={product.name}
                    fill
                    className="object-cover"
                  />
                </Link>

                {/* Información del producto */}
                <div className="flex-1 min-w-0">
                  <Link
                    href={`/catalogo/${product.slug}`}
                    className="font-medium text-sm hover:text-primary transition-colors line-clamp-1"
                  >
                    {product.name}
                  </Link>
                  <div className="flex items-center gap-2 mt-1">
                    <Badge variant="secondary" className="text-xs">
                      {product.category}
                    </Badge>
                    <span className="text-xs text-muted-foreground flex items-center gap-1">
                      <Package className="h-3 w-3" />
                      {product.stock} en stock
                    </span>
                  </div>
                </div>

                {/* Estadísticas */}
                <div className="flex-shrink-0 text-right space-y-1">
                  <div className="text-sm font-semibold">
                    {product.totalSold} unidades
                  </div>
                  <div className="text-xs text-muted-foreground">
                    {product.timesOrdered} pedidos
                  </div>
                  {showRevenue && (
                    <div className="text-sm font-bold text-primary">
                      {formatPrice(product.revenue)}
                    </div>
                  )}
                </div>
              </div>
            ))
          )}
        </div>
      </CardContent>
    </Card>
  );
}
