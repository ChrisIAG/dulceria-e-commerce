import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { ArrowLeft } from 'lucide-react';
import { CategoryForm } from '@/components/admin/category-form';

export default function NuevaCategoriaPage() {
  return (
    <div className="space-y-8">
      <div>
        <Link href="/admin/categorias">
          <Button variant="ghost" className="mb-4">
            <ArrowLeft className="mr-2 h-4 w-4" />
            Volver a Categorías
          </Button>
        </Link>
        <h2 className="text-3xl font-bold">Nueva Categoría</h2>
        <p className="text-muted-foreground">
          Crea una nueva categoría para organizar tus productos
        </p>
      </div>

      <div className="max-w-2xl">
        <CategoryForm />
      </div>
    </div>
  );
}
