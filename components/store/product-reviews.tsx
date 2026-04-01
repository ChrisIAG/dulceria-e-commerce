'use client';

import { useEffect, useState } from 'react';
import Image from 'next/image';
import StarRating from './star-rating';
import { Card } from '@/components/ui/card';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Skeleton } from '@/components/ui/skeleton';
import { AlertCircle, Clock } from 'lucide-react';
import { Alert, AlertDescription } from '@/components/ui/alert';

interface Review {
  id: string;
  rating: number;
  comment: string | null;
  createdAt: string;
  user: {
    id: string;
    name: string | null;
    image: string | null;
  };
}

interface ProductReviewsProps {
  productId: string;
}

export default function ProductReviews({ productId }: ProductReviewsProps) {
  const [reviews, setReviews] = useState<Review[]>([]);
  const [stats, setStats] = useState({ total: 0, avgRating: 0 });
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchReviews = async () => {
    setIsLoading(true);
    setError(null);

    try {
      const response = await fetch(`/api/reviews?productId=${productId}`);

      if (!response.ok) {
        throw new Error('Error al cargar reseñas');
      }

      const data = await response.json();
      setReviews(data.reviews);
      setStats(data.stats);
    } catch (err: any) {
      setError(err.message || 'Error al cargar reseñas');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchReviews();
  }, [productId]);

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return new Intl.DateTimeFormat('es-MX', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    }).format(date);
  };

  const getInitials = (name: string | null) => {
    if (!name) return 'U';
    return name
      .split(' ')
      .map((n) => n[0])
      .join('')
      .toUpperCase()
      .slice(0, 2);
  };

  if (isLoading) {
    return (
      <div className="space-y-4">
        <Skeleton className="h-8 w-48" />
        <Skeleton className="h-24 w-full" />
        <Skeleton className="h-24 w-full" />
      </div>
    );
  }

  if (error) {
    return (
      <Alert variant="destructive">
        <AlertCircle className="h-4 w-4" />
        <AlertDescription>{error}</AlertDescription>
      </Alert>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header con estadísticas */}
      <div className="flex items-baseline gap-4">
        <h2 className="text-2xl font-bold">Reseñas de clientes</h2>
        {stats.total > 0 && (
          <div className="flex items-center gap-2">
            <StarRating rating={stats.avgRating} size="sm" />
            <span className="text-sm text-gray-600">
              {stats.avgRating.toFixed(1)} de 5
            </span>
            <span className="text-sm text-gray-500">
              ({stats.total} {stats.total === 1 ? 'reseña' : 'reseñas'})
            </span>
          </div>
        )}
      </div>

      {/* Lista de reseñas */}
      {reviews.length === 0 ? (
        <Card className="p-8 text-center">
          <div className="flex flex-col items-center gap-3 text-gray-500">
            <Clock className="h-12 w-12" />
            <p className="text-lg font-medium">Aún no hay reseñas</p>
            <p className="text-sm">Sé el primero en calificar este producto</p>
          </div>
        </Card>
      ) : (
        <div className="space-y-4">
          {reviews.map((review) => (
            <Card key={review.id} className="p-6">
              <div className="flex gap-4">
                {/* Avatar */}
                <Avatar className="h-10 w-10">
                  {review.user.image ? (
                    <AvatarImage
                      src={review.user.image}
                      alt={review.user.name ?? 'Usuario'}
                    />
                  ) : null}
                  <AvatarFallback className="bg-purple-100 text-purple-700">
                    {getInitials(review.user.name)}
                  </AvatarFallback>
                </Avatar>

                {/* Contenido */}
                <div className="flex-1 space-y-2">
                  <div className="flex items-start justify-between">
                    <div>
                      <p className="font-medium">
                        {review.user.name ?? 'Usuario'}
                      </p>
                      <p className="text-xs text-gray-500">
                        {formatDate(review.createdAt)}
                      </p>
                    </div>
                    <StarRating rating={review.rating} size="sm" />
                  </div>

                  {review.comment && (
                    <p className="text-gray-700 leading-relaxed">
                      {review.comment}
                    </p>
                  )}
                </div>
              </div>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
