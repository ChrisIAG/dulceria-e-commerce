import { notFound } from 'next/navigation';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { ArrowLeft } from 'lucide-react';
import { CategoryForm } from '@/components/admin/category-form';
import { prisma } from '@/lib/prisma';

export const revalidate = 30;

export default async function EditarCategoriaPage({
  params,
}: {
  params: { id: string };
}) {
  const category = await prisma.category.findUnique({
    where: { id: params.id },
  });

  if (!category) {
    notFound();
  }

  return (
    <div className="space-y-8">
      <div>
        <Link href="/admin/categorias">
          <Button variant="ghost" className="mb-4">
            <ArrowLeft className="mr-2 h-4 w-4" />
            Volver a Categorías
          </Button>
        </Link>
        <h2 className="text-3xl font-bold">Editar Categoría</h2>
        <p className="text-muted-foreground">
          Actualiza la información de la categoría
        </p>
      </div>

      <div className="max-w-2xl">
        <CategoryForm
          initialData={{
            id: category.id,
            name: category.name,
            slug: category.slug,
            image: category.image,
          }}
          isEdit
        />
      </div>
    </div>
  );
}
