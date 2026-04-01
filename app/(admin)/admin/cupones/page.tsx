import { Metadata } from 'next';
import Link from 'next/link';
import { auth } from '@/lib/auth';
import { redirect } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Plus, Tag } from 'lucide-react';
import { CouponActions } from '@/components/admin/coupon-actions';
import { CreateCouponDialog } from '@/components/admin/create-coupon-dialog';
import { CouponFilters } from '@/components/admin/coupon-filters';

export const metadata: Metadata = {
  title: 'Cupones de Descuento - Admin',
  description: 'Gestiona los cupones de descuento de la tienda',
};

async function getCoupons(status?: string) {
  const baseUrl = process.env.NEXTAUTH_URL || 'http://localhost:3000';
  const url = new URL(`${baseUrl}/api/admin/coupons`);
  if (status) {
    url.searchParams.set('status', status);
  }

  const response = await fetch(url.toString(), {
    cache: 'no-store',
  });

  if (!response.ok) {
    throw new Error('Error al obtener cupones');
  }

  const data = await response.json();
  return data.coupons;
}

export default async function CuponesAdminPage({
  searchParams,
}: {
  searchParams: { status?: string };
}) {
  const session = await auth();

  if (!session || session.user.role !== 'ADMIN') {
    redirect('/');
  }

  const coupons = await getCoupons(searchParams.status);
  const now = new Date();

  // Calcular estadísticas
  const activeCoupons = coupons.filter(
    (c: any) => c.active && c.startDate <= now && c.endDate >= now
  ).length;
  const expiredCoupons = coupons.filter(
    (c: any) => !c.active || c.endDate < now
  ).length;
  const totalUses = coupons.reduce((sum: number, c: any) => sum + c.usedCount, 0);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">
            Cupones de Descuento
          </h1>
          <p className="text-gray-600 mt-1">
            Gestiona los cupones promocionales de tu tienda
          </p>
        </div>
        <CreateCouponDialog />
      </div>

      {/* Estadísticas */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="bg-white border rounded-lg p-4">
          <div className="flex items-center gap-2 text-green-600 mb-2">
            <Tag className="h-5 w-5" />
            <span className="text-sm font-medium">Cupones Activos</span>
          </div>
          <p className="text-3xl font-bold text-gray-900">{activeCoupons}</p>
        </div>
        <div className="bg-white border rounded-lg p-4">
          <div className="flex items-center gap-2 text-gray-600 mb-2">
            <Tag className="h-5 w-5" />
            <span className="text-sm font-medium">Cupones Expirados</span>
          </div>
          <p className="text-3xl font-bold text-gray-900">{expiredCoupons}</p>
        </div>
        <div className="bg-white border rounded-lg p-4">
          <div className="flex items-center gap-2 text-purple-600 mb-2">
            <Tag className="h-5 w-5" />
            <span className="text-sm font-medium">Usos Totales</span>
          </div>
          <p className="text-3xl font-bold text-gray-900">{totalUses}</p>
        </div>
      </div>

      {/* Filtros */}
      <CouponFilters currentStatus={searchParams.status} />

      {/* Tabla de cupones */}
      <div className="bg-white border rounded-lg overflow-hidden">
        {coupons.length === 0 ? (
          <div className="text-center py-12">
            <Tag className="h-12 w-12 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-semibold text-gray-900 mb-2">
              No hay cupones
            </h3>
            <p className="text-gray-600 mb-4">
              Comienza creando tu primer cupón de descuento
            </p>
            <CreateCouponDialog />
          </div>
        ) : (
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Código</TableHead>
                <TableHead>Tipo</TableHead>
                <TableHead>Descuento</TableHead>
                <TableHead>Usos</TableHead>
                <TableHead>Compra Mín.</TableHead>
                <TableHead>Vigencia</TableHead>
                <TableHead>Estado</TableHead>
                <TableHead className="text-right">Acciones</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {coupons.map((coupon: any) => {
                const isActive =
                  coupon.active &&
                  new Date(coupon.startDate) <= now &&
                  new Date(coupon.endDate) >= now;
                const isExpired = new Date(coupon.endDate) < now;
                const isMaxedOut =
                  coupon.maxUses !== null && coupon.usedCount >= coupon.maxUses;

                return (
                  <TableRow key={coupon.id}>
                    <TableCell className="font-mono font-bold">
                      {coupon.code}
                    </TableCell>
                    <TableCell>
                      <Badge variant="outline">
                        {coupon.discountType === 'PERCENTAGE'
                          ? 'Porcentaje'
                          : 'Monto Fijo'}
                      </Badge>
                    </TableCell>
                    <TableCell className="font-semibold">
                      {coupon.discountType === 'PERCENTAGE'
                        ? `${coupon.discountValue}%`
                        : `$${coupon.discountValue.toFixed(2)}`}
                    </TableCell>
                    <TableCell>
                      {coupon.usedCount}
                      {coupon.maxUses ? ` / ${coupon.maxUses}` : ' / ∞'}
                    </TableCell>
                    <TableCell>
                      {coupon.minPurchase
                        ? `$${coupon.minPurchase.toFixed(2)}`
                        : '-'}
                    </TableCell>
                    <TableCell className="text-sm">
                      <div>
                        {new Intl.DateTimeFormat('es-MX', {
                          dateStyle: 'short',
                        }).format(new Date(coupon.startDate))}
                      </div>
                      <div className="text-gray-500">
                        {new Intl.DateTimeFormat('es-MX', {
                          dateStyle: 'short',
                        }).format(new Date(coupon.endDate))}
                      </div>
                    </TableCell>
                    <TableCell>
                      {!coupon.active ? (
                        <Badge variant="secondary">Inactivo</Badge>
                      ) : isExpired ? (
                        <Badge variant="destructive">Expirado</Badge>
                      ) : isMaxedOut ? (
                        <Badge variant="secondary">Límite Alcanzado</Badge>
                      ) : isActive ? (
                        <Badge className="bg-green-600">Activo</Badge>
                      ) : (
                        <Badge variant="outline">Programado</Badge>
                      )}
                    </TableCell>
                    <TableCell className="text-right">
                      <CouponActions coupon={coupon} />
                    </TableCell>
                  </TableRow>
                );
              })}
            </TableBody>
          </Table>
        )}
      </div>
    </div>
  );
}
