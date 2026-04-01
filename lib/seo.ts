/**
 * SEO Helpers - Funciones para generar metadata estructurada
 * JSON-LD para Schema.org y Open Graph tags
 */

import { Metadata } from 'next';

const baseUrl = process.env.NEXTAUTH_URL || 'https://dulceria-online.com';
const siteName = 'Dulcería Online';
const defaultDescription =
  'Dulces típicos mexicanos al mejor precio. Menudeo y mayoreo con envío a todo México. Gran variedad de dulces, chocolates, botanas y más.';

interface Product {
  id: string;
  name: string;
  slug: string;
  description: string | null;
  price: number;
  wholesalePrice: number | null;
  minWholesale: number | null;
  images: string[];
  stock: number;
  category?: { name: string; slug: string } | null;
}

interface Review {
  rating: number;
  comment: string | null;
  user: { name: string | null };
  createdAt: Date;
}

/**
 * Genera JSON-LD para Schema.org Product
 */
export function generateProductJsonLd(product: Product, reviews?: Review[]) {
  const averageRating =
    reviews && reviews.length > 0
      ? reviews.reduce((sum, r) => sum + r.rating, 0) / reviews.length
      : undefined;

  const jsonLd = {
    '@context': 'https://schema.org',
    '@type': 'Product',
    name: product.name,
    description: product.description || `${product.name} - ${siteName}`,
    image: product.images[0] || `${baseUrl}/placeholder-product.jpg`,
    sku: product.id,
    brand: {
      '@type': 'Brand',
      name: siteName,
    },
    offers: {
      '@type': 'Offer',
      url: `${baseUrl}/catalogo/${product.slug}`,
      priceCurrency: 'MXN',
      price: product.price,
      availability:
        product.stock > 0
          ? 'https://schema.org/InStock'
          : 'https://schema.org/OutOfStock',
      seller: {
        '@type': 'Organization',
        name: siteName,
      },
    },
  };

  // Agregar rating si hay reseñas
  if (averageRating && reviews && reviews.length > 0) {
    (jsonLd as any).aggregateRating = {
      '@type': 'AggregateRating',
      ratingValue: averageRating.toFixed(1),
      reviewCount: reviews.length,
      bestRating: 5,
      worstRating: 1,
    };
  }

  // Agregar oferta de mayoreo si existe
  if (product.wholesalePrice && product.minWholesale) {
    (jsonLd as any).offers = [
      jsonLd.offers,
      {
        '@type': 'Offer',
        name: 'Precio Mayoreo',
        price: product.wholesalePrice,
        priceCurrency: 'MXN',
        eligibleQuantity: {
          '@type': 'QuantitativeValue',
          minValue: product.minWholesale,
        },
      },
    ];
  }

  return jsonLd;
}

/**
 * Genera JSON-LD para BreadcrumbList
 */
export function generateBreadcrumbJsonLd(items: { name: string; url: string }[]) {
  return {
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    itemListElement: items.map((item, index) => ({
      '@type': 'ListItem',
      position: index + 1,
      name: item.name,
      item: item.url,
    })),
  };
}

/**
 * Genera JSON-LD para Organization (página principal)
 */
export function generateOrganizationJsonLd() {
  return {
    '@context': 'https://schema.org',
    '@type': 'Organization',
    name: siteName,
    url: baseUrl,
    logo: `${baseUrl}/logo.png`,
    description: defaultDescription,
    contactPoint: {
      '@type': 'ContactPoint',
      contactType: 'customer service',
      email: 'contacto@dulceria-online.com',
      availableLanguage: 'Spanish',
    },
    sameAs: [
      // Agregar redes sociales aquí
      'https://facebook.com/dulceriaonline',
      'https://instagram.com/dulceriaonline',
    ],
  };
}

/**
 * Genera metadata básica de Open Graph
 */
export function generateOgMetadata(options: {
  title: string;
  description?: string;
  image?: string;
  url: string;
  type?: 'website' | 'article';
}): Metadata {
  const {
    title,
    description = defaultDescription,
    image = `${baseUrl}/og-image.jpg`,
    url,
    type = 'website',
  } = options;

  return {
    title,
    description,
    openGraph: {
      type,
      siteName,
      title,
      description,
      url,
      images: [
        {
          url: image,
          width: 1200,
          height: 630,
          alt: title,
        },
      ],
      locale: 'es_MX',
    },
    twitter: {
      card: 'summary_large_image',
      title,
      description,
      images: [image],
    },
  };
}

/**
 * Genera metadata completa para producto
 */
export function generateProductMetadata(product: Product, reviews?: Review[]): Metadata {
  const averageRating =
    reviews && reviews.length > 0
      ? reviews.reduce((sum, r) => sum + r.rating, 0) / reviews.length
      : undefined;

  const title = `${product.name} - ${siteName}`;
  const description =
    product.description?.slice(0, 160) ||
    `Compra ${product.name} en ${siteName}. Precio menudeo $${product.price} MXN${
      product.wholesalePrice
        ? ` | Mayoreo $${product.wholesalePrice} desde ${product.minWholesale} piezas`
        : ''
    }. Envío a todo México.`;

  const image = product.images[0] || `${baseUrl}/placeholder-product.jpg`;

  const metadata: Metadata = {
    title,
    description,
    openGraph: {
      type: 'website',
      siteName,
      title,
      description,
      url: `${baseUrl}/catalogo/${product.slug}`,
      images: [
        {
          url: image,
          width: 1200,
          height: 630,
          alt: product.name,
        },
      ],
      locale: 'es_MX',
    },
    twitter: {
      card: 'summary_large_image',
      title,
      description,
      images: [image],
    },
  };

  // Add product-specific metadata
  (metadata as any).other = {
    'product:price:amount': product.price.toString(),
    'product:price:currency': 'MXN',
  };

  if (averageRating) {
    (metadata as any).other = {
      ...(metadata as any).other,
      'product:rating:value': averageRating.toFixed(1),
      'product:rating:count': reviews!.length.toString(),
    };
  }

  return metadata;
}

/**
 * Genera metadata para listado de productos (catálogo)
 */
export function generateCatalogMetadata(options?: {
  category?: string;
  page?: number;
}): Metadata {
  const { category, page } = options || {};

  let title = 'Catálogo de Dulces Mexicanos';
  let description = defaultDescription;
  let url = `${baseUrl}/catalogo`;

  if (category) {
    title = `${category} - Catálogo de Dulces`;
    description = `Explora nuestra selección de ${category.toLowerCase()} típicos mexicanos. Menudeo y mayoreo con envío a todo México.`;
    url = `${baseUrl}/categoria/${category}`;
  }

  if (page && page > 1) {
    title = `${title} - Página ${page}`;
  }

  return {
    title,
    description,
    openGraph: {
      type: 'website',
      siteName,
      title,
      description,
      url,
      locale: 'es_MX',
    },
  };
}
