import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

// GET /api/orders/session?session_id=xxx - Obtener datos del pedido por session_id de Stripe
export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const sessionId = searchParams.get('session_id');

  if (!sessionId) {
    return NextResponse.json(
      { error: 'session_id es requerido' },
      { status: 400 }
    );
  }

  try {
    // Buscar la orden por stripeId (que es el session_id de Stripe)
    const order = await prisma.order.findFirst({
      where: {
        stripeId: sessionId,
      },
      include: {
        items: {
          include: {
            product: {
              select: {
                id: true,
                name: true,
                category: true,
              },
            },
          },
        },
        coupon: {
          select: {
            code: true,
          },
        },
      },
    });

    if (!order) {
      return NextResponse.json(
        { error: 'Pedido no encontrado' },
        { status: 404 }
      );
    }

    // Formatear datos para GA4
    const formattedOrder = {
      transactionId: order.folio,
      value: Number(order.total),
      tax: 0,
      shipping: 0,
      coupon: order.coupon?.code || undefined,
      items: order.items.map((item) => ({
        item_id: item.product.id,
        item_name: item.product.name,
        item_category: item.product.category || 'Sin categoría',
        price: Number(item.unitPrice),
        quantity: item.quantity,
      })),
    };

    return NextResponse.json(formattedOrder);
  } catch (error) {
    console.error('Error al obtener datos del pedido:', error);
    return NextResponse.json(
      { error: 'Error al obtener datos del pedido' },
      { status: 500 }
    );
  }
}
