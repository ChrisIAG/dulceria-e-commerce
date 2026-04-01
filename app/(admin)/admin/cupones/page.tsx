import { Metadata } from 'next';
import Link from 'next/link';
import { auth } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import type { Coupon } from '@prisma/client';
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

export const dynamic = 'force-dynamic';

async function getCoupons(status?: string) {
  const now = new Date();
  
  let whereClause: any = {};
  
  if (status === 'activos') {
    whereClause = {
      active: true,
      startDate: { lte: now },
      endDate: { gte: now },
    };
  } else if (status === 'expirados') {
    whereClause = {
      OR: [
        { active: false },
        { endDate: { lt: now } },
      ],
    };
  }

  const coupons = await prisma.coupon.findMany({
    where: whereClause,
    orderBy: { createdAt: 'desc' },
    include: {
      _count: {
        select: { orders: true },
      },
    },
  });

  // Convertir Decimals a numbers
  return coupons.map((coupon: Coupon & { _count: { orders: number } }) => ({
    ...coupon,
    discountValue: Number(coupon.discountValue),
    minPurchase: coupon.minPurchase ? Number(coupon.minPurchase) : null,
  }));
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
        <div className="bg-white border border-gray-200 rounded-lg p-5 shadow-sm hover:shadow-md transition-shadow">
          <div className="flex items-center justify-between mb-3">
            <span className="text-sm font-medium text-gray-600">Cupones Activos</span>
            <div className="h-10 w-10 rounded-full bg-blue-100 flex items-center justify-center">
              <Tag className="h-5 w-5 text-blue-600" />
            </div>
          </div>
          <p className="text-3xl font-bold text-gray-900">{activeCoupons}</p>
          <p className="text-xs text-gray-500 mt-1">Disponibles para uso</p>
        </div>
        <div className="bg-white border border-gray-200 rounded-lg p-5 shadow-sm hover:shadow-md transition-shadow">
          <div className="flex items-center justify-between mb-3">
            <span className="text-sm font-medium text-gray-600">Cupones Expirados</span>
            <div className="h-10 w-10 rounded-full bg-amber-100 flex items-center justify-center">
              <Tag className="h-5 w-5 text-amber-600" />
            </div>
          </div>
          <p className="text-3xl font-bold text-gray-900">{expiredCoupons}</p>
          <p className="text-xs text-gray-500 mt-1">Fuera de vigencia</p>
        </div>
        <div className="bg-white border border-gray-200 rounded-lg p-5 shadow-sm hover:shadow-md transition-shadow">
          <div className="flex items-center justify-between mb-3">
            <span className="text-sm font-medium text-gray-600">Usos Totales</span>
            <div className="h-10 w-10 rounded-full bg-emerald-100 flex items-center justify-center">
              <Tag className="h-5 w-5 text-emerald-600" />
            </div>
          </div>
          <p className="text-3xl font-bold text-gray-900">{totalUses}</p>
          <p className="text-xs text-gray-500 mt-1">En todos los cupones</p>
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
                        <Badge variant="secondary" className="bg-gray-100 text-gray-700">Inactivo</Badge>
                      ) : isExpired ? (
                        <Badge className="bg-amber-100 text-amber-700 hover:bg-amber-200 border-amber-300">Expirado</Badge>
                      ) : isMaxedOut ? (
                        <Badge className="bg-gray-100 text-gray-700 hover:bg-gray-200 border-gray-300">Límite Alcanzado</Badge>
                      ) : isActive ? (
                        <Badge className="bg-emerald-100 text-emerald-700 hover:bg-emerald-200 border-emerald-300">Activo</Badge>
                      ) : (
                        <Badge className="bg-blue-100 text-blue-700 hover:bg-blue-200 border-blue-300">Programado</Badge>
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
