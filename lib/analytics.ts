/**
 * Google Analytics 4 Tracking Helpers
 * 
 * Este módulo proporciona funciones helper para tracking de eventos
 * en Google Analytics 4 (GA4).
 */

// Tipos para los eventos de GA4
export interface GAProduct {
  item_id: string;
  item_name: string;
  item_category?: string;
  price?: number;
  quantity?: number;
}

export interface GAEvent {
  action: string;
  category?: string;
  label?: string;
  value?: number;
}

// Declaración global para gtag
declare global {
  interface Window {
    gtag?: (
      command: string,
      targetId: string | Date,
      config?: Record<string, any>
    ) => void;
  }
}

/**
 * Verificar si Google Analytics está disponible
 */
const isGAAvailable = (): boolean => {
  return typeof window !== 'undefined' && typeof window.gtag === 'function';
};

/**
 * Track de page view (llamado automáticamente por Next.js con el script)
 */
export const pageview = (url: string): void => {
  if (!isGAAvailable()) return;
  window.gtag!('config', process.env.NEXT_PUBLIC_GA_MEASUREMENT_ID!, {
    page_path: url,
  });
};

/**
 * Track de evento genérico
 */
export const event = ({ action, category, label, value }: GAEvent): void => {
  if (!isGAAvailable()) return;
  window.gtag!('event', action, {
    event_category: category,
    event_label: label,
    value: value,
  });
};

/**
 * Evento: Ver producto (view_item)
 * Se dispara cuando el usuario ve la página de un producto
 */
export const viewItem = (product: {
  id: string;
  name: string;
  category?: string;
  price: number;
}): void => {
  if (!isGAAvailable()) return;
  window.gtag!('event', 'view_item', {
    currency: 'MXN',
    value: product.price,
    items: [
      {
        item_id: product.id,
        item_name: product.name,
        item_category: product.category || 'Sin categoría',
        price: product.price,
        quantity: 1,
      },
    ],
  });
};

/**
 * Evento: Agregar al carrito (add_to_cart)
 * Se dispara cuando el usuario agrega un producto al carrito
 */
export const addToCart = (product: {
  id: string;
  name: string;
  category?: string;
  price: number;
  quantity: number;
}): void => {
  if (!isGAAvailable()) return;
  window.gtag!('event', 'add_to_cart', {
    currency: 'MXN',
    value: product.price * product.quantity,
    items: [
      {
        item_id: product.id,
        item_name: product.name,
        item_category: product.category || 'Sin categoría',
        price: product.price,
        quantity: product.quantity,
      },
    ],
  });
};

/**
 * Evento: Remover del carrito (remove_from_cart)
 * Se dispara cuando el usuario elimina un producto del carrito
 */
export const removeFromCart = (product: {
  id: string;
  name: string;
  price: number;
  quantity: number;
}): void => {
  if (!isGAAvailable()) return;
  window.gtag!('event', 'remove_from_cart', {
    currency: 'MXN',
    value: product.price * product.quantity,
    items: [
      {
        item_id: product.id,
        item_name: product.name,
        price: product.price,
        quantity: product.quantity,
      },
    ],
  });
};

/**
 * Evento: Ver carrito (view_cart)
 * Se dispara cuando el usuario ve su carrito
 */
export const viewCart = (items: GAProduct[], totalValue: number): void => {
  if (!isGAAvailable()) return;
  window.gtag!('event', 'view_cart', {
    currency: 'MXN',
    value: totalValue,
    items: items.map((item) => ({
      item_id: item.item_id,
      item_name: item.item_name,
      item_category: item.item_category,
      price: item.price,
      quantity: item.quantity,
    })),
  });
};

/**
 * Evento: Iniciar checkout (begin_checkout)
 * Se dispara cuando el usuario inicia el proceso de pago
 */
export const beginCheckout = (items: GAProduct[], totalValue: number): void => {
  if (!isGAAvailable()) return;
  window.gtag!('event', 'begin_checkout', {
    currency: 'MXN',
    value: totalValue,
    items: items.map((item) => ({
      item_id: item.item_id,
      item_name: item.item_name,
      item_category: item.item_category,
      price: item.price,
      quantity: item.quantity,
    })),
  });
};

/**
 * Evento: Agregar cupón (add_shipping_info)
 * Se dispara cuando el usuario aplica un cupón de descuento
 */
export const applyCoupon = (couponCode: string, discountValue: number): void => {
  if (!isGAAvailable()) return;
  window.gtag!('event', 'add_promotion', {
    promotion_name: couponCode,
    value: discountValue,
    currency: 'MXN',
  });
};

/**
 * Evento: Compra completada (purchase)
 * Se dispara cuando se confirma el pago exitoso
 */
export const purchase = (transaction: {
  transactionId: string;
  value: number;
  shipping?: number;
  tax?: number;
  coupon?: string;
  items: GAProduct[];
}): void => {
  if (!isGAAvailable()) return;
  window.gtag!('event', 'purchase', {
    transaction_id: transaction.transactionId,
    value: transaction.value,
    currency: 'MXN',
    shipping: transaction.shipping || 0,
    tax: transaction.tax || 0,
    coupon: transaction.coupon || '',
    items: transaction.items.map((item) => ({
      item_id: item.item_id,
      item_name: item.item_name,
      item_category: item.item_category,
      price: item.price,
      quantity: item.quantity,
    })),
  });
};

/**
 * Evento: Búsqueda (search)
 * Se dispara cuando el usuario realiza una búsqueda
 */
export const search = (searchTerm: string): void => {
  if (!isGAAvailable()) return;
  window.gtag!('event', 'search', {
    search_term: searchTerm,
  });
};

/**
 * Evento: Registrarse (sign_up)
 * Se dispara cuando un usuario completa el registro
 */
export const signUp = (method: string = 'email'): void => {
  if (!isGAAvailable()) return;
  window.gtag!('event', 'sign_up', {
    method: method,
  });
};

/**
 * Evento: Login (login)
 * Se dispara cuando un usuario inicia sesión
 */
export const login = (method: string = 'email'): void => {
  if (!isGAAvailable()) return;
  window.gtag!('event', 'login', {
    method: method,
  });
};

/**
 * Evento: Agregar a favoritos (add_to_wishlist)
 * Se dispara cuando el usuario agrega un producto a favoritos
 */
export const addToWishlist = (product: {
  id: string;
  name: string;
  category?: string;
  price: number;
}): void => {
  if (!isGAAvailable()) return;
  window.gtag!('event', 'add_to_wishlist', {
    currency: 'MXN',
    value: product.price,
    items: [
      {
        item_id: product.id,
        item_name: product.name,
        item_category: product.category || 'Sin categoría',
        price: product.price,
      },
    ],
  });
};
