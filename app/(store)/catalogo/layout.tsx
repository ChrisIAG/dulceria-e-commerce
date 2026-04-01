import { Metadata } from 'next';
import { generateCatalogMetadata } from '@/lib/seo';

export const metadata: Metadata = generateCatalogMetadata();

export default function CatalogoLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <>{children}</>;
}
