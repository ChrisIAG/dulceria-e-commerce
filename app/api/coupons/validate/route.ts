import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { z } from 'zod';

// POST /api/coupons/validate - Validar un cupón
const validateCouponSchema = z.object({
  code: z.string().min(1),
  subtotal: z.number().min(0),
});

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const validated = validateCouponSchema.parse(body);

    // Buscar el cupón por código (case-insensitive)
    const coupon = await prisma.coupon.findFirst({
      where: {
        code: {
          equals: validated.code,
          mode: 'insensitive',
        },
      },
    });

    if (!coupon) {
      return NextResponse.json(
        { error: 'Cupón no encontrado', valid: false },
        { status: 404 }
      );
    }

    // Validar que el cupón esté activo
    if (!coupon.active) {
      return NextResponse.json(
        { error: 'Este cupón no está activo', valid: false },
        { status: 400 }
      );
    }

    // Validar fechas
    const now = new Date();
    if (now < coupon.startDate) {
      return NextResponse.json(
        {
          error: `Este cupón estará disponible a partir del ${new Intl.DateTimeFormat(
            'es-MX'
          ).format(coupon.startDate)}`,
          valid: false,
        },
        { status: 400 }
      );
    }

    if (now > coupon.endDate) {
      return NextResponse.json(
        { error: 'Este cupón ha expirado', valid: false },
        { status: 400 }
      );
    }

    // Validar usos máximos
    if (coupon.maxUses !== null && coupon.usedCount >= coupon.maxUses) {
      return NextResponse.json(
        { error: 'Este cupón ha alcanzado su límite de usos', valid: false },
        { status: 400 }
      );
    }

    // Validar compra mínima
    if (coupon.minPurchase && validated.subtotal < coupon.minPurchase) {
      return NextResponse.json(
        {
          error: `Compra mínima de $${coupon.minPurchase.toFixed(
            2
          )} requerida para usar este cupón`,
          valid: false,
        },
        { status: 400 }
      );
    }

    // Calcular descuento
    let discountAmount = 0;
    if (coupon.discountType === 'PERCENTAGE') {
      discountAmount = (validated.subtotal * coupon.discountValue) / 100;
    } else if (coupon.discountType === 'FIXED') {
      discountAmount = coupon.discountValue;
    }

    // No puede descontar más que el subtotal
    discountAmount = Math.min(discountAmount, validated.subtotal);

    return NextResponse.json({
      valid: true,
      coupon: {
        id: coupon.id,
        code: coupon.code,
        discountType: coupon.discountType,
        discountValue: Number(coupon.discountValue),
        minPurchase: coupon.minPurchase ? Number(coupon.minPurchase) : null,
      },
      discountAmount,
      message: `Cupón "${coupon.code}" aplicado correctamente`,
    });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: 'Datos inválidos', details: error.issues, valid: false },
        { status: 400 }
      );
    }

    console.error('❌ Error al validar cupón:', error);
    return NextResponse.json(
      { error: 'Error al validar cupón', valid: false },
      { status: 500 }
    );
  }
}
