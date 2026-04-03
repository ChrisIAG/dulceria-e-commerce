import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { auth } from '@/lib/auth';

function convertToCSV(data: any[]): string {
  if (data.length === 0) return '';

  const headers = Object.keys(data[0]);
  const csvHeaders = headers.join(',');

  const csvRows = data.map((row) =>
    headers
      .map((header) => {
        const value = row[header];
        if (value === null || value === undefined) return '';
        if (typeof value === 'string' && value.includes(',')) {
          return `"${value}"`;
        }
        return value;
      })
      .join(',')
  );

  return [csvHeaders, ...csvRows].join('\n');
}

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
        slug: true,
        stock: true,
        price: true,
        wholesalePrice: true,
        minWholesale: true,
        category: { select: { name: true } },
      },
      orderBy: { name: 'asc' },
    });

    const csvData = products.map((p) => ({
      ID: p.id,
      Nombre: p.name,
      Slug: p.slug || '',
      Stock: p.stock,
      'Precio Menudeo': p.price,
      'Precio Mayoreo': p.wholesalePrice || '',
      'Cantidad Mín. Mayoreo': p.minWholesale || '',
      Categoría: p.category?.name || '',
    }));

    const csv = convertToCSV(csvData);
    const timestamp = new Date().toISOString().split('T')[0];

    return new NextResponse(csv, {
      status: 200,
      headers: {
        'Content-Type': 'text/csv; charset=utf-8',
        'Content-Disposition': `attachment; filename="inventario_${timestamp}.csv"`,
      },
    });
  } catch (error) {
    console.error('Error en GET /api/admin/inventory/export:', error);
    return NextResponse.json(
      { error: 'Error al exportar inventario' },
      { status: 500 }
    );
  }
}
