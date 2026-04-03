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
import { Textarea } from '@/components/ui/textarea';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';

interface Product {
  id: string;
  name: string;
  stock: number;
}

interface DialogProps {
  product: Product;
  onClose: () => void;
  onSuccess: () => void;
}

export function InventoryAdjustDialog({
  product,
  onClose,
  onSuccess,
}: DialogProps) {
  const [quantity, setQuantity] = useState('');
  const [type, setType] = useState('ADJUSTMENT');
  const [note, setNote] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      const response = await fetch('/api/admin/inventory/adjust', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          productId: product.id,
          quantity: parseInt(quantity),
          type,
          note,
        }),
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error);
      }

      alert('Stock ajustado correctamente');
      onSuccess();
    } catch (error) {
      alert(
        error instanceof Error ? error.message : 'Error al ajustar stock'
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open onOpenChange={onClose}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Ajustar Stock - {product.name}</DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <Label>Stock Actual</Label>
            <div className="text-xl font-bold">{product.stock} unidades</div>
          </div>

          <div>
            <Label htmlFor="quantity">Cantidad a Ajustar</Label>
            <Input
              id="quantity"
              type="number"
              placeholder="Ej: 10 o -5"
              value={quantity}
              onChange={(e) => setQuantity(e.target.value)}
              required
            />
            <p className="text-xs text-muted-foreground mt-1">
              Positivo para entrada, negativo para salida
            </p>
          </div>

          <div>
            <Label htmlFor="type">Tipo de Movimiento</Label>
            <Select value={type} onValueChange={setType}>
              <SelectTrigger id="type">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="ADJUSTMENT">Ajuste</SelectItem>
                <SelectItem value="PURCHASE">Compra</SelectItem>
                <SelectItem value="RETURN">Devolución</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div>
            <Label htmlFor="note">Nota (opcional)</Label>
            <Textarea
              id="note"
              placeholder="Razón del ajuste..."
              value={note}
              onChange={(e) => setNote(e.target.value)}
              rows={3}
            />
          </div>

          <DialogFooter>
            <Button type="button" variant="outline" onClick={onClose}>
              Cancelar
            </Button>
            <Button type="submit" disabled={loading || !quantity}>
              {loading ? 'Guardando...' : 'Guardar Ajuste'}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
