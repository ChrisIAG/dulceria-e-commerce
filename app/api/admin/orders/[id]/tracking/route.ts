import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { auth } from '@/lib/auth';
import { z } from 'zod';
import { sendEmail } from '@/lib/email';
import OrderStatusUpdateEmail from '@/emails/order-status-update';

const trackingSchema = z.object({
  trackingNumber: z.string().min(1, 'Número de guía requerido'),
  carrier: z.string().min(1, 'Paquetería requerida'),
});

// PUT /api/admin/orders/[id]/tracking - Agregar tracking al pedido
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
    const validated = trackingSchema.parse(body);

    const orderId = params.id;

    // Verificar que el pedido existe
    const order = await prisma.order.findUnique({
      where: { id: orderId },
      include: {
        user: true,
      },
    });

    if (!order) {
      return NextResponse.json({ error: 'Pedido no encontrado' }, { status: 404 });
    }

    // Por ahora guardamos tracking en notes hasta que agreguemos campos al schema
    const trackingInfo = `🚚 Envío: ${validated.carrier} - Guía: ${validated.trackingNumber}`;
    const existingNotes = order.notes || '';
    const updatedNotes = existingNotes
      ? `${existingNotes}\n${trackingInfo}`
      : trackingInfo;

    // Actualizar el pedido con tracking
    const updatedOrder = await prisma.order.update({
      where: { id: orderId },
      data: {
        notes: updatedNotes,
        status: 'SHIPPED', // Cambiar automáticamente a SHIPPED al agregar tracking
      },
      include: {
        user: true,
      },
    });

    // Enviar email al cliente con tracking
    if (updatedOrder.user) {
      sendEmail({
        to: updatedOrder.user.email,
        subject: `¡Tu pedido ${updatedOrder.folio} ha sido enviado! 🚚`,
        react: OrderStatusUpdateEmail({
          customerName: updatedOrder.user.name ?? 'Cliente',
          folio: updatedOrder.folio,
          status: 'SHIPPED',
          trackingNumber: validated.trackingNumber,
          carrier: validated.carrier,
        }),
      }).catch((error) => {
        console.error('Error sending tracking email:', error);
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

    console.error('Error adding tracking:', error);
    return NextResponse.json(
      { error: 'Error al agregar tracking' },
      { status: 500 }
    );
  }
}
