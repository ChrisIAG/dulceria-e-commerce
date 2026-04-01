import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { auth } from '@/lib/auth';
import { z } from 'zod';
import { sendEmail } from '@/lib/email';
import OrderStatusUpdateEmail from '@/emails/order-status-update';

const updateStatusSchema = z.object({
  status: z.enum(['PENDING', 'PAID', 'PREPARING', 'SHIPPED', 'DELIVERED', 'CANCELLED']),
  notes: z.string().optional(),
});

// PUT /api/admin/orders/[id]/status - Actualizar estado del pedido
export async function PUT(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const session = await auth();

    if (!session || (session.user as any).role !== 'ADMIN') {
      return NextResponse.json({ error: 'No autorizado' }, { status: 401 });
    }

    const body = await request.json();
    const validated = updateStatusSchema.parse(body);

    const orderId = params.id;

    // Verificar que el pedido existe
    const order = await prisma.order.findUnique({
      where: { id: orderId },
      include: {
        items: {
          include: {
            product: true,
          },
        },
        user: true,
      },
    });

    if (!order) {
      return NextResponse.json({ error: 'Pedido no encontrado' }, { status: 404 });
    }

    // Si se está cancelando, devolver el stock
    if (validated.status === 'CANCELLED' && order.status !== 'CANCELLED') {
      // Restaurar stock de todos los productos
      for (const item of order.items) {
        if (item.product) {
          await prisma.product.update({
            where: { id: item.product.id },
            data: {
              stock: {
                increment: item.quantity,
              },
            },
          });
        }
      }
    }

    // Actualizar el pedido
    const updatedOrder = await prisma.order.update({
      where: { id: orderId },
      data: {
        status: validated.status,
        ...(validated.notes && { notes: validated.notes }),
      },
      include: {
        items: {
          include: {
            product: true,
          },
        },
        user: true,
      },
    });

    // Enviar email al cliente notificando el cambio de estado
    if (updatedOrder.user) {
      // Extraer tracking info de las notas si existe
      let trackingNumber: string | undefined;
      let carrier: string | undefined;
      
      if (updatedOrder.notes) {
        const trackingMatch = updatedOrder.notes.match(/Guía:\s*(\S+)/);
        const carrierMatch = updatedOrder.notes.match(/Envío:\s*([^-]+)/);
        
        if (trackingMatch) trackingNumber = trackingMatch[1];
        if (carrierMatch) carrier = carrierMatch[1].trim();
      }

      sendEmail({
        to: updatedOrder.user.email,
        subject: `Actualización de tu pedido ${updatedOrder.folio}`,
        react: OrderStatusUpdateEmail({
          customerName: updatedOrder.user.name ?? 'Cliente',
          folio: updatedOrder.folio,
          status: updatedOrder.status,
          trackingNumber,
          carrier,
        }),
      }).catch((error) => {
        console.error('Error sending status update email:', error);
        // No fallar la actualización si el email falla
      });
    }

    return NextResponse.json(updatedOrder);
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: 'Datos inválidos', details: error.issues },
        { status: 400 }
      );
    }

    console.error('Error updating order status:', error);
    return NextResponse.json(
      { error: 'Error al actualizar estado del pedido' },
      { status: 500 }
    );
  }
}
