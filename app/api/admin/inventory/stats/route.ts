import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { auth } from '@/lib/auth';

export async function GET() {
  try {
    const session = await auth();
    if (!session?.user || session.user.role !== 'ADMIN') {
      return NextResponse.json({ error: 'No autorizado' }, { status: 401 });
    }

    const products = await prisma.product.findMany({
      where: { active: true },
      select: {
        id: true,
        name: true,
        stock: true,
        price: true,
      },
    });

    const stats = {
      totalSkus: products.length,
      outOfStock: products.filter((p) => p.stock === 0).length,
      lowStock: products.filter((p) => p.stock > 0 && p.stock < 10).length,
      adequateStock: products.filter((p) => p.stock >= 10).length,
      totalValue: products.reduce((sum, p) => sum + p.stock * p.price, 0),
      outOfStockProducts: products.filter((p) => p.stock === 0),
      lowStockProducts: products
        .filter((p) => p.stock > 0 && p.stock < 10)
        .sort((a, b) => a.stock - b.stock),
    };

    return NextResponse.json(stats);
  } catch (error) {
    console.error('Error en GET /api/admin/inventory/stats:', error);
    return NextResponse.json(
      { error: 'Error al obtener estadísticas' },
      { status: 500 }
    );
  }
}
