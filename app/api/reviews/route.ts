import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import { z } from 'zod';

// GET /api/reviews?productId=xxx - Listar reseñas de un producto (solo aprobadas)
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const productId = searchParams.get('productId');

    if (!productId) {
      return NextResponse.json(
        { error: 'productId es requerido' },
        { status: 400 }
      );
    }

    const reviews = await prisma.review.findMany({
      where: {
        productId,
        approved: true,
      },
      include: {
        user: {
          select: {
            id: true,
            name: true,
            image: true,
          },
        },
      },
      orderBy: {
        createdAt: 'desc',
      },
    });

    // Calcular promedio de rating
    const avgRating = reviews.length > 0
      ? reviews.reduce((sum: number, r: any) => sum + r.rating, 0) / reviews.length
      : 0;

    return NextResponse.json({
      reviews,
      stats: {
        total: reviews.length,
        avgRating: Math.round(avgRating * 10) / 10, // 1 decimal
      },
    });
  } catch (error) {
    console.error('❌ Error al obtener reseñas:', error);
    return NextResponse.json(
      { error: 'Error al obtener reseñas' },
      { status: 500 }
    );
  }
}

// POST /api/reviews - Crear nueva reseña (requiere autenticación)
const createReviewSchema = z.object({
  productId: z.string().cuid(),
  rating: z.number().int().min(1).max(5),
  comment: z.string().max(1000).optional(),
});

export async function POST(request: NextRequest) {
  try {
    const session = await auth();

    if (!session?.user?.id) {
      return NextResponse.json(
        { error: 'Debes iniciar sesión para dejar una reseña' },
        { status: 401 }
      );
    }

    const body = await request.json();
    const validated = createReviewSchema.parse(body);

    // Verificar que el producto exista
    const product = await prisma.product.findUnique({
      where: { id: validated.productId },
    });

    if (!product) {
      return NextResponse.json(
        { error: 'Producto no encontrado' },
        { status: 404 }
      );
    }

    // Verificar que el usuario haya comprado el producto
    const hasPurchased = await prisma.orderItem.findFirst({
      where: {
        productId: validated.productId,
        order: {
          userId: session.user.id,
          status: {
            in: ['PAID', 'PREPARING', 'SHIPPED', 'DELIVERED'],
          },
        },
      },
    });

    if (!hasPurchased) {
      return NextResponse.json(
        { error: 'Solo puedes reseñar productos que hayas comprado' },
        { status: 403 }
      );
    }

    // Verificar que no haya reseñado antes
    const existingReview = await prisma.review.findUnique({
      where: {
        productId_userId: {
          productId: validated.productId,
          userId: session.user.id,
        },
      },
    });

    if (existingReview) {
      return NextResponse.json(
        { error: 'Ya has reseñado este producto' },
        { status: 409 }
      );
    }

    // Crear reseña
    const review = await prisma.review.create({
      data: {
        ...validated,
        userId: session.user.id,
        approved: false, // Requiere moderación
      },
      include: {
        user: {
          select: {
            id: true,
            name: true,
            image: true,
          },
        },
        product: {
          select: {
            id: true,
            name: true,
          },
        },
      },
    });

    return NextResponse.json(
      {
        message: 'Reseña enviada. Será visible una vez aprobada.',
        review,
      },
      { status: 201 }
    );
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: 'Datos inválidos', details: error.issues },
        { status: 400 }
      );
    }

    console.error('❌ Error al crear reseña:', error);
    return NextResponse.json(
      { error: 'Error al crear reseña' },
      { status: 500 }
    );
  }
}
