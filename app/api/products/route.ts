import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { auth } from '@/lib/auth';
import { z } from 'zod';

const productSchema = z.object({
  name: z.string().min(1),
  slug: z.string().min(1),
  description: z.string().optional(),
  price: z.number().positive(),
  wholesalePrice: z.number().positive(),
  minWholesale: z.number().int().positive().default(12),
  stock: z.number().int().min(0).default(0),
  images: z.array(z.string()),
  active: z.boolean().default(true),
  featured: z.boolean().default(false),
  categoryId: z.string().optional(),
});

// GET /api/products - Lista todos los productos
export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const categoryId = searchParams.get('categoryId');
  const active = searchParams.get('active');
  const featured = searchParams.get('featured');

  try {
    const products = await prisma.product.findMany({
      where: {
        ...(categoryId && { categoryId }),
        ...(active !== null && { active: active === 'true' }),
        ...(featured !== null && { featured: featured === 'true' }),
      },
      include: {
        category: true,
      },
      orderBy: {
        createdAt: 'desc',
      },
    });

    return NextResponse.json(products);
  } catch (error) {
    return NextResponse.json(
      { error: 'Error al obtener productos' },
      { status: 500 }
    );
  }
}

// POST /api/products - Crear nuevo producto (solo admin)
export async function POST(request: Request) {
  try {
    const session = await auth();

    if (!session || session.user.role !== 'ADMIN') {
      return NextResponse.json({ error: 'No autorizado' }, { status: 401 });
    }

    const body = await request.json();
    const validated = productSchema.parse(body);

    const product = await prisma.product.create({
      data: validated,
    });

    return NextResponse.json(product, { status: 201 });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: 'Datos de producto inválidos', details: error.issues },
        { status: 400 }
      );
    }

    return NextResponse.json(
      { error: 'Error al crear producto' },
      { status: 500 }
    );
  }
}
