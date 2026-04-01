import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const q = searchParams.get('q') || '';
    const limit = parseInt(searchParams.get('limit') || '10');

    if (q.length < 2) {
      return NextResponse.json({ products: [] });
    }

    // Búsqueda con filtros OR en name, description y category
    const products = await prisma.product.findMany({
      where: {
        AND: [
          { active: true },
          {
            OR: [
              { name: { contains: q, mode: 'insensitive' } },
              { description: { contains: q, mode: 'insensitive' } },
              {
                category: {
                  name: { contains: q, mode: 'insensitive' },
                },
              },
            ],
          },
        ],
      },
      include: {
        category: {
          select: {
            name: true,
            slug: true,
          },
        },
      },
      take: limit,
      orderBy: [
        { featured: 'desc' },
        { name: 'asc' },
      ],
    });

    return NextResponse.json({ products, total: products.length });
  } catch (error) {
    console.error('Error en búsqueda:', error);
    return NextResponse.json(
      { error: 'Error al realizar búsqueda' },
      { status: 500 }
    );
  }
}
