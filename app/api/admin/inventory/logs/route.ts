import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { auth } from '@/lib/auth';

export async function GET(request: Request) {
  try {
    const session = await auth();
    if (!session?.user || session.user.role !== 'ADMIN') {
      return NextResponse.json({ error: 'No autorizado' }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const productId = searchParams.get('productId');
    const type = searchParams.get('type');
    const startDate = searchParams.get('startDate');
    const endDate = searchParams.get('endDate');
    const page = parseInt(searchParams.get('page') || '1');
    const limit = parseInt(searchParams.get('limit') || '50');

    const where: any = {};
    if (productId) where.productId = productId;
    if (type) where.type = type;
    if (startDate || endDate) {
      where.createdAt = {};
      if (startDate) where.createdAt.gte = new Date(startDate);
      if (endDate) where.createdAt.lte = new Date(endDate);
    }

    const [logs, total] = await Promise.all([
      prisma.inventoryLog.findMany({
        where,
        include: {
          product: { select: { id: true, name: true, slug: true } },
          user: { select: { id: true, name: true, email: true } },
        },
        orderBy: { createdAt: 'desc' },
        skip: (page - 1) * limit,
        take: limit,
      }),
      prisma.inventoryLog.count({ where }),
    ]);

    return NextResponse.json({
      logs,
      pagination: {
        total,
        page,
        limit,
        pages: Math.ceil(total / limit),
      },
    });
  } catch (error) {
    console.error('Error en GET /api/admin/inventory/logs:', error);
    return NextResponse.json(
      { error: 'Error al obtener historial' },
      { status: 500 }
    );
  }
}

export async function POST(request: Request) {
  try {
    const session = await auth();
    if (!session?.user || session.user.role !== 'ADMIN') {
      return NextResponse.json({ error: 'No autorizado' }, { status: 401 });
    }

    const { productId, type, quantity, note } = await request.json();

    if (!productId || !type || quantity === undefined) {
      return NextResponse.json(
        { error: 'Campos requeridos: productId, type, quantity' },
        { status: 400 }
      );
    }

    const log = await prisma.inventoryLog.create({
      data: {
        productId,
        type,
        quantity: parseInt(quantity),
        note,
        userId: session.user.id,
      },
      include: {
        product: true,
        user: true,
      },
    });

    return NextResponse.json(log, { status: 201 });
  } catch (error) {
    console.error('Error en POST /api/admin/inventory/logs:', error);
    return NextResponse.json(
      { error: 'Error al crear entrada' },
      { status: 500 }
    );
  }
}
