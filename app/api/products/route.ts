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

// GET /api/products - Lista todos los productos con filtros avanzados y paginación
export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  
  // Parámetros básicos
  const categoryId = searchParams.get('categoryId');
  const active = searchParams.get('active');
  const featured = searchParams.get('featured');
  
  // Paginación
  const page = parseInt(searchParams.get('page') || '1');
  const limit = parseInt(searchParams.get('limit') || '24');
  const skip = (page - 1) * limit;
  
  // Filtros avanzados
  const categories = searchParams.get('categories')?.split(',').filter(Boolean) || [];
  const priceMin = searchParams.get('priceMin');
  const priceMax = searchParams.get('priceMax');
  const inStockOnly = searchParams.get('inStockOnly') === 'true';
  const clientType = searchParams.get('clientType'); // 'RETAIL' | 'WHOLESALE' | 'ALL'
  const sortBy = searchParams.get('sortBy') || 'newest'; // 'newest' | 'price-asc' | 'price-desc' | 'name'

  try {
    // Construir condiciones de filtrado
    const where: any = {
      ...(active !== null && { active: active === 'true' }),
      ...(featured !== null && { featured: featured === 'true' }),
    };

    // Filtro por categorías múltiples
    if (categoryId) {
      where.categoryId = categoryId;
    } else if (categories.length > 0) {
      where.categoryId = { in: categories };
    }

    // Filtro por rango de precio (usando precio de menudeo como referencia)
    if (priceMin || priceMax) {
      where.price = {};
      if (priceMin) where.price.gte = parseFloat(priceMin);
      if (priceMax) where.price.lte = parseFloat(priceMax);
    }

    // Filtro por disponibilidad en stock
    if (inStockOnly) {
      where.stock = { gt: 0 };
    }

    // Filtro por tipo de cliente (mayoreo disponible)
    // No aplicamos filtro específico aquí, se manejará en el frontend
    // pero podríamos filtrar productos que tengan minWholesale bajo

    // Construir ordenamiento
    let orderBy: any = { createdAt: 'desc' }; // default
    switch (sortBy) {
      case 'price-asc':
        orderBy = { price: 'asc' };
        break;
      case 'price-desc':
        orderBy = { price: 'desc' };
        break;
      case 'name':
        orderBy = { name: 'asc' };
        break;
      case 'featured':
        orderBy = [{ featured: 'desc' }, { createdAt: 'desc' }];
        break;
      case 'newest':
      default:
        orderBy = { createdAt: 'desc' };
        break;
    }

    // Obtener total de productos (para calcular páginas)
    const total = await prisma.product.count({ where });

    // Obtener productos con paginación
    const products = await prisma.product.findMany({
      where,
      include: {
        category: true,
        reviews: {
          where: { approved: true },
          select: { rating: true },
        },
      },
      orderBy,
      skip,
      take: limit,
    });

    // Add review stats to each product
    const productsWithReviews = products.map((product) => {
      const approvedReviews = product.reviews;
      const reviewCount = approvedReviews.length;
      const avgRating =
        reviewCount > 0
          ? approvedReviews.reduce((sum, r) => sum + r.rating, 0) / reviewCount
          : null;
      const { reviews, ...rest } = product;
      return { ...rest, avgRating, reviewCount };
    });

    // Calcular metadatos de paginación
    const totalPages = Math.ceil(total / limit);
    const hasNextPage = page < totalPages;
    const hasPrevPage = page > 1;

    return NextResponse.json({
      products: productsWithReviews,
      pagination: {
        page,
        limit,
        total,
        totalPages,
        hasNextPage,
        hasPrevPage,
      },
    });
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
