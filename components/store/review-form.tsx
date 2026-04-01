'use client';

import { useState } from 'react';
import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import StarRating from './star-rating';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Card } from '@/components/ui/card';
import { AlertCircle, CheckCircle2 } from 'lucide-react';
import { Alert, AlertDescription } from '@/components/ui/alert';

interface ReviewFormProps {
  productId: string;
  productName: string;
  onReviewSubmitted?: () => void;
}

export default function ReviewForm({
  productId,
  productName,
  onReviewSubmitted,
}: ReviewFormProps) {
  const { data: session, status } = useSession();
  const router = useRouter();
  const [rating, setRating] = useState(0);
  const [comment, setComment] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setSuccess(false);

    if (rating === 0) {
      setError('Por favor selecciona una calificación');
      return;
    }

    setIsSubmitting(true);

    try {
      const response = await fetch('/api/reviews', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          productId,
          rating,
          comment: comment.trim() || undefined,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Error al enviar reseña');
      }

      setSuccess(true);
      setRating(0);
      setComment('');

      if (onReviewSubmitted) {
        setTimeout(() => {
          onReviewSubmitted();
        }, 2000);
      }
    } catch (err: any) {
      setError(err.message || 'Error al enviar reseña');
    } finally {
      setIsSubmitting(false);
    }
  };

  // Si no está autenticado, mostrar mensaje
  if (status === 'loading') {
    return (
      <Card className="p-6">
        <div className="animate-pulse space-y-4">
          <div className="h-4 bg-gray-200 rounded w-1/2"></div>
          <div className="h-20 bg-gray-200 rounded"></div>
        </div>
      </Card>
    );
  }

  if (!session) {
    return (
      <Card className="p-6">
        <Alert>
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>
            Debes{' '}
            <button
              onClick={() => router.push('/auth/signin')}
              className="font-medium underline hover:no-underline"
            >
              iniciar sesión
            </button>{' '}
            para dejar una reseña.
          </AlertDescription>
        </Alert>
      </Card>
    );
  }

  if (success) {
    return (
      <Card className="p-6">
        <Alert className="border-green-200 bg-green-50">
          <CheckCircle2 className="h-4 w-4 text-green-600" />
          <AlertDescription className="text-green-800">
            ¡Gracias por tu reseña! Será visible una vez que sea aprobada por
            nuestro equipo.
          </AlertDescription>
        </Alert>
      </Card>
    );
  }

  return (
    <Card className="p-6">
      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <h3 className="text-lg font-semibold mb-2">Califica este producto</h3>
          <p className="text-sm text-gray-600 mb-4">
            Comparte tu experiencia con {productName}
          </p>
        </div>

        <div>
          <label className="block text-sm font-medium mb-2">
            Tu calificación *
          </label>
          <StarRating
            rating={rating}
            interactive
            onRatingChange={setRating}
            size="lg"
          />
        </div>

        <div>
          <label htmlFor="comment" className="block text-sm font-medium mb-2">
            Tu opinión (opcional)
          </label>
          <Textarea
            id="comment"
            placeholder="Cuéntanos qué te pareció el producto..."
            value={comment}
            onChange={(e) => setComment(e.target.value)}
            rows={4}
            maxLength={1000}
            className="resize-none"
          />
          <p className="text-xs text-gray-500 mt-1">
            {comment.length}/1000 caracteres
          </p>
        </div>

        {error && (
          <Alert variant="destructive">
            <AlertCircle className="h-4 w-4" />
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        )}

        <Button type="submit" disabled={isSubmitting || rating === 0}>
          {isSubmitting ? 'Enviando...' : 'Enviar reseña'}
        </Button>
      </form>
    </Card>
  );
}
