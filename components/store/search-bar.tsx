'use client';

import { useState, useEffect, useRef } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import Image from 'next/image';
import { Search, X, Loader2 } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { formatPrice } from '@/lib/utils';
import { cn } from '@/lib/utils';
import { search as trackSearch } from '@/lib/analytics';

interface Suggestion {
  id: string;
  name: string;
  slug: string;
  images: string[];
  priceRetail: number;
}

export function SearchBar() {
  const router = useRouter();
  const [query, setQuery] = useState('');
  const [suggestions, setSuggestions] = useState<Suggestion[]>([]);
  const [loading, setLoading] = useState(false);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const searchRef = useRef<HTMLDivElement>(null);

  // Cerrar sugerencias al hacer click fuera
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (searchRef.current && !searchRef.current.contains(event.target as Node)) {
        setShowSuggestions(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Debounce para las sugerencias
  useEffect(() => {
    if (query.length < 2) {
      setSuggestions([]);
      return;
    }

    setLoading(true);
    const timer = setTimeout(async () => {
      try {
        const response = await fetch(`/api/search/suggestions?q=${encodeURIComponent(query)}`);
        const data = await response.json();
        setSuggestions(data.suggestions || []);
        setShowSuggestions(true);
      } catch (error) {
        console.error('Error al obtener sugerencias:', error);
      } finally {
        setLoading(false);
      }
    }, 300);

    return () => clearTimeout(timer);
  }, [query]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (query.trim()) {
      // Track search event
      trackSearch(query.trim());
      
      router.push(`/buscar?q=${encodeURIComponent(query.trim())}`);
      setShowSuggestions(false);
    }
  };

  const handleClear = () => {
    setQuery('');
    setSuggestions([]);
    setShowSuggestions(false);
  };

  return (
    <div ref={searchRef} className="relative w-full max-w-md">
      <form onSubmit={handleSubmit} className="relative">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
        <Input
          type="text"
          placeholder="Buscar productos..."
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          onFocus={() => query.length >= 2 && setShowSuggestions(true)}
          className="pl-10 pr-20"
        />
        <div className="absolute right-2 top-1/2 -translate-y-1/2 flex items-center gap-1">
          {loading && <Loader2 className="h-4 w-4 animate-spin text-muted-foreground" />}
          {query && (
            <Button
              type="button"
              variant="ghost"
              size="icon"
              className="h-6 w-6"
              onClick={handleClear}
            >
              <X className="h-4 w-4" />
            </Button>
          )}
        </div>
      </form>

      {/* Sugerencias */}
      {showSuggestions && suggestions.length > 0 && (
        <div className="absolute top-full left-0 right-0 mt-2 bg-background border rounded-lg shadow-lg z-50 max-h-96 overflow-y-auto">
          <div className="p-2">
            {suggestions.map((product) => (
              <Link
                key={product.id}
                href={`/catalogo/${product.slug}`}
                onClick={() => {
                  setShowSuggestions(false);
                  setQuery('');
                }}
                className="flex items-center gap-3 p-2 hover:bg-muted rounded-lg transition-colors"
              >
                <div className="relative h-12 w-12 flex-shrink-0 rounded overflow-hidden border">
                  <Image
                    src={product.images[0] || '/placeholder.png'}
                    alt={product.name}
                    fill
                    className="object-cover"
                    sizes="48px"
                  />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="font-medium text-sm line-clamp-1">{product.name}</p>
                  <p className="text-xs text-primary font-semibold">
                    {formatPrice(product.priceRetail)}
                  </p>
                </div>
              </Link>
            ))}
          </div>
          <div className="border-t p-2">
            <Link
              href={`/buscar?q=${encodeURIComponent(query)}`}
              onClick={() => setShowSuggestions(false)}
              className="block text-center text-sm text-primary hover:underline"
            >
              Ver todos los resultados
            </Link>
          </div>
        </div>
      )}

      {/* Sin resultados */}
      {showSuggestions && query.length >= 2 && !loading && suggestions.length === 0 && (
        <div className="absolute top-full left-0 right-0 mt-2 bg-background border rounded-lg shadow-lg z-50 p-4 text-center">
          <p className="text-sm text-muted-foreground">
            No se encontraron productos para "{query}"
          </p>
        </div>
      )}
    </div>
  );
}
