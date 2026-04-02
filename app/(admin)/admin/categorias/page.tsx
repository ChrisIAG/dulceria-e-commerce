import Link from 'next/link';
import Image from 'next/image';
import { prisma } from '@/lib/prisma';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Plus, Package, Edit, Trash2 } from 'lucide-react';
import { DeleteCategoryButton } from './delete-category-button';

export const revalidate = 30;

export default async function CategoriasPage() {
  const categories = await prisma.category.findMany({
    include: {
      _count: {
        select: { products: true },
      },
    },
    orderBy: { name: 'asc' },
  });

  return (
    <div className="space-y-8">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-3xl font-bold">Categorías</h2>
          <p className="text-muted-foreground">Organiza tus productos por categorías</p>
        </div>
        <Link href="/admin/categorias/nueva">
          <Button>
            <Plus className="mr-2 h-4 w-4" />
            Nueva Categoría
          </Button>
        </Link>
      </div>

      <Card className="bg-white border-gray-200 shadow-sm">
        <CardHeader>
          <CardTitle className="text-gray-900">Todas las Categorías ({categories.length})</CardTitle>
        </CardHeader>
        <CardContent>
          {categories.length === 0 ? (
            <div className="text-center py-12">
              <Package className="mx-auto h-12 w-12 text-muted-foreground mb-4" />
              <p className="text-muted-foreground mb-4">
                No hay categorías todavía
              </p>
              <Link href="/admin/categorias/nueva">
                <Button>
                  <Plus className="mr-2 h-4 w-4" />
                  Crear Primera Categoría
                </Button>
              </Link>
            </div>
          ) : (
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
              {categories.map((category) => (
                <Card key={category.id} className="bg-white border-gray-200 overflow-hidden shadow-sm hover:shadow-md transition-shadow">
                  {category.image && (
                    <div className="relative h-32 w-full bg-muted">
                      <Image
                        src={category.image}
                        alt={category.name}
                        fill
                        className="object-cover"
                        sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
                      />
                    </div>
                  )}
                  <CardContent className="p-4">
                    <h3 className="font-semibold text-lg mb-1">{category.name}</h3>
                    <p className="text-sm text-muted-foreground mb-3">
                      Slug: /{category.slug}
                    </p>
                    <div className="flex items-center gap-2 text-sm text-muted-foreground mb-4">
                      <Package className="h-4 w-4" />
                      <span>
                        {category._count.products} {category._count.products === 1 ? 'producto' : 'productos'}
                      </span>
                    </div>
                    <div className="flex gap-2">
                      <Link href={`/admin/categorias/${category.id}/editar`} className="flex-1">
                        <Button variant="outline" size="sm" className="w-full">
                          <Edit className="mr-2 h-3 w-3" />
                          Editar
                        </Button>
                      </Link>
                      <DeleteCategoryButton
                        categoryId={category.id}
                        categoryName={category.name}
                        productCount={category._count.products}
                      />
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
