import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

/**
 * Formatea un número como precio en pesos mexicanos
 */
export function formatPrice(amount: number): string {
  return new Intl.NumberFormat('es-MX', {
    style: 'currency',
    currency: 'MXN',
  }).format(amount);
}

/**
 * Calcula el precio unitario basado en cantidad y precios de menudeo/mayoreo
 */
export function calculatePrice(
  quantity: number,
  priceRetail: number,
  priceWholesale: number | null,
  minWholesale: number | null
): number {
  if (priceWholesale && minWholesale && quantity >= minWholesale) {
    return priceWholesale;
  }
  return priceRetail;
}
