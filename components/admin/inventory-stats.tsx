'use client';

import { useEffect, useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { AlertCircle, Package, TrendingDown, DollarSign } from 'lucide-react';
import { formatPrice } from '@/lib/utils';

interface Stats {
  totalSkus: number;
  outOfStock: number;
  lowStock: number;
  adequateStock: number;
  totalValue: number;
  outOfStockProducts: any[];
  lowStockProducts: any[];
}

export function InventoryStats() {
  const [stats, setStats] = useState<Stats | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchStats = async () => {
      try {
        const response = await fetch('/api/admin/inventory/stats');
        const data = await response.json();
        setStats(data);
      } catch (error) {
        console.error('Error fetching inventory stats:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchStats();
  }, []);

  if (loading) return <div>Cargando...</div>;
  if (!stats) return <div>Error al cargar estadísticas</div>;

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Total de SKUs</CardTitle>
          <Package className="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">{stats.totalSkus}</div>
          <p className="text-xs text-muted-foreground">
            Productos activos
          </p>
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Agotados</CardTitle>
          <AlertCircle className="h-4 w-4 text-red-500" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold text-red-600">
            {stats.outOfStock}
          </div>
          <p className="text-xs text-muted-foreground">
            {(((stats.outOfStock / stats.totalSkus) * 100) || 0).toFixed(1)}%
            del total
          </p>
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Stock Bajo</CardTitle>
          <TrendingDown className="h-4 w-4 text-yellow-500" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold text-yellow-600">
            {stats.lowStock}
          </div>
          <p className="text-xs text-muted-foreground">
            Menos de 10 unidades
          </p>
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Valor Total</CardTitle>
          <DollarSign className="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">
            {formatPrice(stats.totalValue)}
          </div>
          <p className="text-xs text-muted-foreground">
            Inventario total
          </p>
        </CardContent>
      </Card>
    </div>
  );
}
