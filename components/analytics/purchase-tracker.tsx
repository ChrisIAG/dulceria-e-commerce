'use client';

import { useEffect, useState } from 'react';
import { useSearchParams } from 'next/navigation';
import { purchase as trackPurchase } from '@/lib/analytics';

export function PurchaseTracker() {
  const searchParams = useSearchParams();
  const sessionId = searchParams.get('session_id');
  const [tracked, setTracked] = useState(false);

  useEffect(() => {
    // Solo rastrear una vez y solo si tenemos session_id
    if (!sessionId || tracked) return;

    const trackOrder = async () => {
      try {
        // Obtener datos del pedido desde la API
        const response = await fetch(`/api/orders/session?session_id=${sessionId}`);
        
        if (!response.ok) {
          console.error('Error al obtener datos del pedido para analytics');
          return;
        }

        const orderData = await response.json();

        // Rastrear evento de purchase
        trackPurchase({
          transactionId: orderData.transactionId,
          value: orderData.value,
          shipping: orderData.shipping,
          tax: orderData.tax,
          coupon: orderData.coupon,
          items: orderData.items,
        });

        setTracked(true);
        console.log('✅ Purchase event tracked:', orderData.transactionId);
      } catch (error) {
        console.error('Error al rastrear purchase:', error);
      }
    };

    trackOrder();
  }, [sessionId, tracked]);

  return null; // Componente invisible
}
