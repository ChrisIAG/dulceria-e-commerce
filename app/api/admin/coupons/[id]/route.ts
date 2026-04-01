import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { auth } from '@/lib/auth';
import { z } from 'zod';

// GET /api/admin/coupons/[id] - Obtener un cupón específico (admin only)
export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const session = await auth();

    if (!session || session.user.role !== 'ADMIN') {
      return NextResponse.json({ error: 'No autorizado' }, { status: 401 });
    }

    const coupon = await prisma.coupon.findUnique({
      where: { id: params.id },
      include: {
        orders: {
          select: {
            id: true,
            folio: true,
            total: true,
            createdAt: true,
            user: {
              select: { name: true, email: true },
            },
          },
          orderBy: { createdAt: 'desc' },
          take: 10, // Últimos 10 pedidos con este cupón
        },
      },
    });

    if (!coupon) {
      return NextResponse.json(
        { error: 'Cupón no encontrado' },
        { status: 404 }
      );
    }

    // Serializar
    const serialized = {
      ...coupon,
      discountValue: Number(coupon.discountValue),
      minPurchase: coupon.minPurchase ? Number(coupon.minPurchase) : null,
      orders: coupon.orders.map((order: any) => ({
        ...order,
        total: Number(order.total),
      })),
    };

    return NextResponse.json({ coupon: serialized });
  } catch (error) {
    console.error('❌ Error al obtener cupón:', error);
    return NextResponse.json(
      { error: 'Error al obtener cupón' },
      { status: 500 }
    );
  }
}

// PUT /api/admin/coupons/[id] - Actualizar un cupón (admin only)
const updateCouponSchema = z.object({
  discountType: z.enum(['PERCENTAGE', 'FIXED']).optional(),
  discountValue: z.number().positive().optional(),
  maxUses: z.number().int().positive().optional().nullable(),
  minPurchase: z.number().min(0).optional().nullable(),
  startDate: z.string().datetime().optional(),
  endDate: z.string().datetime().optional(),
  active: z.boolean().optional(),
});

export async function PUT(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const session = await auth();

    if (!session || session.user.role !== 'ADMIN') {
      return NextResponse.json({ error: 'No autorizado' }, { status: 401 });
    }

    const coupon = await prisma.coupon.findUnique({
      where: { id: params.id },
    });

    if (!coupon) {
      return NextResponse.json(
        { error: 'Cupón no encontrado' },
        { status: 404 }
      );
    }

    const body = await request.json();
    const validated = updateCouponSchema.parse(body);

    // Validar fechas si se proporcionan ambas
    if (validated.startDate && validated.endDate) {
      if (new Date(validated.endDate) <= new Date(validated.startDate)) {
        return NextResponse.json(
          { error: 'La fecha de fin debe ser posterior a la fecha de inicio' },
          { status: 400 }
        );
      }
    }

    // Validar porcentaje
    if (
      validated.discountType === 'PERCENTAGE' &&
      validated.discountValue &&
      validated.discountValue > 100
    ) {
      return NextResponse.json(
        { error: 'El porcentaje de descuento no puede ser mayor al 100%' },
        { status: 400 }
      );
    }

    const updated = await prisma.coupon.update({
      where: { id: params.id },
      data: {
        ...(validated.discountType && {
          discountType: validated.discountType,
        }),
        ...(validated.discountValue !== undefined && {
          discountValue: validated.discountValue,
        }),
        ...(validated.maxUses !== undefined && { maxUses: validated.maxUses }),
        ...(validated.minPurchase !== undefined && {
          minPurchase: validated.minPurchase,
        }),
        ...(validated.startDate && {
          startDate: new Date(validated.startDate),
        }),
        ...(validated.endDate && { endDate: new Date(validated.endDate) }),
        ...(validated.active !== undefined && { active: validated.active }),
      },
    });

    console.log('✅ Cupón actualizado:', updated.code);

    return NextResponse.json({
      coupon: {
        ...updated,
        discountValue: Number(updated.discountValue),
        minPurchase: updated.minPurchase ? Number(updated.minPurchase) : null,
      },
    });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: 'Datos inválidos', details: error.issues },
        { status: 400 }
      );
    }

    console.error('❌ Error al actualizar cupón:', error);
    return NextResponse.json(
      { error: 'Error al actualizar cupón' },
      { status: 500 }
    );
  }
}

// DELETE /api/admin/coupons/[id] - Desactivar un cupón (admin only)
export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const session = await auth();

    if (!session || session.user.role !== 'ADMIN') {
      return NextResponse.json({ error: 'No autorizado' }, { status: 401 });
    }

    const coupon = await prisma.coupon.findUnique({
      where: { id: params.id },
    });

    if (!coupon) {
      return NextResponse.json(
        { error: 'Cupón no encontrado' },
        { status: 404 }
      );
    }

    // Soft delete: desactivar en lugar de eliminar
    await prisma.coupon.update({
      where: { id: params.id },
      data: { active: false },
    });

    console.log('✅ Cupón desactivado:', coupon.code);

    return NextResponse.json({ message: 'Cupón desactivado exitosamente' });
  } catch (error) {
    console.error('❌ Error al eliminar cupón:', error);
    return NextResponse.json(
      { error: 'Error al eliminar cupón' },
      { status: 500 }
    );
  }
}
