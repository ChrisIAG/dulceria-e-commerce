import Link from 'next/link';
import { LayoutDashboard, Package, FolderTree, Tag, ShoppingCart, BarChart3, Ticket } from 'lucide-react';
import './admin.css';

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="admin-panel flex min-h-screen bg-gray-50">{/* Forzar modo claro */}
      {/* Sidebar */}
      <aside className="w-64 bg-white border-r border-gray-200">
        <div className="flex h-16 items-center border-b border-gray-200 px-6">
          <Link href="/admin" className="text-xl font-bold text-gray-900">
            Admin Panel
          </Link>
        </div>
        <nav className="space-y-1 p-4">
          <Link
            href="/admin"
            className="flex items-center space-x-3 rounded-lg px-3 py-2 text-gray-700 hover:bg-blue-50 hover:text-blue-700 transition-colors"
          >
            <LayoutDashboard className="h-5 w-5" />
            <span className="font-medium">Dashboard</span>
          </Link>
          <Link
            href="/admin/productos"
            className="flex items-center space-x-3 rounded-lg px-3 py-2 text-gray-700 hover:bg-blue-50 hover:text-blue-700 transition-colors"
          >
            <Package className="h-5 w-5" />
            <span className="font-medium">Productos</span>
          </Link>
          <Link
            href="/admin/categorias"
            className="flex items-center space-x-3 rounded-lg px-3 py-2 text-gray-700 hover:bg-blue-50 hover:text-blue-700 transition-colors"
          >
            <FolderTree className="h-5 w-5" />
            <span className="font-medium">Categorías</span>
          </Link>
          <Link
            href="/admin/promociones"
            className="flex items-center space-x-3 rounded-lg px-3 py-2 text-gray-700 hover:bg-blue-50 hover:text-blue-700 transition-colors"
          >
            <Tag className="h-5 w-5" />
            <span className="font-medium">Promociones</span>
          </Link>
          <Link
            href="/admin/cupones"
            className="flex items-center space-x-3 rounded-lg px-3 py-2 text-gray-700 hover:bg-blue-50 hover:text-blue-700 transition-colors"
          >
            <Ticket className="h-5 w-5" />
            <span className="font-medium">Cupones</span>
          </Link>
          <Link
            href="/admin/pedidos"
            className="flex items-center space-x-3 rounded-lg px-3 py-2 text-gray-700 hover:bg-blue-50 hover:text-blue-700 transition-colors"
          >
            <ShoppingCart className="h-5 w-5" />
            <span className="font-medium">Pedidos</span>
          </Link>
          <Link
            href="/admin/reportes"
            className="flex items-center space-x-3 rounded-lg px-3 py-2 text-gray-700 hover:bg-blue-50 hover:text-blue-700 transition-colors"
          >
            <BarChart3 className="h-5 w-5" />
            <span className="font-medium">Reportes</span>
          </Link>
        </nav>
      </aside>

      {/* Main */}
      <div className="flex-1">
        <header className="flex h-16 items-center justify-between border-b border-gray-200 bg-white px-6 shadow-sm">
          <h1 className="text-2xl font-semibold text-gray-900">DulceríaOnline Admin</h1>
          <Link href="/" className="text-sm text-blue-600 hover:text-blue-700 font-medium">
            Ver Tienda →
          </Link>
        </header>
        <main className="p-6">{children}</main>
      </div>
    </div>
  );
}
