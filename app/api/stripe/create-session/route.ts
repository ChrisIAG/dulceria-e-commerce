import { NextResponse } from 'next/server';
import { stripe, validateStripeConfig } from '@/lib/stripe';
import { prisma } from '@/lib/prisma';
import { z } from 'zod';
import { calculatePrice } from '@/lib/utils';

const checkoutSchema = z.object({
  items: z.array(
    z.object({
      productId: z.string(),
      quantity: z.number().int().positive(),
    })
  ),
  customerEmail: z.string().email(),
  customerName: z.string().min(1),
  customerPhone: z.string().min(10),
  shippingAddress: z.object({
    street: z.string().min(1),
    city: z.string().min(1),
    state: z.string().min(1),
    zipCode: z.string().min(5),
    country: z.string().default('MX'),
  }),
});

export async function POST(request: Request) {
  try {
    // Validate Stripe configuration
    validateStripeConfig();

    const body = await request.json();
    const validated = checkoutSchema.parse(body);

    // Obtener productos
    const productIds = validated.items.map((item) => item.productId);
    const products = await prisma.product.findMany({
      where: { id: { in: productIds }, active: true },
    });

    if (products.length !== productIds.length) {
      return NextResponse.json(
        { error: 'Algunos productos no están disponibles' },
        { status: 400 }
      );
    }

    // Crear line items para Stripe
    const lineItems = validated.items.map((item) => {
      const product = products.find((p) => p.id === item.productId);
      if (!product) {
        throw new Error(`Producto ${item.productId} no encontrado`);
      }

      // Verificar stock
      if (product.stock < item.quantity) {
        throw new Error(`Stock insuficiente para ${product.name}`);
      }

      const price = calculatePrice(
        item.quantity,
        Number(product.price),
        Number(product.wholesalePrice),
        product.minWholesale || 12
      );

      return {
        price_data: {
          currency: 'mxn',
          product_data: {
            name: product.name,
            images: product.images.slice(0, 1),
          },
          unit_amount: Math.round(price * 100), // Convertir a centavos
        },
        quantity: item.quantity,
      };
    });

    // Crear sesión de Stripe
    const session = await stripe.checkout.sessions.create({
      payment_method_types: ['card', 'oxxo'],
      line_items: lineItems,
      mode: 'payment',
      success_url: `${process.env.NEXT_PUBLIC_APP_URL}/confirmacion?session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${process.env.NEXT_PUBLIC_APP_URL}/carrito`,
      customer_email: validated.customerEmail,
      metadata: {
        customerName: validated.customerName,
        customerPhone: validated.customerPhone,
        shippingAddress: JSON.stringify(validated.shippingAddress),
        items: JSON.stringify(validated.items),
      },
    });

    return NextResponse.json({ sessionId: session.id, url: session.url });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: 'Datos de checkout inválidos', details: error.issues },
        { status: 400 }
      );
    }

    console.error('Error al crear sesión de Stripe:', error);
    return NextResponse.json(
      { error: 'Error al procesar el pago' },
      { status: 500 }
    );
  }
}
