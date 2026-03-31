'use client';

import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Checkbox } from '@/components/ui/checkbox';
import { Label } from '@/components/ui/label';
import { Slider } from '@/components/ui/slider';
import { Button } from '@/components/ui/button';
import { Separator } from '@/components/ui/separator';
import { Badge } from '@/components/ui/badge';
import { X } from 'lucide-react';
import { formatPrice } from '@/lib/utils';

interface Category {
  id: string;
  name: string;
  slug: string;
}

interface ProductFiltersProps {
  categories: Category[];
  onFilterChange: (filters: FilterState) => void;
  initialFilters?: FilterState;
}

export interface FilterState {
  categories: string[];
  priceRange: [number, number];
  clientType: 'ALL' | 'RETAIL' | 'WHOLESALE';
  inStockOnly: boolean;
}

export function ProductFilters({
  categories,
  onFilterChange,
  initialFilters,
}: ProductFiltersProps) {
  const [filters, setFilters] = useState<FilterState>(
    initialFilters || {
      categories: [],
      priceRange: [0, 1000],
      clientType: 'ALL',
      inStockOnly: false,
    }
  );

  const handleCategoryToggle = (categoryId: string) => {
    const newCategories = filters.categories.includes(categoryId)
      ? filters.categories.filter((id) => id !== categoryId)
      : [...filters.categories, categoryId];

    const newFilters = { ...filters, categories: newCategories };
    setFilters(newFilters);
    onFilterChange(newFilters);
  };

  const handlePriceChange = (value: number[]) => {
    const newFilters = { ...filters, priceRange: [value[0], value[1]] as [number, number] };
    setFilters(newFilters);
    // Aplicar filtro solo cuando el usuario suelta el slider (evitar muchas llamadas)
  };

  const handlePriceChangeCommitted = () => {
    onFilterChange(filters);
  };

  const handleClientTypeChange = (type: 'ALL' | 'RETAIL' | 'WHOLESALE') => {
    const newFilters = { ...filters, clientType: type };
    setFilters(newFilters);
    onFilterChange(newFilters);
  };

  const handleStockToggle = (checked: boolean) => {
    const newFilters = { ...filters, inStockOnly: checked };
    setFilters(newFilters);
    onFilterChange(newFilters);
  };

  const clearFilters = () => {
    const defaultFilters: FilterState = {
      categories: [],
      priceRange: [0, 1000],
      clientType: 'ALL',
      inStockOnly: false,
    };
    setFilters(defaultFilters);
    onFilterChange(defaultFilters);
  };

  const hasActiveFilters =
    filters.categories.length > 0 ||
    filters.priceRange[0] !== 0 ||
    filters.priceRange[1] !== 1000 ||
    filters.clientType !== 'ALL' ||
    filters.inStockOnly;

  return (
    <Card className="sticky top-20">
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle className="text-lg">Filtros</CardTitle>
          {hasActiveFilters && (
            <Button
              variant="ghost"
              size="sm"
              onClick={clearFilters}
              className="h-8 text-xs"
            >
              <X className="mr-1 h-3 w-3" />
              Limpiar
            </Button>
          )}
        </div>
      </CardHeader>

      <CardContent className="space-y-6">
        {/* Categorías */}
        <div className="space-y-3">
          <h4 className="font-medium text-sm text-muted-foreground">Categorías</h4>
          <div className="space-y-2">
            {categories.map((category) => {
              const isChecked = filters.categories.includes(category.id);
              return (
                <div key={category.id} className="flex items-center space-x-2">
                  <Checkbox
                    id={`category-${category.id}`}
                    checked={isChecked}
                    onCheckedChange={() => handleCategoryToggle(category.id)}
                  />
                  <Label
                    htmlFor={`category-${category.id}`}
                    className="text-sm font-normal cursor-pointer"
                  >
                    {category.name}
                  </Label>
                </div>
              );
            })}
          </div>
        </div>

        <Separator />

        {/* Rango de Precio */}
        <div className="space-y-4">
          <h4 className="font-medium text-sm text-muted-foreground">Rango de Precio</h4>
          <div className="px-2">
            <Slider
              min={0}
              max={1000}
              step={10}
              value={filters.priceRange}
              onValueChange={handlePriceChange}
              onValueCommit={handlePriceChangeCommitted}
              className="w-full"
            />
          </div>
          <div className="flex items-center justify-between text-sm">
            <span className="font-medium">{formatPrice(filters.priceRange[0])}</span>
            <span className="text-muted-foreground">hasta</span>
            <span className="font-medium">{formatPrice(filters.priceRange[1])}</span>
          </div>
        </div>

        <Separator />

        {/* Tipo de Cliente */}
        <div className="space-y-3">
          <h4 className="font-medium text-sm text-muted-foreground">Tipo de Compra</h4>
          <div className="space-y-2">
            <button
              onClick={() => handleClientTypeChange('ALL')}
              className={`w-full text-left px-3 py-2 rounded-md text-sm transition-colors ${
                filters.clientType === 'ALL'
                  ? 'bg-primary text-primary-foreground'
                  : 'hover:bg-accent'
              }`}
            >
              Todos los productos
            </button>
            <button
              onClick={() => handleClientTypeChange('RETAIL')}
              className={`w-full text-left px-3 py-2 rounded-md text-sm transition-colors ${
                filters.clientType === 'RETAIL'
                  ? 'bg-primary text-primary-foreground'
                  : 'hover:bg-accent'
              }`}
            >
              🛒 Menudeo
            </button>
            <button
              onClick={() => handleClientTypeChange('WHOLESALE')}
              className={`w-full text-left px-3 py-2 rounded-md text-sm transition-colors ${
                filters.clientType === 'WHOLESALE'
                  ? 'bg-primary text-primary-foreground'
                  : 'hover:bg-accent'
              }`}
            >
              💼 Mayoreo disponible
            </button>
          </div>
        </div>

        <Separator />

        {/* En Stock */}
        <div className="flex items-center space-x-2">
          <Checkbox
            id="in-stock"
            checked={filters.inStockOnly}
            onCheckedChange={handleStockToggle}
          />
          <Label htmlFor="in-stock" className="text-sm cursor-pointer">
            Solo productos en stock
          </Label>
        </div>

        {/* Active filters summary */}
        {hasActiveFilters && (
          <>
            <Separator />
            <div className="space-y-2">
              <h4 className="font-medium text-sm text-muted-foreground">Filtros activos</h4>
              <div className="flex flex-wrap gap-2">
                {filters.categories.length > 0 && (
                  <Badge variant="secondary">
                    {filters.categories.length} categoría
                    {filters.categories.length !== 1 ? 's' : ''}
                  </Badge>
                )}
                {filters.clientType !== 'ALL' && (
                  <Badge variant="secondary">
                    {filters.clientType === 'RETAIL' ? 'Menudeo' : 'Mayoreo'}
                  </Badge>
                )}
                {filters.inStockOnly && (
                  <Badge variant="secondary">En stock</Badge>
                )}
                {(filters.priceRange[0] !== 0 || filters.priceRange[1] !== 1000) && (
                  <Badge variant="secondary">Precio personalizado</Badge>
                )}
              </div>
            </div>
          </>
        )}
      </CardContent>
    </Card>
  );
}
