'use client';

import { useState, useEffect } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { ChevronLeft, ChevronRight } from 'lucide-react';

interface Promotion {
  id: string;
  title: string;
  description: string | null;
  discount: number;
  type: 'PERCENTAGE' | 'FIXED' | 'TWO_FOR_ONE' | 'BUNDLE';
  startDate: Date;
  endDate: Date;
  active: boolean;
  bannerImage: string | null;
}

interface PromoBannerProps {
  promotions: Promotion[];
  autoSlideInterval?: number;
}

export function PromoBanner({ promotions, autoSlideInterval = 4000 }: PromoBannerProps) {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isAutoPlaying, setIsAutoPlaying] = useState(true);

  // Auto-slide cada 4 segundos
  useEffect(() => {
    if (!isAutoPlaying || promotions.length <= 1) return;

    const interval = setInterval(() => {
      setCurrentIndex((prev) => (prev + 1) % promotions.length);
    }, autoSlideInterval);

    return () => clearInterval(interval);
  }, [isAutoPlaying, promotions.length, autoSlideInterval]);

  const goToSlide = (index: number) => {
    setCurrentIndex(index);
    setIsAutoPlaying(false);
    // Reanudar auto-play después de 10 segundos de inactividad
    setTimeout(() => setIsAutoPlaying(true), 10000);
  };

  const goToPrevious = () => {
    setCurrentIndex((prev) => (prev - 1 + promotions.length) % promotions.length);
    setIsAutoPlaying(false);
    setTimeout(() => setIsAutoPlaying(true), 10000);
  };

  const goToNext = () => {
    setCurrentIndex((prev) => (prev + 1) % promotions.length);
    setIsAutoPlaying(false);
    setTimeout(() => setIsAutoPlaying(true), 10000);
  };

  if (!promotions || promotions.length === 0) {
    return null;
  }

  const currentPromo = promotions[currentIndex];

  return (
    <div className="relative w-full overflow-hidden rounded-lg bg-gradient-to-r from-primary/10 to-secondary/10">
      {/* Slider container */}
      <div className="relative aspect-[16/6] md:aspect-[21/6]">
        {promotions.map((promo, index) => (
          <div
            key={promo.id}
            className={`absolute inset-0 transition-all duration-500 ease-in-out ${
              index === currentIndex
                ? 'opacity-100 translate-x-0'
                : index < currentIndex
                ? 'opacity-0 -translate-x-full'
                : 'opacity-0 translate-x-full'
            }`}
          >
            {promo.bannerImage ? (
              <Image
                src={promo.bannerImage}
                alt={promo.title}
                fill
                className="object-cover"
                priority={index === 0}
              />
            ) : (
              <div className="absolute inset-0 bg-gradient-to-r from-primary to-primary/70" />
            )}

            {/* Overlay con contenido */}
            <div className="absolute inset-0 bg-gradient-to-r from-black/60 to-transparent flex items-center">
              <div className="container mx-auto px-4 md:px-8">
                <div className="max-w-xl space-y-4 text-white">
                  <h2 className="text-3xl md:text-5xl font-bold leading-tight">
                    {promo.title}
                  </h2>
                  {promo.description && (
                    <p className="text-lg md:text-xl text-white/90">
                      {promo.description}
                    </p>
                  )}
                  <div className="flex items-center gap-4">
                    <div className="text-4xl md:text-6xl font-black">
                      {promo.type === 'PERCENTAGE' && `${promo.discount}% OFF`}
                      {promo.type === 'FIXED' && `$${promo.discount} OFF`}
                      {promo.type === 'TWO_FOR_ONE' && '2x1'}
                      {promo.type === 'BUNDLE' && 'PACK'}
                    </div>
                  </div>
                  <Link href="/promociones">
                    <Button size="lg" variant="secondary" className="mt-4">
                      Ver Promoción
                    </Button>
                  </Link>
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Controles de navegación */}
      {promotions.length > 1 && (
        <>
          {/* Botones prev/next */}
          <button
            onClick={goToPrevious}
            className="absolute left-2 md:left-4 top-1/2 -translate-y-1/2 z-10 rounded-full bg-white/80 hover:bg-white p-2 transition-all shadow-lg"
            aria-label="Anterior"
          >
            <ChevronLeft className="h-5 w-5 md:h-6 md:w-6" />
          </button>
          <button
            onClick={goToNext}
            className="absolute right-2 md:right-4 top-1/2 -translate-y-1/2 z-10 rounded-full bg-white/80 hover:bg-white p-2 transition-all shadow-lg"
            aria-label="Siguiente"
          >
            <ChevronRight className="h-5 w-5 md:h-6 md:w-6" />
          </button>

          {/* Indicadores (dots) */}
          <div className="absolute bottom-4 left-1/2 -translate-x-1/2 z-10 flex gap-2">
            {promotions.map((_, index) => (
              <button
                key={index}
                onClick={() => goToSlide(index)}
                className={`h-2 rounded-full transition-all ${
                  index === currentIndex
                    ? 'bg-white w-8'
                    : 'bg-white/50 w-2 hover:bg-white/75'
                }`}
                aria-label={`Ir a slide ${index + 1}`}
              />
            ))}
          </div>
        </>
      )}

      {/* Pause/Play indicator (opcional, solo visual) */}
      {promotions.length > 1 && (
        <div className="absolute top-4 right-4 z-10">
          <button
            onClick={() => setIsAutoPlaying(!isAutoPlaying)}
            className="text-white/70 hover:text-white text-xs transition-colors"
            aria-label={isAutoPlaying ? 'Pausar' : 'Reproducir'}
          >
            {isAutoPlaying ? '⏸' : '▶'}
          </button>
        </div>
      )}
    </div>
  );
}
