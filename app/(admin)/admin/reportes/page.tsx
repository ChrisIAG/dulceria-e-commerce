'use client';

import { useEffect, useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { SalesChart } from '@/components/admin/sales-chart';
import { TopProductsTable } from '@/components/admin/top-products-table';
import { LowStockAlerts } from '@/components/admin/low-stock-alerts';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Skeleton } from '@/components/ui/skeleton';
import {
  BarChart3,
  TrendingUp,
  DollarSign,
  ShoppingCart,
  Package,
  AlertTriangle,
  TrendingDown,
} from 'lucide-react';
import { formatPrice } from '@/lib/utils';

interface SalesData {
  period: string;
  current: {
    total: number;
    count: number;
    averageTicket: number;
  };
  previous: {
    total: number;
    count: number;
  };
  growth: {
    salesPercentage: number;
    ordersPercentage: number;
  };
  chartData: Array<{
    date: string;
    total: number;
    count: number;
  }>;
  statusBreakdown: Array<{
    status: string;
    count: number;
  }>;
}

interface ProductsData {
  topProducts: Array<{
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
  }>;
  lowStock: Array<{
    id: string;
    name: string;
    slug: string;
    image: string;
    category: string;
    stock: number;
    price: number;
  }>;
  summary: {
    totalActive: number;
    inactive: number;
    outOfStock: number;
    inventoryValue: number;
  };
}

export default function ReportesPage() {
  const [period, setPeriod] = useState<'week' | 'month' | 'year'>('month');
  const [salesData, setSalesData] = useState<SalesData | null>(null);
  const [productsData, setProductsData] = useState<ProductsData | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      try {
        const [salesRes, productsRes] = await Promise.all([
          fetch(`/api/admin/analytics/sales?period=${period}`),
          fetch('/api/admin/analytics/products?limit=10&lowStockThreshold=10'),
        ]);

        const sales = await salesRes.json();
        const products = await productsRes.json();

        setSalesData(sales);
        setProductsData(products);
      } catch (error) {
        console.error('Error fetching analytics:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [period]);

  const getPeriodLabel = () => {
    switch (period) {
      case 'week':
        return 'la semana';
      case 'year':
        return 'el año';
      case 'month':
      default:
        return 'el mes';
    }
  };

  return (
    <div className="space-y-8">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-3xl font-bold">Reportes y Estadísticas</h2>
          <p className="text-muted-foreground">Análisis de ventas y rendimiento</p>
        </div>

        <Select value={period} onValueChange={(value: any) => setPeriod(value)}>
          <SelectTrigger className="w-[180px]">
            <SelectValue placeholder="Selecciona período" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="week">Última semana</SelectItem>
            <SelectItem value="month">Último mes</SelectItem>
            <SelectItem value="year">Último año</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {/* Métricas principales */}
      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Ventas de {getPeriodLabel()}</CardTitle>
            <DollarSign className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            {loading ? (
              <>
                <Skeleton className="h-8 w-32 mb-2" />
                <Skeleton className="h-4 w-40" />
              </>
            ) : (
              <>
                <div className="text-2xl font-bold">
                  {formatPrice(salesData?.current.total || 0)}
                </div>
                <p className="text-xs text-muted-foreground flex items-center gap-1 mt-1">
                  {salesData && salesData.growth.salesPercentage >= 0 ? (
                    <TrendingUp className="h-3 w-3 text-green-600" />
                  ) : (
                    <TrendingDown className="h-3 w-3 text-red-600" />
                  )}
                  <span
                    className={
                      salesData && salesData.growth.salesPercentage >= 0
                        ? 'text-green-600'
                        : 'text-red-600'
                    }
                  >
                    {salesData?.growth.salesPercentage.toFixed(1)}%
                  </span>
                  vs período anterior
                </p>
              </>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Pedidos</CardTitle>
            <ShoppingCart className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            {loading ? (
              <>
                <Skeleton className="h-8 w-20 mb-2" />
                <Skeleton className="h-4 w-32" />
              </>
            ) : (
              <>
                <div className="text-2xl font-bold">{salesData?.current.count || 0}</div>
                <p className="text-xs text-muted-foreground flex items-center gap-1 mt-1">
                  {salesData && salesData.growth.ordersPercentage >= 0 ? (
                    <TrendingUp className="h-3 w-3 text-green-600" />
                  ) : (
                    <TrendingDown className="h-3 w-3 text-red-600" />
                  )}
                  <span
                    className={
                      salesData && salesData.growth.ordersPercentage >= 0
                        ? 'text-green-600'
                        : 'text-red-600'
                    }
                  >
                    {salesData?.growth.ordersPercentage.toFixed(1)}%
                  </span>
                  vs período anterior
                </p>
              </>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Ticket Promedio</CardTitle>
            <BarChart3 className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            {loading ? (
              <>
                <Skeleton className="h-8 w-32 mb-2" />
                <Skeleton className="h-4 w-24" />
              </>
            ) : (
              <>
                <div className="text-2xl font-bold">
                  {formatPrice(salesData?.current.averageTicket || 0)}
                </div>
                <p className="text-xs text-muted-foreground mt-1">Por pedido</p>
              </>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Productos Activos</CardTitle>
            <Package className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            {loading ? (
              <>
                <Skeleton className="h-8 w-20 mb-2" />
                <Skeleton className="h-4 w-32" />
              </>
            ) : (
              <>
                <div className="text-2xl font-bold">
                  {productsData?.summary.totalActive || 0}
                </div>
                <p className="text-xs text-muted-foreground flex items-center gap-1 mt-1">
                  <AlertTriangle className="h-3 w-3 text-yellow-600" />
                  {productsData?.summary.outOfStock || 0} agotados
                </p>
              </>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Gráfica de ventas */}
      {loading ? (
        <Card>
          <CardHeader>
            <Skeleton className="h-6 w-48" />
          </CardHeader>
          <CardContent>
            <Skeleton className="h-[300px] w-full" />
          </CardContent>
        </Card>
      ) : (
        salesData &&
        salesData.chartData.length > 0 && (
          <SalesChart data={salesData.chartData} title="Tendencia de Ventas" />
        )
      )}

      {/* Top productos y Bajo stock */}
      <div className="grid gap-6 lg:grid-cols-2">
        {loading ? (
          <>
            <Card>
              <CardHeader>
                <Skeleton className="h-6 w-48" />
              </CardHeader>
              <CardContent>
                <Skeleton className="h-64 w-full" />
              </CardContent>
            </Card>
            <Card>
              <CardHeader>
                <Skeleton className="h-6 w-48" />
              </CardHeader>
              <CardContent>
                <Skeleton className="h-64 w-full" />
              </CardContent>
            </Card>
          </>
        ) : (
          <>
            {productsData && (
              <>
                <TopProductsTable products={productsData.topProducts} />
                <LowStockAlerts products={productsData.lowStock} />
              </>
            )}
          </>
        )}
      </div>

      {/* Información adicional del inventario */}
      {!loading && productsData && (
        <Card>
          <CardHeader>
            <CardTitle>Resumen de Inventario</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid gap-4 md:grid-cols-3">
              <div className="space-y-1">
                <p className="text-sm text-muted-foreground">Valor Total del Inventario</p>
                <p className="text-2xl font-bold">
                  {formatPrice(productsData.summary.inventoryValue)}
                </p>
              </div>
              <div className="space-y-1">
                <p className="text-sm text-muted-foreground">Productos Inactivos</p>
                <p className="text-2xl font-bold">{productsData.summary.inactive}</p>
              </div>
              <div className="space-y-1">
                <p className="text-sm text-muted-foreground">Productos Agotados</p>
                <p className="text-2xl font-bold text-red-600">
                  {productsData.summary.outOfStock}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
