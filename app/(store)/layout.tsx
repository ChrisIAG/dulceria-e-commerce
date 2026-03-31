import { Navbar } from '@/components/store/navbar';
import { Footer } from '@/components/store/footer';

// Forzar renderizado dinámico porque el Navbar usa CartDrawer con useSession
export const dynamic = 'force-dynamic';

export default function StoreLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex min-h-screen flex-col">
      <Navbar />
      <main className="flex-1">{children}</main>
      <Footer />
    </div>
  );
}
