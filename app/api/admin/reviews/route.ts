import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/lib/auth';
import { prisma } from '@/lib/prisma';

// GET /api/admin/reviews - Listar todas las reseñas (incluye pendientes)
export async function GET(request: NextRequest) {
  try {
    const session = await auth();

    if (!session?.user || session.user.role !== 'ADMIN') {
      return NextResponse.json(
        { error: 'No autorizado' },
        { status: 403 }
      );
    }

    const { searchParams } = new URL(request.url);
    const status = searchParams.get('status'); // 'pending', 'approved', 'all'

    const where: any = {};
    if (status === 'pending') {
      where.approved = false;
    } else if (status === 'approved') {
      where.approved = true;
    }

    const reviews = await prisma.review.findMany({
      where,
      include: {
        user: {
          select: {
            id: true,
            name: true,
            email: true,
          },
        },
        product: {
          select: {
            id: true,
            name: true,
            slug: true,
            images: true,
          },
        },
      },
      orderBy: {
        createdAt: 'desc',
      },
    });

    // Contar pendientes
    const pendingCount = await prisma.review.count({
      where: { approved: false },
    });

    return NextResponse.json({
      reviews,
      stats: {
        total: reviews.length,
        pending: pendingCount,
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
