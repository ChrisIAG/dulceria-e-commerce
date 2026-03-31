'use client';

import { useEffect, useState } from 'react';

/**
 * Hook para manejar la hidratación de Zustand con persist middleware
 * Evita problemas de SSR/SSG donde el store no está disponible durante el build
 */
export function useHydration() {
  const [hydrated, setHydrated] = useState(false);

  useEffect(() => {
    setHydrated(true);
  }, []);

  return hydrated;
}
