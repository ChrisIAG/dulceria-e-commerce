import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import { z } from 'zod';

// PUT /api/reviews/[id] - Aprobar/editar reseña (admin) o editar propia reseña (user)
const updateReviewSchema = z.object({
  approved: z.boolean().optional(),
  rating: z.number().int().min(1).max(5).optional(),
  comment: z.string().max(1000).optional(),
});

export async function PUT(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const session = await auth();

    if (!session?.user?.id) {
      return NextResponse.json(
        { error: 'No autorizado' },
        { status: 401 }
      );
    }

    const body = await request.json();
    const validated = updateReviewSchema.parse(body);

    // Buscar la reseña
    const review = await prisma.review.findUnique({
      where: { id: params.id },
    });

    if (!review) {
      return NextResponse.json(
        { error: 'Reseña no encontrada' },
        { status: 404 }
      );
    }

    // Solo el autor puede editar contenido, solo admin puede aprobar
    const isAuthor = review.userId === session.user.id;
    const isAdmin = session.user.role === 'ADMIN';

    if (!isAuthor && !isAdmin) {
      return NextResponse.json(
        { error: 'No tienes permiso para editar esta reseña' },
        { status: 403 }
      );
    }

    // Si no es admin, no puede cambiar el estado de aprobación
    if (!isAdmin && validated.approved !== undefined) {
      return NextResponse.json(
        { error: 'Solo los administradores pueden aprobar reseñas' },
        { status: 403 }
      );
    }

    // Si es autor pero no admin, solo puede editar rating y comment
    const updateData: any = {};
    if (isAuthor) {
      if (validated.rating !== undefined) updateData.rating = validated.rating;
      if (validated.comment !== undefined) updateData.comment = validated.comment;
    }
    if (isAdmin && validated.approved !== undefined) {
      updateData.approved = validated.approved;
    }

    const updatedReview = await prisma.review.update({
      where: { id: params.id },
      data: updateData,
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

    return NextResponse.json(updatedReview);
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: 'Datos inválidos', details: error.issues },
        { status: 400 }
      );
    }

    console.error('❌ Error al actualizar reseña:', error);
    return NextResponse.json(
      { error: 'Error al actualizar reseña' },
      { status: 500 }
    );
  }
}

// DELETE /api/reviews/[id] - Eliminar reseña (admin o autor)
export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const session = await auth();

    if (!session?.user?.id) {
      return NextResponse.json(
        { error: 'No autorizado' },
        { status: 401 }
      );
    }

    const review = await prisma.review.findUnique({
      where: { id: params.id },
    });

    if (!review) {
      return NextResponse.json(
        { error: 'Reseña no encontrada' },
        { status: 404 }
      );
    }

    const isAuthor = review.userId === session.user.id;
    const isAdmin = session.user.role === 'ADMIN';

    if (!isAuthor && !isAdmin) {
      return NextResponse.json(
        { error: 'No tienes permiso para eliminar esta reseña' },
        { status: 403 }
      );
    }

    await prisma.review.delete({
      where: { id: params.id },
    });

    return NextResponse.json({
      message: 'Reseña eliminada correctamente',
    });
  } catch (error) {
    console.error('❌ Error al eliminar reseña:', error);
    return NextResponse.json(
      { error: 'Error al eliminar reseña' },
      { status: 500 }
    );
  }
}
