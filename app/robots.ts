import { MetadataRoute } from 'next';

export default function robots(): MetadataRoute.Robots {
  const baseUrl = process.env.NEXTAUTH_URL || 'https://dulceria-online.com';

  return {
    rules: [
      {
        userAgent: '*',
        allow: [
          '/',
          '/catalogo',
          '/catalogo/',
          '/categoria',
          '/mayoreo',
          '/nosotros',
          '/contacto',
        ],
        disallow: [
          '/admin',
          '/admin/*',
          '/api',
          '/api/*',
          '/mi-cuenta',
          '/mi-cuenta/*',
          '/carrito',
          '/checkout',
          '/favoritos',
          '/_next',
        ],
      },
      {
        userAgent: 'Googlebot',
        allow: [
          '/',
          '/catalogo',
          '/categoria',
          '/mayoreo',
        ],
        disallow: [
          '/admin',
          '/api',
          '/mi-cuenta',
        ],
      },
    ],
    sitemap: `${baseUrl}/sitemap.xml`,
  };
}
