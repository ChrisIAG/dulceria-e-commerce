import Link from 'next/link';
import { LayoutDashboard, Package, FolderTree, Tag, ShoppingCart, BarChart3 } from 'lucide-react';

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex min-h-screen">
      {/* Sidebar */}
      <aside className="w-64 border-r bg-muted/40">
        <div className="flex h-16 items-center border-b px-6">
          <Link href="/admin" className="text-xl font-bold">
            Admin Panel
          </Link>
        </div>
        <nav className="space-y-1 p-4">
          <Link
            href="/admin"
            className="flex items-center space-x-3 rounded-lg px-3 py-2 hover:bg-accent"
          >
            <LayoutDashboard className="h-5 w-5" />
            <span>Dashboard</span>
          </Link>
          <Link
            href="/admin/productos"
            className="flex items-center space-x-3 rounded-lg px-3 py-2 hover:bg-accent"
          >
            <Package className="h-5 w-5" />
            <span>Productos</span>
          </Link>
          <Link
            href="/admin/categorias"
            className="flex items-center space-x-3 rounded-lg px-3 py-2 hover:bg-accent"
          >
            <FolderTree className="h-5 w-5" />
            <span>Categorías</span>
          </Link>
          <Link
            href="/admin/promociones"
            className="flex items-center space-x-3 rounded-lg px-3 py-2 hover:bg-accent"
          >
            <Tag className="h-5 w-5" />
            <span>Promociones</span>
          </Link>
          <Link
            href="/admin/pedidos"
            className="flex items-center space-x-3 rounded-lg px-3 py-2 hover:bg-accent"
          >
            <ShoppingCart className="h-5 w-5" />
            <span>Pedidos</span>
          </Link>
          <Link
            href="/admin/reportes"
            className="flex items-center space-x-3 rounded-lg px-3 py-2 hover:bg-accent"
          >
            <BarChart3 className="h-5 w-5" />
            <span>Reportes</span>
          </Link>
        </nav>
      </aside>

      {/* Main */}
      <div className="flex-1">
        <header className="flex h-16 items-center justify-between border-b px-6">
          <h1 className="text-2xl font-semibold">DulceríaOnline Admin</h1>
          <Link href="/" className="text-sm text-muted-foreground hover:text-primary">
            Ver Tienda →
          </Link>
        </header>
        <main className="p-6">{children}</main>
      </div>
    </div>
  );
}
