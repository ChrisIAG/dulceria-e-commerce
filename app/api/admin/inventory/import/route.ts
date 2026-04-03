import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { auth } from '@/lib/auth';

function parseCSV(csvContent: string): any[] {
  const lines = csvContent.trim().split('\n');
  const headers = lines[0].split(',').map((h) => h.trim());

  return lines.slice(1).map((line) => {
    const values = line.split(',').map((v) => v.trim().replace(/^"|"$/g, ''));
    const row: any = {};

    headers.forEach((header, index) => {
      row[header] = values[index] || '';
    });

    return row;
  });
}

export async function POST(request: Request) {
  try {
    const session = await auth();
    if (!session?.user || session.user.role !== 'ADMIN') {
      return NextResponse.json({ error: 'No autorizado' }, { status: 401 });
    }

    const formData = await request.formData();
    const file = formData.get('file') as File;

    if (!file) {
      return NextResponse.json(
        { error: 'Archivo requerido' },
        { status: 400 }
      );
    }

    const csvContent = await file.text();
    const rows = parseCSV(csvContent);

    const results = {
      success: 0,
      failed: 0,
      errors: [] as string[],
    };

    for (const row of rows) {
      try {
        const productId = row['ID'] || row['id'];
        const newStock = parseInt(row['Stock'] || row['stock']);

        if (!productId || isNaN(newStock)) {
          results.errors.push(
            `Fila inválida: ID=${productId}, Stock=${newStock}`
          );
          results.failed++;
          continue;
        }

        // Obtener stock actual
        const product = await prisma.product.findUnique({
          where: { id: productId },
          select: { stock: true },
        });

        if (!product) {
          results.errors.push(`Producto no encontrado: ${productId}`);
          results.failed++;
          continue;
        }

        const quantityDiff = newStock - product.stock;

        // Actualizar stock y crear log
        await Promise.all([
          prisma.product.update({
            where: { id: productId },
            data: { stock: newStock },
          }),
          prisma.inventoryLog.create({
            data: {
              productId,
              type: 'ADJUSTMENT',
              quantity: quantityDiff,
              note: `Importación masiva: ${quantityDiff > 0 ? 'entrada' : 'salida'} de ${Math.abs(quantityDiff)} unidades`,
              userId: session.user.id,
            },
          }),
        ]);

        results.success++;
      } catch (error) {
        results.errors.push(
          `Error procesando fila: ${error instanceof Error ? error.message : 'Unknown error'}`
        );
        results.failed++;
      }
    }

    return NextResponse.json(results);
  } catch (error) {
    console.error('Error en POST /api/admin/inventory/import:', error);
    return NextResponse.json(
      { error: 'Error al importar inventario' },
      { status: 500 }
    );
  }
}
