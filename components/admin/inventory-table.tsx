'use client';

import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { formatPrice } from '@/lib/utils';
import { AlertCircle, AlertTriangle, CheckCircle } from 'lucide-react';
import { InventoryAdjustDialog } from './inventory-adjust-dialog';
import { useState } from 'react';

interface Product {
  id: string;
  name: string;
  stock: number;
  price: number;
  category?: { name: string };
}

interface InventoryTableProps {
  products: Product[];
  onAdjust?: () => void;
}

export function InventoryTable({ products, onAdjust }: InventoryTableProps) {
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);

  const getStockStatus = (stock: number) => {
    if (stock === 0) {
      return {
        icon: <AlertCircle className="h-4 w-4" />,
        label: 'Agotado',
        color: 'destructive' as const,
      };
    } else if (stock < 10) {
      return {
        icon: <AlertTriangle className="h-4 w-4" />,
        label: 'Stock Bajo',
        color: 'secondary' as const,
      };
    } else {
      return {
        icon: <CheckCircle className="h-4 w-4" />,
        label: 'Ok',
        color: 'default' as const,
      };
    }
  };

  return (
    <>
      <div className="border rounded-lg">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Producto</TableHead>
              <TableHead>Categoría</TableHead>
              <TableHead className="text-right">Stock</TableHead>
              <TableHead className="text-right">Estado</TableHead>
              <TableHead className="text-right">Valor</TableHead>
              <TableHead>Acciones</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {products.length === 0 ? (
              <TableRow>
                <TableCell colSpan={6} className="text-center text-muted-foreground py-8">
                  No hay productos para mostrar
                </TableCell>
              </TableRow>
            ) : (
              products.map((product) => {
                const status = getStockStatus(product.stock);
                return (
                  <TableRow key={product.id}>
                    <TableCell className="font-medium">{product.name}</TableCell>
                    <TableCell>{product.category?.name || '-'}</TableCell>
                    <TableCell className="text-right font-semibold">
                      {product.stock}
                    </TableCell>
                    <TableCell className="text-right">
                      <Badge variant={status.color}>
                        <span className="inline-flex items-center gap-1">
                          {status.icon}
                          {status.label}
                        </span>
                      </Badge>
                    </TableCell>
                    <TableCell className="text-right">
                      {formatPrice(product.stock * product.price)}
                    </TableCell>
                    <TableCell>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => setSelectedProduct(product)}
                      >
                        Ajustar
                      </Button>
                    </TableCell>
                  </TableRow>
                );
              })
            )}
          </TableBody>
        </Table>
      </div>

      {selectedProduct && (
        <InventoryAdjustDialog
          product={selectedProduct}
          onClose={() => setSelectedProduct(null)}
          onSuccess={() => {
            setSelectedProduct(null);
            onAdjust?.();
          }}
        />
      )}
    </>
  );
}
