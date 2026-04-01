'use client';

import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { formatPrice } from '@/lib/utils';
import { TrendingDown, Calculator } from 'lucide-react';

interface PriceCalculatorProps {
  retailPrice: number;
  wholesalePrice: number;
  minWholesale: number;
  productName?: string;
}

export default function PriceCalculator({
  retailPrice,
  wholesalePrice,
  minWholesale,
  productName = 'este producto',
}: PriceCalculatorProps) {
  const [quantity, setQuantity] = useState(minWholesale);
  const [totalRetail, setTotalRetail] = useState(0);
  const [totalWholesale, setTotalWholesale] = useState(0);
  const [savings, setSavings] = useState(0);
  const [savingsPercent, setSavingsPercent] = useState(0);

  useEffect(() => {
    const qty = Math.max(1, quantity);
    const retail = qty * retailPrice;
    const wholesale = qty * wholesalePrice;
    const saved = retail - wholesale;
    const percent = (saved / retail) * 100;

    setTotalRetail(retail);
    setTotalWholesale(wholesale);
    setSavings(saved);
    setSavingsPercent(percent);
  }, [quantity, retailPrice, wholesalePrice]);

  const handleQuantityChange = (value: string) => {
    const num = parseInt(value) || 0;
    setQuantity(num);
  };

  const isWholesaleEligible = quantity >= minWholesale;

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Calculator className="h-5 w-5 text-purple-600" />
          Calculadora de Ahorros
        </CardTitle>
        <p className="text-sm text-gray-600">
          Calcula cuánto ahorras comprando al mayoreo
        </p>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Input de cantidad */}
        <div className="space-y-2">
          <Label htmlFor="quantity">¿Cuántas piezas quieres comprar?</Label>
          <Input
            id="quantity"
            type="number"
            min="1"
            value={quantity}
            onChange={(e) => handleQuantityChange(e.target.value)}
            className="text-lg"
          />
          {!isWholesaleEligible && (
            <p className="text-sm text-orange-600">
              💡 Compra mínimo {minWholesale} piezas para acceder al precio
              mayoreo
            </p>
          )}
        </div>

        {/* Comparativa de precios */}
        <div className="space-y-3">
          {/* Precio Menudeo */}
          <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
            <div>
              <p className="text-sm text-gray-600">Precio Menudeo</p>
              <p className="text-xs text-gray-500">
                {quantity} × {formatPrice(retailPrice)}
              </p>
            </div>
            <p className="text-xl font-bold">{formatPrice(totalRetail)}</p>
          </div>

          {/* Precio Mayoreo */}
          <div
            className={`flex items-center justify-between p-3 rounded-lg ${
              isWholesaleEligible
                ? 'bg-purple-50 border-2 border-purple-200'
                : 'bg-gray-50 opacity-50'
            }`}
          >
            <div>
              <p className="text-sm font-medium text-purple-700">
                Precio Mayoreo {isWholesaleEligible && '✓'}
              </p>
              <p className="text-xs text-gray-600">
                {quantity} × {formatPrice(wholesalePrice)}
              </p>
            </div>
            <p className="text-xl font-bold text-purple-700">
              {formatPrice(totalWholesale)}
            </p>
          </div>
        </div>

        {/* Ahorro */}
        {isWholesaleEligible && savings > 0 && (
          <div className="p-4 bg-green-50 border-2 border-green-200 rounded-lg">
            <div className="flex items-start gap-3">
              <TrendingDown className="h-6 w-6 text-green-600 flex-shrink-0 mt-1" />
              <div className="flex-1">
                <p className="font-semibold text-green-900">
                  ¡Ahorras {formatPrice(savings)}!
                </p>
                <p className="text-sm text-green-700 mt-1">
                  Eso es un {savingsPercent.toFixed(1)}% de descuento comprando
                  al mayoreo
                </p>
              </div>
            </div>
          </div>
        )}

        {/* Mensaje motivador */}
        {!isWholesaleEligible && (
          <div className="p-4 bg-blue-50 border border-blue-200 rounded-lg">
            <p className="text-sm text-blue-900">
              <strong>¿Sabías que...?</strong> Si aumentas tu compra a{' '}
              {minWholesale} piezas, ahorrarías{' '}
              <span className="font-bold">
                {formatPrice(
                  minWholesale * retailPrice - minWholesale * wholesalePrice
                )}
              </span>
            </p>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
