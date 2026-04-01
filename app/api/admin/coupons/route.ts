import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { auth } from '@/lib/auth';
import { z } from 'zod';

// GET /api/admin/coupons - Listar todos los cupones (admin only)
export async function GET(request: NextRequest) {
  try {
    const session = await auth();

    if (!session || session.user.role !== 'ADMIN') {
      return NextResponse.json({ error: 'No autorizado' }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const status = searchParams.get('status'); // 'active', 'expired', 'all'

    const now = new Date();
    let whereClause: any = {};

    if (status === 'active') {
      whereClause = {
        active: true,
        startDate: { lte: now },
        endDate: { gte: now },
      };
    } else if (status === 'expired') {
      whereClause = {
        OR: [{ active: false }, { endDate: { lt: now } }],
      };
    }

    const coupons = await prisma.coupon.findMany({
      where: whereClause,
      include: {
        _count: {
          select: { orders: true },
        },
      },
      orderBy: { createdAt: 'desc' },
    });

    // Serializar
    const serialized = coupons.map((coupon: any) => ({
      ...coupon,
      discountValue: Number(coupon.discountValue),
      minPurchase: coupon.minPurchase ? Number(coupon.minPurchase) : null,
      orderCount: coupon._count.orders,
    }));

    return NextResponse.json({ coupons: serialized });
  } catch (error) {
    console.error('❌ Error al obtener cupones:', error);
    return NextResponse.json(
      { error: 'Error al obtener cupones' },
      { status: 500 }
    );
  }
}

// POST /api/admin/coupons - Crear un nuevo cupón (admin only)
const createCouponSchema = z.object({
  code: z
    .string()
    .min(3, 'El código debe tener al menos 3 caracteres')
    .max(20, 'El código no puede tener más de 20 caracteres')
    .regex(
      /^[A-Z0-9_-]+$/,
      'El código solo puede contener letras mayúsculas, números, guiones y guiones bajos'
    ),
  discountType: z.enum(['PERCENTAGE', 'FIXED']),
  discountValue: z.number().positive('El valor del descuento debe ser positivo'),
  maxUses: z.number().int().positive().optional().nullable(),
  minPurchase: z.number().min(0).optional().nullable(),
  startDate: z.string().datetime(),
  endDate: z.string().datetime(),
  active: z.boolean().default(true),
});

export async function POST(request: NextRequest) {
  try {
    const session = await auth();

    if (!session || session.user.role !== 'ADMIN') {
      return NextResponse.json({ error: 'No autorizado' }, { status: 401 });
    }

    const body = await request.json();
    const validated = createCouponSchema.parse(body);

    // Validar que endDate sea posterior a startDate
    if (new Date(validated.endDate) <= new Date(validated.startDate)) {
      return NextResponse.json(
        { error: 'La fecha de fin debe ser posterior a la fecha de inicio' },
        { status: 400 }
      );
    }

    // Validar que el código no exista ya
    const existing = await prisma.coupon.findFirst({
      where: {
        code: {
          equals: validated.code,
          mode: 'insensitive',
        },
      },
    });

    if (existing) {
      return NextResponse.json(
        { error: 'Ya existe un cupón con ese código' },
        { status: 400 }
      );
    }

    // Validar porcentaje (no puede ser mayor a 100)
    if (
      validated.discountType === 'PERCENTAGE' &&
      validated.discountValue > 100
    ) {
      return NextResponse.json(
        { error: 'El porcentaje de descuento no puede ser mayor al 100%' },
        { status: 400 }
      );
    }

    const coupon = await prisma.coupon.create({
      data: {
        code: validated.code.toUpperCase(),
        discountType: validated.discountType,
        discountValue: validated.discountValue,
        maxUses: validated.maxUses ?? null,
        minPurchase: validated.minPurchase ?? null,
        startDate: new Date(validated.startDate),
        endDate: new Date(validated.endDate),
        active: validated.active,
      },
    });

    console.log('✅ Cupón creado:', coupon.code);

    return NextResponse.json({
      coupon: {
        ...coupon,
        discountValue: Number(coupon.discountValue),
        minPurchase: coupon.minPurchase ? Number(coupon.minPurchase) : null,
      },
    });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: 'Datos inválidos', details: error.issues },
        { status: 400 }
      );
    }

    console.error('❌ Error al crear cupón:', error);
    return NextResponse.json(
      { error: 'Error al crear cupón' },
      { status: 500 }
    );
  }
}
