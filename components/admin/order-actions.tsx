'use client';

import { useState } from 'react';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useRouter } from 'next/navigation';
import { Loader2, Truck } from 'lucide-react';

interface OrderActionsProps {
  orderId: string;
  currentStatus: string;
  folio: string;
}

const STATUS_LABELS: Record<string, string> = {
  PENDING: 'Pendiente',
  PAID: 'Pagado',
  PREPARING: 'Preparando',
  SHIPPED: 'Enviado',
  DELIVERED: 'Entregado',
  CANCELLED: 'Cancelado',
};

const STATUS_OPTIONS = [
  { value: 'PENDING', label: 'Pendiente' },
  { value: 'PAID', label: 'Pagado' },
  { value: 'PREPARING', label: 'Preparando' },
  { value: 'SHIPPED', label: 'Enviado' },
  { value: 'DELIVERED', label: 'Entregado' },
  { value: 'CANCELLED', label: 'Cancelado' },
];

const CARRIERS = ['FedEx', 'DHL', 'Estafeta', 'Redpack', 'Paquetexpress', '99 Minutos'];

export function OrderActions({ orderId, currentStatus, folio }: OrderActionsProps) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [trackingDialogOpen, setTrackingDialogOpen] = useState(false);
  const [trackingNumber, setTrackingNumber] = useState('');
  const [carrier, setCarrier] = useState('');

  const handleStatusChange = async (newStatus: string) => {
    if (loading) return;

    const confirmed = confirm(
      `¿Estás seguro de cambiar el estado a "${STATUS_LABELS[newStatus]}"?${
        newStatus === 'CANCELLED'
          ? '\n\nEsto devolverá el stock de los productos.'
          : ''
      }`
    );

    if (!confirmed) return;

    setLoading(true);

    try {
      const res = await fetch(`/api/admin/orders/${orderId}/status`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status: newStatus }),
      });

      if (!res.ok) {
        const error = await res.json();
        alert(`Error: ${error.error}`);
        return;
      }

      router.refresh();
    } catch (error) {
      console.error('Error updating status:', error);
      alert('Error al actualizar el estado');
    } finally {
      setLoading(false);
    }
  };

  const handleAddTracking = async () => {
    if (!trackingNumber || !carrier) {
      alert('Por favor completa todos los campos');
      return;
    }

    setLoading(true);

    try {
      const res = await fetch(`/api/admin/orders/${orderId}/tracking`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          trackingNumber,
          carrier,
        }),
      });

      if (!res.ok) {
        const error = await res.json();
        alert(`Error: ${error.error}`);
        return;
      }

      setTrackingDialogOpen(false);
      setTrackingNumber('');
      setCarrier('');
      router.refresh();
    } catch (error) {
      console.error('Error adding tracking:', error);
      alert('Error al agregar tracking');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex items-center gap-2">
      {/* Selector de Estado */}
      <Select value={currentStatus} onValueChange={handleStatusChange} disabled={loading}>
        <SelectTrigger className="w-[160px]">
          <SelectValue />
        </SelectTrigger>
        <SelectContent>
          {STATUS_OPTIONS.map((option) => (
            <SelectItem key={option.value} value={option.value}>
              {option.label}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>

      {/* Botón Agregar Tracking */}
      {(currentStatus === 'PAID' || currentStatus === 'PREPARING') && (
        <Dialog open={trackingDialogOpen} onOpenChange={setTrackingDialogOpen}>
          <DialogTrigger asChild>
            <Button variant="outline" size="sm">
              <Truck className="h-4 w-4 mr-2" />
              Agregar Tracking
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Agregar Información de Envío</DialogTitle>
              <DialogDescription>
                Folio: {folio} - El estado cambiará automáticamente a "Enviado"
              </DialogDescription>
            </DialogHeader>
            <div className="space-y-4 py-4">
              <div className="space-y-2">
                <Label htmlFor="carrier">Paquetería</Label>
                <Select value={carrier} onValueChange={setCarrier}>
                  <SelectTrigger id="carrier">
                    <SelectValue placeholder="Selecciona paquetería" />
                  </SelectTrigger>
                  <SelectContent>
                    {CARRIERS.map((c) => (
                      <SelectItem key={c} value={c}>
                        {c}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label htmlFor="tracking">Número de Guía</Label>
                <Input
                  id="tracking"
                  placeholder="Ej: 1234567890"
                  value={trackingNumber}
                  onChange={(e) => setTrackingNumber(e.target.value)}
                />
              </div>
              <Button onClick={handleAddTracking} disabled={loading} className="w-full">
                {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                Guardar Tracking
              </Button>
            </div>
          </DialogContent>
        </Dialog>
      )}
    </div>
  );
}
