import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { z } from 'zod';

const promotionUpdateSchema = z.object({
  title: z.string().min(3).optional(),
  description: z.string().optional().nullable(),
  type: z.enum(['PERCENTAGE', 'FIXED', 'TWO_FOR_ONE', 'BUNDLE']).optional(),
  discount: z.number().positive().optional(),
  startDate: z.string().optional(),
  endDate: z.string().optional(),
  bannerImage: z.string().optional().nullable(),
  productIds: z.array(z.string()).optional(),
  active: z.boolean().optional(),
});

// GET /api/promotions/[id] - Obtener una promoción
export async function GET(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const promotion = await prisma.promotion.findUnique({
      where: { id: params.id },
      include: {
        products: {
          select: {
            id: true,
            name: true,
            images: true,
            price: true,
          },
        },
      },
    });

    if (!promotion) {
      return NextResponse.json(
        { error: 'Promoción no encontrada' },
        { status: 404 }
      );
    }

    return NextResponse.json(promotion);
  } catch (error) {
    console.error('[Promotion GET] Error:', error);
    return NextResponse.json(
      { error: 'Error al obtener promoción' },
      { status: 500 }
    );
  }
}

// PUT /api/promotions/[id] - Actualizar promoción
export async function PUT(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const body = await request.json();
    const validatedData = promotionUpdateSchema.parse(body);

    // Preparar datos de actualización
    const updateData: any = {
      title: validatedData.title,
      description: validatedData.description,
      type: validatedData.type,
      discount: validatedData.discount,
      active: validatedData.active,
      bannerImage: validatedData.bannerImage,
    };

    if (validatedData.startDate) {
      updateData.startDate = new Date(validatedData.startDate);
    }

    if (validatedData.endDate) {
      updateData.endDate = new Date(validatedData.endDate);
    }

    if (validatedData.productIds) {
      updateData.products = {
        set: validatedData.productIds.map((id) => ({ id })),
      };
    }

    const promotion = await prisma.promotion.update({
      where: { id: params.id },
      data: updateData,
      include: {
        products: true,
      },
    });

    return NextResponse.json(promotion);
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: 'Datos inválidos', details: error.issues },
        { status: 400 }
      );
    }

    console.error('[Promotion PUT] Error:', error);
    return NextResponse.json(
      { error: 'Error al actualizar promoción' },
      { status: 500 }
    );
  }
}

// DELETE /api/promotions/[id] - Eliminar promoción
export async function DELETE(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    await prisma.promotion.delete({
      where: { id: params.id },
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('[Promotion DELETE] Error:', error);
    return NextResponse.json(
      { error: 'Error al eliminar promoción' },
      { status: 500 }
    );
  }
}
