import { NextResponse } from 'next/server';
import { headers } from 'next/headers';
import { stripe, validateStripeConfig } from '@/lib/stripe';
import { prisma } from '@/lib/prisma';
import { sendEmail } from '@/lib/email';
import OrderConfirmationEmail from '@/emails/order-confirmation';
import Stripe from 'stripe';

export async function POST(request: Request) {
  // Validate Stripe configuration
  try {
    validateStripeConfig();
  } catch (error) {
    return NextResponse.json(
      { error: 'Stripe not configured' },
      { status: 500 }
    );
  }

  const body = await request.text();
  const signature = headers().get('stripe-signature');

  if (!signature) {
    return NextResponse.json(
      { error: 'No signature provided' },
      { status: 400 }
    );
  }

  let event: Stripe.Event;

  try {
    event = stripe.webhooks.constructEvent(
      body,
      signature,
      process.env.STRIPE_WEBHOOK_SECRET!
    );
  } catch (err: any) {
    console.error('Webhook signature verification failed:', err.message);
    return NextResponse.json(
      { error: 'Webhook signature verification failed' },
      { status: 400 }
    );
  }

  // Manejar el evento
  if (event.type === 'checkout.session.completed') {
    const session = event.data.object as Stripe.Checkout.Session;

    try {
      // Idempotencia: verificar si ya existe un pedido con este stripeId
      const existingOrder = await prisma.order.findFirst({
        where: { stripeId: session.id },
      });
      if (existingOrder) {
        console.log('Order already exists for session:', session.id);
        return NextResponse.json({ received: true });
      }

      // Extraer metadata
      const customerName = session.metadata?.customerName || '';
      const customerPhone = session.metadata?.customerPhone || '';
      const shippingAddress = JSON.parse(session.metadata?.shippingAddress || '{}');
      const items = JSON.parse(session.metadata?.items || '[]');
      const couponId = session.metadata?.couponId || null;
      const discountAmount = parseFloat(session.metadata?.discountAmount || '0');
      const userId = session.metadata?.userId || null;

      // Obtener productos
      const productIds = items.map((item: any) => item.productId);
      const products = await prisma.product.findMany({
        where: { id: { in: productIds } },
      });

      // Calcular total y crear items de orden
      let subtotal = 0;
      const orderItems = items.map((item: any) => {
        const product = products.find((p) => p.id === item.productId);
        if (!product) return null;

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
      }).filter(Boolean);

      // Crear orden en la base de datos
      const order = await prisma.order.create({
        data: {
          clientType: 'RETAIL',
          status: 'PAID',
          stripeId: session.id,
          userId: userId ? userId : undefined,
          address: JSON.stringify(shippingAddress),
          notes: `Cliente: ${customerName}, Tel: ${customerPhone}, Email: ${session.customer_email}`,
          subtotal,
          discount: discountAmount,
          total: subtotal - discountAmount,
          couponId: couponId || undefined,
          items: {
            create: orderItems as any,
          },
        },
      });

      // Incrementar uso del cupón si se usó
      if (couponId) {
        await prisma.coupon.update({
          where: { id: couponId },
          data: { usedCount: { increment: 1 } },
        });
      }

      // Descontar stock
      for (const item of items) {
        await prisma.product.update({
          where: { id: item.productId },
          data: {
            stock: {
              decrement: item.quantity,
            },
          },
        });
      }

      console.log('Order created:', order.folio);

      // Enviar email de confirmación de pedido
      if (session.customer_email) {
        const emailItems = orderItems.map((item: any) => {
          const product = products.find((p) => p.id === item.productId);
          return {
            product: product ? { name: product.name, images: product.images } : null,
            quantity: item.quantity,
            unitPrice: item.unitPrice,
            total: item.total,
          };
        });

        const parsedAddress = shippingAddress.street ? {
          street: shippingAddress.street || '',
          city: shippingAddress.city || '',
          state: shippingAddress.state || '',
          zipCode: shippingAddress.zipCode || '',
          country: shippingAddress.country || 'México',
        } : undefined;

        sendEmail({
          to: session.customer_email,
          subject: `Confirmación de pedido ${order.folio}`,
          react: OrderConfirmationEmail({
            customerName,
            folio: order.folio,
            items: emailItems,
            subtotal,
            discount: discountAmount,
            total: subtotal - discountAmount,
            address: parsedAddress,
          }),
        }).catch((err) => console.error('Error sending order confirmation email:', err));
      }
    } catch (error) {
      console.error('Error processing checkout.session.completed:', error);
      return NextResponse.json(
        { error: 'Error processing webhook' },
        { status: 500 }
      );
    }
  }

  return NextResponse.json({ received: true });
}
