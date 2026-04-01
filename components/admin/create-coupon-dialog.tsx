'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Switch } from '@/components/ui/switch';
import { Plus, Loader2 } from 'lucide-react';

export function CreateCouponDialog() {
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  const [formData, setFormData] = useState({
    code: '',
    discountType: 'PERCENTAGE' as 'PERCENTAGE' | 'FIXED',
    discountValue: '',
    maxUses: '',
    minPurchase: '',
    startDate: '',
    endDate: '',
    active: true,
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      const payload = {
        code: formData.code.toUpperCase(),
        discountType: formData.discountType,
        discountValue: parseFloat(formData.discountValue),
        maxUses: formData.maxUses ? parseInt(formData.maxUses) : null,
        minPurchase: formData.minPurchase
          ? parseFloat(formData.minPurchase)
          : null,
        startDate: new Date(formData.startDate).toISOString(),
        endDate: new Date(formData.endDate).toISOString(),
        active: formData.active,
      };

      const response = await fetch('/api/admin/coupons', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });

      if (response.ok) {
        setOpen(false);
        setFormData({
          code: '',
          discountType: 'PERCENTAGE',
          discountValue: '',
          maxUses: '',
          minPurchase: '',
          startDate: '',
          endDate: '',
          active: true,
        });
        router.refresh();
      } else {
        const data = await response.json();
        alert(data.error || 'Error al crear cupón');
      }
    } catch (error) {
      console.error('❌ Error al crear cupón:', error);
      alert('Error al crear cupón');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button>
          <Plus className="mr-2 h-4 w-4" />
          Crear Cupón
        </Button>
      </DialogTrigger>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Crear Cupón de Descuento</DialogTitle>
          <DialogDescription>
            Define los parámetros del nuevo cupón promocional
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Código */}
            <div className="space-y-2">
              <Label htmlFor="code">
                Código <span className="text-red-600">*</span>
              </Label>
              <Input
                id="code"
                placeholder="VERANO2024"
                value={formData.code}
                onChange={(e) =>
                  setFormData({ ...formData, code: e.target.value.toUpperCase() })
                }
                required
                pattern="[A-Z0-9_-]+"
                title="Solo letras mayúsculas, números, guiones y guiones bajos"
              />
            </div>

            {/* Tipo de descuento */}
            <div className="space-y-2">
              <Label htmlFor="type">
                Tipo de Descuento <span className="text-red-600">*</span>
              </Label>
              <Select
                value={formData.discountType}
                onValueChange={(value: 'PERCENTAGE' | 'FIXED') =>
                  setFormData({ ...formData, discountType: value })
                }
              >
                <SelectTrigger id="type">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="PERCENTAGE">Porcentaje (%)</SelectItem>
                  <SelectItem value="FIXED">Monto Fijo ($)</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {/* Valor del descuento */}
            <div className="space-y-2">
              <Label htmlFor="value">
                Valor del Descuento <span className="text-red-600">*</span>
              </Label>
              <Input
                id="value"
                type="number"
                step="0.01"
                min="0"
                max={formData.discountType === 'PERCENTAGE' ? '100' : undefined}
                placeholder={
                  formData.discountType === 'PERCENTAGE' ? '10' : '50.00'
                }
                value={formData.discountValue}
                onChange={(e) =>
                  setFormData({ ...formData, discountValue: e.target.value })
                }
                required
              />
              <p className="text-xs text-gray-500">
                {formData.discountType === 'PERCENTAGE'
                  ? 'Porcentaje de descuento (0-100)'
                  : 'Monto fijo en pesos mexicanos'}
              </p>
            </div>

            {/* Usos máximos */}
            <div className="space-y-2">
              <Label htmlFor="maxUses">Usos Máximos</Label>
              <Input
                id="maxUses"
                type="number"
                min="1"
                placeholder="Ilimitado"
                value={formData.maxUses}
                onChange={(e) =>
                  setFormData({ ...formData, maxUses: e.target.value })
                }
              />
              <p className="text-xs text-gray-500">
                Dejar vacío para usos ilimitados
              </p>
            </div>

            {/* Compra mínima */}
            <div className="space-y-2">
              <Label htmlFor="minPurchase">Compra Mínima</Label>
              <Input
                id="minPurchase"
                type="number"
                step="0.01"
                min="0"
                placeholder="Sin mínimo"
                value={formData.minPurchase}
                onChange={(e) =>
                  setFormData({ ...formData, minPurchase: e.target.value })
                }
              />
              <p className="text-xs text-gray-500">
                Monto mínimo para aplicar el cupón
              </p>
            </div>

            {/* Fecha de inicio */}
            <div className="space-y-2">
              <Label htmlFor="startDate">
                Fecha de Inicio <span className="text-red-600">*</span>
              </Label>
              <Input
                id="startDate"
                type="datetime-local"
                value={formData.startDate}
                onChange={(e) =>
                  setFormData({ ...formData, startDate: e.target.value })
                }
                required
              />
            </div>

            {/* Fecha de fin */}
            <div className="space-y-2">
              <Label htmlFor="endDate">
                Fecha de Fin <span className="text-red-600">*</span>
              </Label>
              <Input
                id="endDate"
                type="datetime-local"
                value={formData.endDate}
                onChange={(e) =>
                  setFormData({ ...formData, endDate: e.target.value })
                }
                required
              />
            </div>
          </div>

          {/* Activo */}
          <div className="flex items-center space-x-2">
            <Switch
              id="active"
              checked={formData.active}
              onCheckedChange={(checked) =>
                setFormData({ ...formData, active: checked })
              }
            />
            <Label htmlFor="active" className="cursor-pointer">
              Activar cupón inmediatamente
            </Label>
          </div>

          <DialogFooter>
            <Button
              type="button"
              variant="outline"
              onClick={() => setOpen(false)}
              disabled={isLoading}
            >
              Cancelar
            </Button>
            <Button type="submit" disabled={isLoading}>
              {isLoading ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Creando...
                </>
              ) : (
                'Crear Cupón'
              )}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
