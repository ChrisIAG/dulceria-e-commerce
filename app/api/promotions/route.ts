import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { z } from 'zod';

// Schema de validación
const promotionSchema = z.object({
  title: z.string().min(3),
  description: z.string().optional().nullable(),
  type: z.enum(['PERCENTAGE', 'FIXED', 'TWO_FOR_ONE', 'BUNDLE']),
  discount: z.number().positive(),
  startDate: z.string(),
  endDate: z.string(),
  bannerImage: z.string().optional().nullable(),
  productIds: z.array(z.string()),
  active: z.boolean().optional(),
});

// GET /api/promotions - Listar todas las promociones
export async function GET() {
  try {
    const promotions = await prisma.promotion.findMany({
      include: {
        products: {
          select: {
            id: true,
            name: true,
            images: true,
          },
        },
      },
      orderBy: {
        startDate: 'desc',
      },
    });

    return NextResponse.json(promotions);
  } catch (error) {
    console.error('[Promotions GET] Error:', error);
    return NextResponse.json(
      { error: 'Error al obtener promociones' },
      { status: 500 }
    );
  }
}

// POST /api/promotions - Crear nueva promoción
export async function POST(request: Request) {
  try {
    const body = await request.json();
    const validatedData = promotionSchema.parse(body);

    const promotion = await prisma.promotion.create({
      data: {
        title: validatedData.title,
        description: validatedData.description,
        type: validatedData.type,
        discount: validatedData.discount,
        startDate: new Date(validatedData.startDate),
        endDate: new Date(validatedData.endDate),
        bannerImage: validatedData.bannerImage,
        active: validatedData.active ?? true,
        products: {
          connect: validatedData.productIds.map((id) => ({ id })),
        },
      },
      include: {
        products: true,
      },
    });

    return NextResponse.json(promotion, { status: 201 });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: 'Datos inválidos', details: error.issues },
        { status: 400 }
      );
    }

    console.error('[Promotions POST] Error:', error);
    return NextResponse.json(
      { error: 'Error al crear promoción' },
      { status: 500 }
    );
  }
}
