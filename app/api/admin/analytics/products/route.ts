import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { auth } from '@/lib/auth';

// GET /api/admin/analytics/products - Métricas de productos
export async function GET(request: Request) {
  try {
    const session = await auth();

    if (!session || (session.user as any).role !== 'ADMIN') {
      return NextResponse.json({ error: 'No autorizado' }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const limit = parseInt(searchParams.get('limit') || '10');
    const lowStockThreshold = parseInt(searchParams.get('lowStockThreshold') || '10');

    // Top productos más vendidos
    const topProducts = await prisma.orderItem.groupBy({
      by: ['productId'],
      _sum: {
        quantity: true,
      },
      _count: {
        id: true,
      },
      orderBy: {
        _sum: {
          quantity: 'desc',
        },
      },
      take: limit,
    });

    // Obtener detalles de los productos
    const productIds = topProducts.map((item) => item.productId);
    const products = await prisma.product.findMany({
      where: {
        id: { in: productIds },
      },
      include: {
        category: true,
      },
    });

    // Crear mapa de productos para lookup rápido
    const productMap = new Map(products.map((p) => [p.id, p]));

    // Combinar datos
    const topProductsWithDetails = topProducts.map((item) => {
      const product = productMap.get(item.productId);
      return {
        productId: item.productId,
        name: product?.name || 'Producto eliminado',
        slug: product?.slug || '',
        image: product?.images[0] || '/placeholder.png',
        category: product?.category?.name || 'Sin categoría',
        stock: product?.stock || 0,
        price: Number(product?.price || 0),
        totalSold: item._sum.quantity || 0,
        timesOrdered: item._count.id,
        revenue: (item._sum.quantity || 0) * Number(product?.price || 0),
      };
    });

    // Productos con bajo stock
    const lowStockProducts = await prisma.product.findMany({
      where: {
        stock: {
          lte: lowStockThreshold,
          gt: 0, // Excluir productos agotados
        },
        active: true,
      },
      include: {
        category: true,
      },
      orderBy: {
        stock: 'asc',
      },
      take: limit,
    });

    const lowStockFormatted = lowStockProducts.map((product) => ({
      id: product.id,
      name: product.name,
      slug: product.slug,
      image: product.images[0] || '/placeholder.png',
      category: product.category?.name || 'Sin categoría',
      stock: product.stock,
      price: Number(product.price),
    }));

    // Productos agotados
    const outOfStockCount = await prisma.product.count({
      where: {
        stock: 0,
        active: true,
      },
    });

    // Total de productos activos
    const totalActiveProducts = await prisma.product.count({
      where: {
        active: true,
      },
    });

    // Productos inactivos
    const inactiveProducts = await prisma.product.count({
      where: {
        active: false,
      },
    });

    // Valor total del inventario
    const allProducts = await prisma.product.findMany({
      where: {
        active: true,
      },
      select: {
        stock: true,
        price: true,
      },
    });

    const inventoryValue = allProducts.reduce(
      (sum, product) => sum + product.stock * Number(product.price),
      0
    );

    return NextResponse.json({
      topProducts: topProductsWithDetails,
      lowStock: lowStockFormatted,
      summary: {
        totalActive: totalActiveProducts,
        inactive: inactiveProducts,
        outOfStock: outOfStockCount,
        inventoryValue,
      },
    });
  } catch (error) {
    console.error('Error fetching products analytics:', error);
    return NextResponse.json(
      { error: 'Error al obtener análisis de productos' },
      { status: 500 }
    );
  }
}
