'use client';

import { useEffect, useState } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import StarRating from '@/components/store/star-rating';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog';
import { Skeleton } from '@/components/ui/skeleton';
import { Check, X, Trash2, ExternalLink, AlertCircle } from 'lucide-react';
import { Alert, AlertDescription } from '@/components/ui/alert';

interface Review {
  id: string;
  rating: number;
  comment: string | null;
  approved: boolean;
  createdAt: string;
  user: {
    id: string;
    name: string | null;
    email: string;
    image: string | null;
  };
  product: {
    id: string;
    name: string;
    slug: string;
    images: string[];
  };
}

export default function ReviewsPage() {
  const [reviews, setReviews] = useState<Review[]>([]);
  const [stats, setStats] = useState({ total: 0, pending: 0 });
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [statusFilter, setStatusFilter] = useState('all');
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [reviewToDelete, setReviewToDelete] = useState<string | null>(null);

  const fetchReviews = async () => {
    setIsLoading(true);
    setError(null);

    try {
      const response = await fetch(`/api/admin/reviews?status=${statusFilter}`);

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
  }, [statusFilter]);

  const handleApprove = async (reviewId: string, currentStatus: boolean) => {
    try {
      const response = await fetch(`/api/reviews/${reviewId}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ approved: !currentStatus }),
      });

      if (!response.ok) {
        throw new Error('Error al actualizar reseña');
      }

      fetchReviews();
    } catch (err: any) {
      alert(err.message || 'Error al actualizar reseña');
    }
  };

  const handleDelete = async () => {
    if (!reviewToDelete) return;

    try {
      const response = await fetch(`/api/reviews/${reviewToDelete}`, {
        method: 'DELETE',
      });

      if (!response.ok) {
        throw new Error('Error al eliminar reseña');
      }

      setDeleteDialogOpen(false);
      setReviewToDelete(null);
      fetchReviews();
    } catch (err: any) {
      alert(err.message || 'Error al eliminar reseña');
    }
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return new Intl.DateTimeFormat('es-MX', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    }).format(date);
  };

  if (isLoading) {
    return (
      <div className="container mx-auto px-4 py-8">
        <Skeleton className="h-10 w-64 mb-6" />
        <div className="space-y-4">
          <Skeleton className="h-48 w-full" />
          <Skeleton className="h-48 w-full" />
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-3xl font-bold">Gestión de Reseñas</h1>
          <p className="text-gray-600 mt-1">
            Modera y gestiona las reseñas de los clientes
          </p>
        </div>

        {stats.pending > 0 && (
          <Badge variant="destructive" className="text-lg px-4 py-2">
            {stats.pending} pendiente{stats.pending > 1 ? 's' : ''}
          </Badge>
        )}
      </div>

      {/* Filtros */}
      <div className="mb-6">
        <Select value={statusFilter} onValueChange={setStatusFilter}>
          <SelectTrigger className="w-[200px]">
            <SelectValue placeholder="Filtrar por estado" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Todas</SelectItem>
            <SelectItem value="pending">Pendientes</SelectItem>
            <SelectItem value="approved">Aprobadas</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {/* Error */}
      {error && (
        <Alert variant="destructive" className="mb-6">
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}

      {/* Lista de reseñas */}
      {reviews.length === 0 ? (
        <Card className="p-12 text-center">
          <p className="text-gray-500">
            No hay reseñas{' '}
            {statusFilter === 'pending'
              ? 'pendientes'
              : statusFilter === 'approved'
              ? 'aprobadas'
              : ''}
          </p>
        </Card>
      ) : (
        <div className="space-y-4">
          {reviews.map((review) => (
            <Card key={review.id} className="p-6">
              <div className="flex gap-4">
                {/* Imagen del producto */}
                <Link
                  href={`/catalogo/${review.product.slug}`}
                  target="_blank"
                  className="flex-shrink-0"
                >
                  <div className="relative w-20 h-20 rounded-lg overflow-hidden border hover:opacity-75 transition-opacity">
                    <Image
                      src={review.product.images[0] || '/placeholder.png'}
                      alt={review.product.name}
                      fill
                      className="object-cover"
                    />
                  </div>
                </Link>

                {/* Contenido */}
                <div className="flex-1 space-y-3">
                  {/* Encabezado */}
                  <div className="flex items-start justify-between">
                    <div>
                      <Link
                        href={`/catalogo/${review.product.slug}`}
                        target="_blank"
                        className="font-medium hover:text-purple-600 inline-flex items-center gap-1"
                      >
                        {review.product.name}
                        <ExternalLink className="h-3 w-3" />
                      </Link>
                      <p className="text-sm text-gray-600 mt-1">
                        Por <span className="font-medium">{review.user.name}</span> (
                        {review.user.email})
                      </p>
                      <p className="text-xs text-gray-500">
                        {formatDate(review.createdAt)}
                      </p>
                    </div>

                    <div className="flex items-center gap-2">
                      <StarRating rating={review.rating} size="sm" />
                      <Badge variant={review.approved ? 'default' : 'secondary'}>
                        {review.approved ? 'Aprobada' : 'Pendiente'}
                      </Badge>
                    </div>
                  </div>

                  {/* Comentario */}
                  {review.comment && (
                    <p className="text-gray-700 bg-gray-50 p-3 rounded-lg">
                      {review.comment}
                    </p>
                  )}

                  {/* Acciones */}
                  <div className="flex gap-2 pt-2">
                    <Button
                      size="sm"
                      variant={review.approved ? 'outline' : 'default'}
                      onClick={() => handleApprove(review.id, review.approved)}
                    >
                      {review.approved ? (
                        <>
                          <X className="h-4 w-4 mr-1" />
                          Desaprobar
                        </>
                      ) : (
                        <>
                          <Check className="h-4 w-4 mr-1" />
                          Aprobar
                        </>
                      )}
                    </Button>

                    <Button
                      size="sm"
                      variant="destructive"
                      onClick={() => {
                        setReviewToDelete(review.id);
                        setDeleteDialogOpen(true);
                      }}
                    >
                      <Trash2 className="h-4 w-4 mr-1" />
                      Eliminar
                    </Button>
                  </div>
                </div>
              </div>
            </Card>
          ))}
        </div>
      )}

      {/* Diálogo de confirmación de eliminación */}
      <AlertDialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>¿Eliminar reseña?</AlertDialogTitle>
            <AlertDialogDescription>
              Esta acción no se puede deshacer. La reseña será eliminada
              permanentemente.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancelar</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDelete}
              className="bg-red-600 hover:bg-red-700"
            >
              Eliminar
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
