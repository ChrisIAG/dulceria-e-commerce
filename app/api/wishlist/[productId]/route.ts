import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/lib/auth';
import { prisma } from '@/lib/prisma';

// DELETE /api/wishlist/[productId] - Eliminar producto de wishlist
export async function DELETE(
  request: NextRequest,
  { params }: { params: { productId: string } }
) {
  try {
    const session = await auth();

    if (!session?.user?.id) {
      return NextResponse.json(
        { error: 'Debes iniciar sesión' },
        { status: 401 }
      );
    }

    // Buscar el item en wishlist
    const wishlistItem = await prisma.wishlist.findUnique({
      where: {
        userId_productId: {
          userId: session.user.id,
          productId: params.productId,
        },
      },
    });

    if (!wishlistItem) {
      return NextResponse.json(
        { error: 'Producto no encontrado en tu lista de favoritos' },
        { status: 404 }
      );
    }

    // Eliminar de wishlist
    await prisma.wishlist.delete({
      where: {
        id: wishlistItem.id,
      },
    });

    return NextResponse.json({
      message: 'Producto eliminado de favoritos',
    });
  } catch (error) {
    console.error('❌ Error al eliminar de wishlist:', error);
    return NextResponse.json(
      { error: 'Error al eliminar de favoritos' },
      { status: 500 }
    );
  }
}
