import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { auth } from '@/lib/auth';
import { z } from 'zod';

const orderSchema = z.object({
  userId: z.string().optional(),
  clientType: z.enum(['RETAIL', 'WHOLESALE']).default('RETAIL'),
  address: z.string().optional(),
  notes: z.string().optional(),
  items: z.array(
    z.object({
      productId: z.string(),
      quantity: z.number().int().positive(),
    })
  ),
});

// GET /api/orders - Obtener órdenes del usuario
export async function GET(request: Request) {
  try {
    const session = await auth();

    if (!session) {
      return NextResponse.json({ error: 'No autorizado' }, { status: 401 });
    }

    const isAdmin = session.user.role === 'ADMIN';
    const { searchParams } = new URL(request.url);
    const status = searchParams.get('status');

    const orders = await prisma.order.findMany({
      where: {
        ...(isAdmin ? {} : { userId: session.user.id }),
        ...(status && { status: status as any }),
      },
      include: {
        items: {
          include: {
            product: true,
          },
        },
      },
      orderBy: {
        createdAt: 'desc',
      },
    });

    return NextResponse.json(orders);
  } catch (error) {
    return NextResponse.json(
      { error: 'Error al obtener órdenes' },
      { status: 500 }
    );
  }
}

// POST /api/orders - Crear orden (interno, usado por webhook de Stripe)
export async function POST(request: Request) {
  try {
    const body = await request.json();
    const validated = orderSchema.parse(body);

    // Obtener productos
    const productIds = validated.items.map((item) => item.productId);
    const products = await prisma.product.findMany({
      where: { id: { in: productIds } },
    });

    // Calcular total
    let subtotal = 0;
    const orderItems = validated.items.map((item) => {
      const product = products.find((p) => p.id === item.productId);
      if (!product) {
        throw new Error(`Producto ${item.productId} no encontrado`);
      }

      const price =
        item.quantity >= (product.minWholesale || 12)
          ? Number(product.wholesalePrice)
          : Number(product.price);

      const itemTotal = price * item.quantity;
      subtotal += itemTotal;

      return {
        productId: product.id,
        quantity: item.quantity,
        unitPrice: price,
        total: itemTotal,
      };
    });

    const order = await prisma.order.create({
      data: {
        userId: validated.userId,
        clientType: validated.clientType,
        address: validated.address,
        notes: validated.notes,
        subtotal,
        total: subtotal,
        items: {
          create: orderItems,
        },
      },
      include: {
        items: true,
      },
    });

    return NextResponse.json(order, { status: 201 });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: 'Datos de orden inválidos', details: error.issues },
        { status: 400 }
      );
    }

    console.error('Error al crear orden:', error);
    return NextResponse.json(
      { error: 'Error al crear orden' },
      { status: 500 }
    );
  }
}
