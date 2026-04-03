'use client';

import { useState } from 'react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { AlertCircle, Download } from 'lucide-react';
import { Alert, AlertDescription } from '@/components/ui/alert';

interface DialogProps {
  open: boolean;
  onClose: () => void;
  onSuccess: () => void;
}

export function InventoryImportDialog({
  open,
  onClose,
  onSuccess,
}: DialogProps) {
  const [file, setFile] = useState<File | null>(null);
  const [loading, setLoading] = useState(false);


  const handleImport = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!file) return;

    setLoading(true);

    try {
      const formData = new FormData();
      formData.append('file', file);

      const response = await fetch('/api/admin/inventory/import', {
        method: 'POST',
        body: formData,
      });

      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.error);
      }

      alert(
        `Importación completada: ${result.success} productos actualizados, ${result.failed} errores`
      );

      if (result.errors.length > 0) {
        console.error('Errores:', result.errors);
      }

      onSuccess();
      onClose();
    } catch (error) {
      alert(
        error instanceof Error ? error.message : 'Error al importar'
      );
    } finally {
      setLoading(false);
    }
  };

  const downloadTemplate = () => {
    const template =
      'ID,Nombre,Slug,Stock,Precio Menudeo,Precio Mayoreo,Cantidad Mín. Mayoreo,Categoría\n' +
      'prod123,Producto Ejemplo,producto-ejemplo,50,100,80,12,Categoría1\n';

    const blob = new Blob([template], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'plantilla_inventario.csv';
    a.click();
  };

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Importar Inventario</DialogTitle>
        </DialogHeader>

        <div className="space-y-4">
          <Alert>
            <AlertCircle className="h-4 w-4" />
            <AlertDescription>
              El archivo debe ser CSV con columnas: ID, Nombre, Slug, Stock,
              etc.
            </AlertDescription>
          </Alert>

          <div>
            <Button
              type="button"
              variant="outline"
              className="w-full"
              onClick={downloadTemplate}
            >
              <Download className="mr-2 h-4 w-4" />
              Descargar Plantilla
            </Button>
          </div>

          <div>
            <Label htmlFor="file">Seleccionar Archivo CSV</Label>
            <Input
              id="file"
              type="file"
              accept=".csv"
              onChange={(e) => setFile(e.target.files?.[0] || null)}
            />
            {file && (
              <p className="text-sm text-muted-foreground mt-2">
                Archivo: {file.name}
              </p>
            )}
          </div>

          <DialogFooter>
            <Button type="button" variant="outline" onClick={onClose}>
              Cancelar
            </Button>
            <Button
              type="button"
              onClick={handleImport}
              disabled={!file || loading}
            >
              {loading ? 'Importando...' : 'Importar'}
            </Button>
          </DialogFooter>
        </div>
      </DialogContent>
    </Dialog>
  );
}
