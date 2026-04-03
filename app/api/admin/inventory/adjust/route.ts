import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { auth } from '@/lib/auth';

export async function PATCH(request: Request) {
  try {
    const session = await auth();
    if (!session?.user || session.user.role !== 'ADMIN') {
      return NextResponse.json({ error: 'No autorizado' }, { status: 401 });
    }

    const { productId, quantity, type, note } = await request.json();

    if (!productId || quantity === undefined) {
      return NextResponse.json(
        { error: 'Campos requeridos: productId, quantity' },
        { status: 400 }
      );
    }

    // Obtener producto actual
    const product = await prisma.product.findUnique({
      where: { id: productId },
    });

    if (!product) {
      return NextResponse.json(
        { error: 'Producto no encontrado' },
        { status: 404 }
      );
    }

    const newStock = product.stock + quantity;

    if (newStock < 0) {
      return NextResponse.json(
        { error: 'Stock insuficiente para esta operación' },
        { status: 400 }
      );
    }

    // Actualizar stock y crear log
    const [updatedProduct, log] = await Promise.all([
      prisma.product.update({
        where: { id: productId },
        data: { stock: newStock },
      }),
      prisma.inventoryLog.create({
        data: {
          productId,
          type: type || 'ADJUSTMENT',
          quantity,
          note: note || `Ajuste manual: ${quantity > 0 ? 'entrada' : 'salida'}`,
          userId: session.user.id,
        },
      }),
    ]);

    return NextResponse.json({
      product: updatedProduct,
      log,
    });
  } catch (error) {
    console.error('Error en PATCH /api/admin/inventory/adjust:', error);
    return NextResponse.json(
      { error: 'Error al ajustar stock' },
      { status: 500 }
    );
  }
}
