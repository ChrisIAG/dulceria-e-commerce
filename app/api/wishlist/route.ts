import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import { z } from 'zod';

// GET /api/wishlist - Obtener wishlist del usuario
export async function GET(request: NextRequest) {
  try {
    const session = await auth();

    if (!session?.user?.id) {
      return NextResponse.json(
        { error: 'Debes iniciar sesión para ver tu lista de favoritos' },
        { status: 401 }
      );
    }

    const wishlist = await prisma.wishlist.findMany({
      where: {
        userId: session.user.id,
      },
      include: {
        product: {
          include: {
            category: true,
          },
        },
      },
      orderBy: {
        createdAt: 'desc',
      },
    });

    // Transformar productos para serializar Decimals
    const items = wishlist.map((item: any) => ({
      id: item.id,
      productId: item.productId,
      createdAt: item.createdAt,
      product: {
        ...item.product,
        price: Number(item.product.price),
        wholesalePrice: item.product.wholesalePrice
          ? Number(item.product.wholesalePrice)
          : null,
      },
    }));

    return NextResponse.json({ items });
  } catch (error) {
    console.error('❌ Error al obtener wishlist:', error);
    return NextResponse.json(
      { error: 'Error al obtener lista de favoritos' },
      { status: 500 }
    );
  }
}

// POST /api/wishlist - Agregar producto a wishlist
const addToWishlistSchema = z.object({
  productId: z.string().cuid(),
});

export async function POST(request: NextRequest) {
  try {
    const session = await auth();

    if (!session?.user?.id) {
      return NextResponse.json(
        { error: 'Debes iniciar sesión para agregar productos a favoritos' },
        { status: 401 }
      );
    }

    const body = await request.json();
    const validated = addToWishlistSchema.parse(body);

    // Verificar que el producto exista y esté activo
    const product = await prisma.product.findUnique({
      where: { id: validated.productId },
    });

    if (!product || !product.active) {
      return NextResponse.json(
        { error: 'Producto no encontrado' },
        { status: 404 }
      );
    }

    // Verificar si ya está en wishlist
    const existingItem = await prisma.wishlist.findUnique({
      where: {
        userId_productId: {
          userId: session.user.id,
          productId: validated.productId,
        },
      },
    });

    if (existingItem) {
      return NextResponse.json(
        { error: 'Este producto ya está en tu lista de favoritos' },
        { status: 409 }
      );
    }

    // Agregar a wishlist
    const wishlistItem = await prisma.wishlist.create({
      data: {
        userId: session.user.id,
        productId: validated.productId,
      },
      include: {
        product: {
          include: {
            category: true,
          },
        },
      },
    });

    return NextResponse.json(
      {
        message: 'Producto agregado a favoritos',
        item: {
          ...wishlistItem,
          product: {
            ...wishlistItem.product,
            price: Number(wishlistItem.product.price),
            wholesalePrice: wishlistItem.product.wholesalePrice
              ? Number(wishlistItem.product.wholesalePrice)
              : null,
          },
        },
      },
      { status: 201 }
    );
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: 'Datos inválidos', details: error.issues },
        { status: 400 }
      );
    }

    console.error('❌ Error al agregar a wishlist:', error);
    return NextResponse.json(
      { error: 'Error al agregar a favoritos' },
      { status: 500 }
    );
  }
}
