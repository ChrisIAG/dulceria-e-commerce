'use client';

import { useEffect, useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { ProductFilters, FilterState } from '@/components/store/product-filters';
import AddToCartButton from '@/components/store/add-to-cart-button';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Skeleton } from '@/components/ui/skeleton';
import { Badge } from '@/components/ui/badge';
import { Pagination } from '@/components/store/pagination';
import Image from 'next/image';
import Link from 'next/link';
import { formatPrice } from '@/lib/utils';

interface Product {
  id: string;
  name: string;
  slug: string;
  description: string | null;
  price: number;
  wholesalePrice: number;
  minWholesale: number;
  stock: number;
  images: string[];
  category: { id: string; name: string } | null;
}

interface Category {
  id: string;
  name: string;
  slug: string;
}

export default function CatalogoPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  
  const [products, setProducts] = useState<Product[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);
  const [sortBy, setSortBy] = useState(searchParams.get('sortBy') || 'newest');
  const [currentPage, setCurrentPage] = useState(parseInt(searchParams.get('page') || '1'));
  const [itemsPerPage, setItemsPerPage] = useState(parseInt(searchParams.get('limit') || '24'));
  const [pagination, setPagination] = useState({
    total: 0,
    totalPages: 0,
    hasNextPage: false,
    hasPrevPage: false,
  });

  // Construir filtros desde URL
  const initialFilters: FilterState = {
    categories: searchParams.get('categories')?.split(',').filter(Boolean) || [],
    priceRange: [
      parseInt(searchParams.get('priceMin') || '0'),
      parseInt(searchParams.get('priceMax') || '1000'),
    ],
    clientType: (searchParams.get('clientType') as FilterState['clientType']) || 'ALL',
    inStockOnly: searchParams.get('inStockOnly') === 'true',
  };

  const [filters, setFilters] = useState<FilterState>(initialFilters);

  // Cargar categorías una sola vez
  useEffect(() => {
    fetch('/api/categories')
      .then((res) => res.json())
      .then((data) => setCategories(data))
      .catch((err) => console.error('Error loading categories:', err));
  }, []);

  // Cargar productos cuando cambien los filtros, página o límite
  useEffect(() => {
    setLoading(true);

    const params = new URLSearchParams();
    params.set('active', 'true');
    params.set('page', currentPage.toString());
    params.set('limit', itemsPerPage.toString());
    
    if (filters.categories.length > 0) {
      params.set('categories', filters.categories.join(','));
    }
    
    if (filters.priceRange[0] > 0) {
      params.set('priceMin', filters.priceRange[0].toString());
    }
    
    if (filters.priceRange[1] < 1000) {
      params.set('priceMax', filters.priceRange[1].toString());
    }
    
    if (filters.inStockOnly) {
      params.set('inStockOnly', 'true');
    }
    
    if (filters.clientType !== 'ALL') {
      params.set('clientType', filters.clientType);
    }
    
    params.set('sortBy', sortBy);

    // Actualizar URL para SEO
    router.replace(`/catalogo?${params.toString()}`, { scroll: false });

    fetch(`/api/products?${params.toString()}`)
      .then((res) => res.json())
      .then((data) => {
        setProducts(data.products || []);
        setPagination(data.pagination || {});
        setLoading(false);
      })
      .catch((err) => {
        console.error('Error loading products:', err);
        setLoading(false);
      });
  }, [filters, sortBy, currentPage, itemsPerPage, router]);

  const handleFilterChange = (newFilters: FilterState) => {
    setFilters(newFilters);
    setCurrentPage(1); // Reset a primera página cuando cambian filtros
  };

  const handleSortChange = (value: string) => {
    setSortBy(value);
    setCurrentPage(1); // Reset a primera página cuando cambia ordenamiento
  };

  const handlePageChange = (page: number) => {
    setCurrentPage(page);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleItemsPerPageChange = (value: string) => {
    setItemsPerPage(parseInt(value));
    setCurrentPage(1); // Reset a primera página
  };

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="mb-8">
        <h1 className="text-4xl font-bold">Catálogo de Productos</h1>
        <p className="mt-2 text-muted-foreground">
          Descubre nuestra selección de dulces mexicanos
        </p>
      </div>

      <div className="flex flex-col lg:flex-row gap-8">
        {/* Sidebar de Filtros */}
        <aside className="w-full lg:w-64 flex-shrink-0">
          <ProductFilters
            categories={categories}
            onFilterChange={handleFilterChange}
            initialFilters={filters}
          />
        </aside>

        {/* Contenido Principal */}
        <div className="flex-1">
          {/* Header con ordenamiento, contador y selector de items */}
          <div className="mb-6 flex flex-col sm:flex-row gap-4 items-start sm:items-center justify-between">
            <div className="text-sm text-muted-foreground">
              {loading ? (
                <Skeleton className="h-5 w-48" />
              ) : (
                <div className="space-y-1">
                  <div>
                    {pagination.total} {pagination.total === 1 ? 'producto' : 'productos'} encontrados
                  </div>
                  <div className="text-xs">
                    Mostrando {Math.min((currentPage - 1) * itemsPerPage + 1, pagination.total)} -{' '}
                    {Math.min(currentPage * itemsPerPage, pagination.total)}
                  </div>
                </div>
              )}
            </div>

            <div className="flex gap-2 flex-wrap">
              <Select value={itemsPerPage.toString()} onValueChange={handleItemsPerPageChange}>
                <SelectTrigger className="w-[140px]">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="12">12 por página</SelectItem>
                  <SelectItem value="24">24 por página</SelectItem>
                  <SelectItem value="48">48 por página</SelectItem>
                </SelectContent>
              </Select>

              <Select value={sortBy} onValueChange={handleSortChange}>
                <SelectTrigger className="w-[200px]">
                  <SelectValue placeholder="Ordenar por" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="newest">Más recientes</SelectItem>
                  <SelectItem value="featured">Destacados</SelectItem>
                  <SelectItem value="price-asc">Precio: menor a mayor</SelectItem>
                  <SelectItem value="price-desc">Precio: mayor a menor</SelectItem>
                  <SelectItem value="name">Nombre A-Z</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          {/* Grid de Productos */}
          {loading ? (
            <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
              {[...Array(6)].map((_, i) => (
                <Card key={i} className="overflow-hidden">
                  <Skeleton className="aspect-square" />
                  <CardContent className="p-4">
                    <Skeleton className="h-6 w-3/4 mb-2" />
                    <Skeleton className="h-4 w-full mb-1" />
                    <Skeleton className="h-4 w-2/3" />
                    <Skeleton className="h-8 w-32 mt-4" />
                  </CardContent>
                </Card>
              ))}
            </div>
          ) : products.length === 0 ? (
            <div className="py-16 text-center">
              <p className="text-lg text-muted-foreground mb-4">
                No se encontraron productos con los filtros seleccionados.
              </p>
              <Button
                variant="outline"
                onClick={() =>
                  setFilters({
                    categories: [],
                    priceRange: [0, 1000],
                    clientType: 'ALL',
                    inStockOnly: false,
                  })
                }
              >
                Limpiar filtros
              </Button>
            </div>
          ) : (
            <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
              {products.map((product) => (
                <Card key={product.id} className="overflow-hidden flex flex-col">
                  <CardHeader className="p-0">
                    <Link href={`/catalogo/${product.slug}`}>
                      <div className="relative aspect-square group">
                        <Image
                          src={product.images[0] || '/placeholder.png'}
                          alt={product.name}
                          fill
                          className="object-cover transition-transform group-hover:scale-105"
                        />
                        {product.stock === 0 && (
                          <Badge
                            variant="destructive"
                            className="absolute top-2 right-2"
                          >
                            Agotado
                          </Badge>
                        )}
                      </div>
                    </Link>
                  </CardHeader>
                  <CardContent className="p-4 flex-1">
                    <Link href={`/catalogo/${product.slug}`}>
                      <CardTitle className="line-clamp-2 text-lg hover:text-primary transition-colors">
                        {product.name}
                      </CardTitle>
                    </Link>
                    {product.category && (
                      <Badge variant="secondary" className="mt-2">
                        {product.category.name}
                      </Badge>
                    )}
                    <div className="mt-4 space-y-1">
                      <div className="flex items-baseline gap-2">
                        <span className="text-2xl font-bold">
                          {formatPrice(Number(product.price))}
                        </span>
                        <span className="text-xs text-muted-foreground">menudeo</span>
                      </div>
                      <div className="text-sm text-muted-foreground">
                        {formatPrice(Number(product.wholesalePrice))} mayoreo (
                        {product.minWholesale}+ pzas)
                      </div>
                    </div>
                  </CardContent>
                  <CardFooter className="p-4 pt-0 gap-2">
                    <div className="flex-1">
                      <AddToCartButton
                        product={{
                          id: product.id,
                          name: product.name,
                          slug: product.slug,
                          price: Number(product.price),
                          wholesalePrice: Number(product.wholesalePrice),
                          minWholesale: product.minWholesale,
                          images: product.images,
                          stock: product.stock,
                        }}
                      />
                    </div>
                    <Link href={`/catalogo/${product.slug}`}>
                      <Button variant="outline" size="icon">
                        <svg
                          xmlns="http://www.w3.org/2000/svg"
                          width="16"
                          height="16"
                          viewBox="0 0 24 24"
                          fill="none"
                          stroke="currentColor"
                          strokeWidth="2"
                          strokeLinecap="round"
                          strokeLinejoin="round"
                        >
                          <path d="M2 12s3-7 10-7 10 7 10 7-3 7-10 7-10-7-10-7Z" />
                          <circle cx="12" cy="12" r="3" />
                        </svg>
                      </Button>
                    </Link>
                  </CardFooter>
                </Card>
              ))}
            </div>
          )}

          {/* Paginación */}
          {!loading && products.length > 0 && (
            <Pagination
              currentPage={currentPage}
              totalPages={pagination.totalPages}
              onPageChange={handlePageChange}
              hasNextPage={pagination.hasNextPage}
              hasPrevPage={pagination.hasPrevPage}
            />
          )}
        </div>
      </div>
    </div>
  );
}
