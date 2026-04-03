'use client';

import { useState, useEffect } from 'react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Button } from '@/components/ui/button';
import { InventoryStats } from '@/components/admin/inventory-stats';
import { InventoryTable } from '@/components/admin/inventory-table';
import { InventoryImportDialog } from '@/components/admin/inventory-import-dialog';
import { Download, Upload, RefreshCw } from 'lucide-react';

export default function InventarioPage() {
  const [importOpen, setImportOpen] = useState(false);
  const [products, setProducts] = useState([]);
  const [refreshKey, setRefreshKey] = useState(0);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchProducts = async () => {
      try {
        setLoading(true);
        const response = await fetch('/api/products?limit=500');
        const data = await response.json();
        setProducts(data.products || []);
      } catch (error) {
        console.error('Error fetching products:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchProducts();
  }, [refreshKey]);

  const handleExport = async () => {
    try {
      const response = await fetch('/api/admin/inventory/export');
      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `inventario_${new Date().toISOString().split('T')[0]}.csv`;
      a.click();
      window.URL.revokeObjectURL(url);
    } catch (error) {
      console.error('Error exporting:', error);
    }
  };

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Gestión de Inventario</h1>
        <p className="text-muted-foreground mt-2">
          Controla movimientos de stock, alertas y reportes
        </p>
      </div>

      <InventoryStats />

      <Tabs defaultValue="productos" className="space-y-4">
        <TabsList>
          <TabsTrigger value="productos">Productos</TabsTrigger>
          <TabsTrigger value="historial">Historial</TabsTrigger>
          <TabsTrigger value="importar">Importar/Exportar</TabsTrigger>
        </TabsList>

        <TabsContent value="productos" className="space-y-4">
          <div className="flex justify-end gap-2">
            <Button
              variant="outline"
              onClick={() => setRefreshKey((k) => k + 1)}
              disabled={loading}
            >
              <RefreshCw className={`mr-2 h-4 w-4 ${loading ? 'animate-spin' : ''}`} />
              Actualizar
            </Button>
          </div>
          {loading ? (
            <div className="text-center py-8 text-muted-foreground">
              Cargando productos...
            </div>
          ) : (
            <InventoryTable
              products={products}
              onAdjust={() => setRefreshKey((k) => k + 1)}
            />
          )}
        </TabsContent>

        <TabsContent value="historial">
          <div className="text-center py-8 text-muted-foreground">
            El historial de movimientos estará disponible próximamente.
            <br />
            Puedes ver los ajustes de inventario en los logs del sistema.
          </div>
        </TabsContent>

        <TabsContent value="importar" className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <Button onClick={handleExport} className="h-20">
              <Download className="mr-2 h-4 w-4" />
              Exportar Inventario
            </Button>
            <Button
              onClick={() => setImportOpen(true)}
              className="h-20"
              variant="outline"
            >
              <Upload className="mr-2 h-4 w-4" />
              Importar Inventario
            </Button>
          </div>
        </TabsContent>
      </Tabs>

      <InventoryImportDialog
        open={importOpen}
        onClose={() => setImportOpen(false)}
        onSuccess={() => setRefreshKey((k) => k + 1)}
      />
    </div>
  );
}
