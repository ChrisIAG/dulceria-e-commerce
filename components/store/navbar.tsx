'use client';

import { useState } from 'react';
import Link from 'next/link';
import { ShoppingCart, User, Menu, X, Heart } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger } from '@/components/ui/sheet';
import { useCartStore } from '@/store/cart';
import { CartDrawer } from './cart-drawer';
import { SearchBar } from './search-bar';
import { useHydration } from '@/hooks/use-hydration';
import { ThemeToggle } from '@/components/theme-toggle';

export function Navbar() {
  const hydrated = useHydration();
  const itemCount = useCartStore((state) => state.getItemCount());
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const menuItems = [
    { href: '/catalogo', label: 'Catálogo' },
    { href: '/mayoreo', label: 'Mayoreo' },
    { href: '/promociones', label: 'Promociones' },
    { href: '/nosotros', label: 'Nosotros' },
  ];

  return (
    <header className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="container mx-auto px-4">
        <div className="flex h-16 items-center justify-between gap-4">
          {/* Logo */}
          <Link href="/" className="flex items-center space-x-2 flex-shrink-0">
            <span className="text-2xl font-bold text-primary">🍬 DulceríaOnline</span>
          </Link>

          {/* Desktop Navigation */}
          <nav className="hidden lg:flex items-center space-x-6 text-sm font-medium">
            {menuItems.map((item) => (
              <Link
                key={item.href}
                href={item.href}
                className="transition-colors hover:text-primary whitespace-nowrap"
              >
                {item.label}
              </Link>
            ))}
          </nav>

          {/* Search Bar - Desktop */}
          <div className="hidden md:block flex-1 max-w-md mx-4">
            <SearchBar />
          </div>

          {/* Right Actions */}
          <div className="flex items-center space-x-2 flex-shrink-0">
          {/* Theme Toggle */}
          <ThemeToggle />

          <Link href="/mi-cuenta">
            <Button variant="ghost" size="icon" aria-label="Mi cuenta">
              <User className="h-5 w-5" />
            </Button>
          </Link>

          {/* Wishlist */}
          <Link href="/favoritos">
            <Button variant="ghost" size="icon" aria-label="Mis favoritos">
              <Heart className="h-5 w-5" />
            </Button>
          </Link>

          {/* Cart Drawer */}
          <CartDrawer>
            <Button variant="ghost" size="icon" className="relative">
              <ShoppingCart className="h-5 w-5" />
              {hydrated && itemCount > 0 && (
                <span className="absolute -top-1 -right-1 h-5 w-5 rounded-full bg-primary text-xs text-white flex items-center justify-center">
                  {itemCount}
                </span>
              )}
            </Button>
          </CartDrawer>
          </div>

          {/* Mobile Menu Button */}
          <Sheet open={mobileMenuOpen} onOpenChange={setMobileMenuOpen}>
            <SheetTrigger asChild>
              <Button variant="ghost" size="icon" className="md:hidden">
                <Menu className="h-5 w-5" />
              </Button>
            </SheetTrigger>
            <SheetContent side="left" className="w-[280px]">
              <SheetHeader>
                <SheetTitle>Menú</SheetTitle>
              </SheetHeader>
              <nav className="flex flex-col space-y-4 mt-6">
                {menuItems.map((item) => (
                  <Link
                    key={item.href}
                    href={item.href}
                    onClick={() => setMobileMenuOpen(false)}
                    className="text-lg font-medium transition-colors hover:text-primary py-2"
                  >
                    {item.label}
                  </Link>
                ))}
                <div className="pt-4 border-t">
                  <Link
                    href="/mi-cuenta"
                    onClick={() => setMobileMenuOpen(false)}
                    className="flex items-center gap-2 text-lg font-medium transition-colors hover:text-primary py-2"
                  >
                    <User className="h-5 w-5" />
                    Mi Cuenta
                  </Link>
                  <Link
                    href="/favoritos"
                    onClick={() => setMobileMenuOpen(false)}
                    className="flex items-center gap-2 text-lg font-medium transition-colors hover:text-primary py-2"
                  >
                    <Heart className="h-5 w-5" />
                    Favoritos
                  </Link>
                  <div className="flex items-center gap-2 py-2">
                    <span className="text-sm text-gray-600 dark:text-gray-400">Tema:</span>
                    <ThemeToggle />
                  </div>
                </div>
              </nav>
            </SheetContent>
          </Sheet>
        </div>
      </div>
    </header>
  );
}
