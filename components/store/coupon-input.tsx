'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Loader2, Tag, X } from 'lucide-react';

interface CouponInputProps {
  subtotal: number;
  onCouponApplied: (coupon: {
    id: string;
    code: string;
    discountType: 'PERCENTAGE' | 'FIXED';
    discountValue: number;
    discountAmount: number;
  }) => void;
  onCouponRemoved: () => void;
  appliedCoupon?: {
    id: string;
    code: string;
    discountType: 'PERCENTAGE' | 'FIXED';
    discountValue: number;
    discountAmount: number;
  } | null;
}

export function CouponInput({
  subtotal,
  onCouponApplied,
  onCouponRemoved,
  appliedCoupon,
}: CouponInputProps) {
  const [code, setCode] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleApplyCoupon = async () => {
    if (!code.trim()) {
      setError('Ingresa un código de cupón');
      return;
    }

    setIsLoading(true);
    setError(null);

    try {
      const response = await fetch('/api/coupons/validate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ code: code.toUpperCase(), subtotal }),
      });

      const data = await response.json();

      if (!response.ok) {
        setError(data.error || 'Error al validar cupón');
        return;
      }

      if (data.valid) {
        onCouponApplied({
          id: data.coupon.id,
          code: data.coupon.code,
          discountType: data.coupon.discountType,
          discountValue: data.coupon.discountValue,
          discountAmount: data.discountAmount,
        });
        setCode('');
        setError(null);
      }
    } catch (error) {
      console.error('❌ Error al aplicar cupón:', error);
      setError('Error al aplicar cupón');
    } finally {
      setIsLoading(false);
    }
  };

  const handleRemoveCoupon = () => {
    onCouponRemoved();
    setCode('');
    setError(null);
  };

  if (appliedCoupon) {
    return (
      <div className="border rounded-lg p-4 bg-green-50 border-green-200">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Tag className="h-5 w-5 text-green-600" />
            <div>
              <p className="font-medium text-green-900">
                Cupón "{appliedCoupon.code}" aplicado
              </p>
              <p className="text-sm text-green-700">
                Descuento:{' '}
                {appliedCoupon.discountType === 'PERCENTAGE'
                  ? `${appliedCoupon.discountValue}%`
                  : `$${appliedCoupon.discountValue.toFixed(2)}`}{' '}
                (-${appliedCoupon.discountAmount.toFixed(2)} MXN)
              </p>
            </div>
          </div>
          <Button
            variant="ghost"
            size="sm"
            onClick={handleRemoveCoupon}
            className="text-green-700 hover:text-green-900"
          >
            <X className="h-4 w-4" />
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-2">
      <label className="text-sm font-medium text-gray-700">
        ¿Tienes un cupón de descuento?
      </label>
      <div className="flex gap-2">
        <Input
          type="text"
          placeholder="Ingresa tu código"
          value={code}
          onChange={(e) => {
            setCode(e.target.value.toUpperCase());
            setError(null);
          }}
          onKeyDown={(e) => {
            if (e.key === 'Enter') {
              handleApplyCoupon();
            }
          }}
          disabled={isLoading}
          className="uppercase"
        />
        <Button
          onClick={handleApplyCoupon}
          disabled={isLoading || !code.trim()}
        >
          {isLoading ? (
            <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              Validando
            </>
          ) : (
            <>
              <Tag className="mr-2 h-4 w-4" />
              Aplicar
            </>
          )}
        </Button>
      </div>
      {error && (
        <p className="text-sm text-red-600 flex items-center gap-1">
          <X className="h-4 w-4" />
          {error}
        </p>
      )}
    </div>
  );
}
