'use server';

import { prisma } from '@/lib/prisma';
import { revalidatePath } from 'next/cache';

export async function deletePromotion(id: string) {
  try {
    await prisma.promotion.delete({
      where: { id },
    });

    revalidatePath('/admin/promociones');
    return { success: true };
  } catch (error) {
    console.error('Error al eliminar promoción:', error);
    throw new Error('Error al eliminar la promoción');
  }
}
