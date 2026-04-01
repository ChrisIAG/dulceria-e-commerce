import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { auth } from '@/lib/auth';

// GET /api/admin/analytics/sales - Métricas de ventas
export async function GET(request: Request) {
  try {
    const session = await auth();

    if (!session || (session.user as any).role !== 'ADMIN') {
      return NextResponse.json({ error: 'No autorizado' }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const period = searchParams.get('period') || 'month'; // 'week' | 'month' | 'year'

    const now = new Date();
    let startDate: Date;
    let previousStartDate: Date;
    let previousEndDate: Date;

    // Calcular rangos de fechas según el período
    switch (period) {
      case 'week':
        startDate = new Date(now.getFullYear(), now.getMonth(), now.getDate() - 7);
        previousStartDate = new Date(now.getFullYear(), now.getMonth(), now.getDate() - 14);
        previousEndDate = new Date(now.getFullYear(), now.getMonth(), now.getDate() - 7);
        break;
      case 'year':
        startDate = new Date(now.getFullYear(), 0, 1);
        previousStartDate = new Date(now.getFullYear() - 1, 0, 1);
        previousEndDate = new Date(now.getFullYear() - 1, 11, 31);
        break;
      case 'month':
      default:
        startDate = new Date(now.getFullYear(), now.getMonth(), 1);
        previousStartDate = new Date(now.getFullYear(), now.getMonth() - 1, 1);
        previousEndDate = new Date(now.getFullYear(), now.getMonth(), 0);
        break;
    }

    // Obtener ventas del período actual
    const currentOrders = await prisma.order.findMany({
      where: {
        createdAt: { gte: startDate },
        status: { notIn: ['CANCELLED'] }, // Excluir canceladas
      },
      include: {
        items: true,
      },
    });

    // Calcular total de ventas actual
    const currentTotal = currentOrders.reduce((sum, order) => sum + Number(order.total), 0);
    const currentCount = currentOrders.length;

    // Calcular promedio de ticket
    const averageTicket = currentCount > 0 ? currentTotal / currentCount : 0;

    // Obtener ventas del período anterior
    const previousOrders = await prisma.order.findMany({
      where: {
        createdAt: {
          gte: previousStartDate,
          lte: previousEndDate,
        },
        status: { notIn: ['CANCELLED'] },
      },
    });

    const previousTotal = previousOrders.reduce((sum, order) => sum + Number(order.total), 0);
    const previousCount = previousOrders.length;

    // Calcular porcentaje de crecimiento
    const growthPercentage =
      previousTotal > 0 ? ((currentTotal - previousTotal) / previousTotal) * 100 : 100;

    const orderGrowthPercentage =
      previousCount > 0 ? ((currentCount - previousCount) / previousCount) * 100 : 100;

    // Obtener ventas por día para la gráfica
    const dailySales = await prisma.order.groupBy({
      by: ['createdAt'],
      where: {
        createdAt: { gte: startDate },
        status: { notIn: ['CANCELLED'] },
      },
      _sum: {
        total: true,
      },
      _count: {
        id: true,
      },
    });

    // Agrupar por día
    const salesByDay: Record<string, { total: number; count: number }> = {};
    
    dailySales.forEach((day) => {
      const date = new Date(day.createdAt);
      const dateKey = date.toISOString().split('T')[0]; // YYYY-MM-DD
      
      if (!salesByDay[dateKey]) {
        salesByDay[dateKey] = { total: 0, count: 0 };
      }
      
      salesByDay[dateKey].total += Number(day._sum.total || 0);
      salesByDay[dateKey].count += day._count.id;
    });

    // Convertir a array ordenado para la gráfica
    const chartData = Object.entries(salesByDay)
      .map(([date, data]) => ({
        date,
        total: data.total,
        count: data.count,
      }))
      .sort((a, b) => a.date.localeCompare(b.date));

    // Ventas por status
    const ordersByStatus = await prisma.order.groupBy({
      by: ['status'],
      where: {
        createdAt: { gte: startDate },
      },
      _count: {
        id: true,
      },
    });

    const statusBreakdown = ordersByStatus.map((item) => ({
      status: item.status,
      count: item._count.id,
    }));

    return NextResponse.json({
      period,
      current: {
        total: currentTotal,
        count: currentCount,
        averageTicket,
      },
      previous: {
        total: previousTotal,
        count: previousCount,
      },
      growth: {
        salesPercentage: growthPercentage,
        ordersPercentage: orderGrowthPercentage,
      },
      chartData,
      statusBreakdown,
    });
  } catch (error) {
    console.error('Error fetching sales analytics:', error);
    return NextResponse.json(
      { error: 'Error al obtener análisis de ventas' },
      { status: 500 }
    );
  }
}
