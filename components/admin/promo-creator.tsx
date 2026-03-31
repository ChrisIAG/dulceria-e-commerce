'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Switch } from '@/components/ui/switch';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { Checkbox } from '@/components/ui/checkbox';
import { Loader2, Upload, X, Calendar, Eye } from 'lucide-react';
import Image from 'next/image';
import { z } from 'zod';
import { formatPrice } from '@/lib/utils';

interface Product {
  id: string;
  name: string;
  price: number;
  wholesalePrice: number | null;
  images: string[];
}

interface PromoCreatorProps {
  products: Product[];
  promotion?: {
    id: string;
    title: string;
    description: string | null;
    discount: number;
    type: 'PERCENTAGE' | 'FIXED' | 'TWO_FOR_ONE' | 'BUNDLE';
    startDate: Date;
    endDate: Date;
    active: boolean;
    bannerImage: string | null;
    productIds: string[];
  };
  onSuccess?: () => void;
}

const promoSchema = z.object({
  title: z.string().min(3, 'Título debe tener al menos 3 caracteres'),
  description: z.string().optional(),
  type: z.enum(['PERCENTAGE', 'FIXED', 'TWO_FOR_ONE', 'BUNDLE']),
  discount: z.number().positive('Descuento debe ser mayor a 0'),
  startDate: z.string().min(1, 'Fecha de inicio requerida'),
  endDate: z.string().min(1, 'Fecha de fin requerida'),
  bannerImage: z.string().optional(),
  productIds: z.array(z.string()).min(1, 'Selecciona al menos un producto'),
  active: z.boolean(),
});

export function PromoCreator({ products, promotion, onSuccess }: PromoCreatorProps) {
  const router = useRouter();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [uploadingBanner, setUploadingBanner] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [showPreview, setShowPreview] = useState(false);

  const [formData, setFormData] = useState({
    title: promotion?.title || '',
    description: promotion?.description || '',
    type: promotion?.type || 'PERCENTAGE',
    discount: promotion?.discount ?? '',
    startDate: promotion?.startDate
      ? new Date(promotion.startDate).toISOString().split('T')[0]
      : '',
    endDate: promotion?.endDate
      ? new Date(promotion.endDate).toISOString().split('T')[0]
      : '',
    bannerImage: promotion?.bannerImage || '',
    productIds: promotion?.productIds || [],
    active: promotion?.active ?? true,
  });

  const handleBannerUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setUploadingBanner(true);

    try {
      // Obtener firma del servidor
      const signResponse = await fetch('/api/upload', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ folder: 'promotions' }),
      });

      if (!signResponse.ok) {
        throw new Error('Error al obtener firma');
      }

      const { signature, timestamp, cloudName, apiKey } = await signResponse.json();

      // Subir a Cloudinary
      const uploadFormData = new FormData();
      uploadFormData.append('file', file);
      uploadFormData.append('signature', signature);
      uploadFormData.append('timestamp', timestamp.toString());
      uploadFormData.append('api_key', apiKey);
      uploadFormData.append('folder', 'promotions');

      const uploadResponse = await fetch(
        `https://api.cloudinary.com/v1_1/${cloudName}/image/upload`,
        { method: 'POST', body: uploadFormData }
      );

      if (!uploadResponse.ok) {
        throw new Error('Error al subir imagen');
      }

      const data = await uploadResponse.json();
      setFormData((prev) => ({ ...prev, bannerImage: data.secure_url }));
    } catch (error) {
      console.error('Error subiendo banner:', error);
      alert('Error al subir el banner');
    } finally {
      setUploadingBanner(false);
    }
  };

  const handleProductToggle = (productId: string) => {
    const newProductIds = formData.productIds.includes(productId)
      ? formData.productIds.filter((id) => id !== productId)
      : [...formData.productIds, productId];

    setFormData({ ...formData, productIds: newProductIds });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrors({});

    try {
      promoSchema.parse({
        ...formData,
        discount: Number(formData.discount),
      });

      setIsSubmitting(true);

      const method = promotion ? 'PUT' : 'POST';
      const url = promotion ? `/api/promotions/${promotion.id}` : '/api/promotions';

      const response = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...formData,
          discount: Number(formData.discount),
        }),
      });

      if (!response.ok) {
        throw new Error('Error al guardar promoción');
      }

      alert(promotion ? 'Promoción actualizada' : 'Promoción creada');
      if (onSuccess) {
        onSuccess();
      } else {
        router.push('/admin/promociones');
      }
    } catch (error) {
      if (error instanceof z.ZodError) {
        const newErrors: Record<string, string> = {};
        error.issues.forEach((err) => {
          if (err.path[0]) {
            newErrors[err.path[0] as string] = err.message;
          }
        });
        setErrors(newErrors);
      } else {
        console.error('Error:', error);
        alert('Error al guardar promoción');
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  // Calcular preview del banner
  const PreviewBanner = () => {
    if (!formData.bannerImage && !formData.title) return null;

    return (
      <div className="relative w-full aspect-[16/6] rounded-lg overflow-hidden">
        {formData.bannerImage ? (
          <Image src={formData.bannerImage} alt="Preview" fill className="object-cover" />
        ) : (
          <div className="absolute inset-0 bg-gradient-to-r from-primary to-primary/70" />
        )}

        <div className="absolute inset-0 bg-gradient-to-r from-black/60 to-transparent flex items-center">
          <div className="px-8 max-w-xl space-y-4 text-white">
            <h2 className="text-4xl font-bold">{formData.title || 'Título de la Promoción'}</h2>
            {formData.description && (
              <p className="text-xl text-white/90">{formData.description}</p>
            )}
            <div className="text-5xl font-black">
              {formData.type === 'PERCENTAGE' && `${formData.discount}% OFF`}
              {formData.type === 'FIXED' && `$${formData.discount} OFF`}
              {formData.type === 'TWO_FOR_ONE' && '2x1'}
              {formData.type === 'BUNDLE' && 'PACK'}
            </div>
          </div>
        </div>
      </div>
    );
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {/* Preview flotante */}
      {showPreview && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Eye className="h-5 w-5" />
              Preview del Banner
            </CardTitle>
          </CardHeader>
          <CardContent>
            <PreviewBanner />
          </CardContent>
        </Card>
      )}

      <div className="grid lg:grid-cols-2 gap-6">
        {/* Información Básica */}
        <Card>
          <CardHeader>
            <CardTitle>Información Básica</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <Label htmlFor="title">Título de la Promoción *</Label>
              <Input
                id="title"
                value={formData.title}
                onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                placeholder="Ej: Descuento de Verano"
                className={errors.title ? 'border-red-500' : ''}
              />
              {errors.title && (
                <p className="text-sm text-red-500 mt-1">{errors.title}</p>
              )}
            </div>

            <div>
              <Label htmlFor="description">Descripción</Label>
              <Textarea
                id="description"
                value={formData.description}
                onChange={(e) =>
                  setFormData({ ...formData, description: e.target.value })
                }
                placeholder="Describe la promoción..."
                rows={3}
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="type">Tipo de Promoción *</Label>
                <Select
                  value={formData.type}
                  onValueChange={(value: any) => setFormData({ ...formData, type: value })}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="PERCENTAGE">Porcentaje (%)</SelectItem>
                    <SelectItem value="FIXED">Monto Fijo ($)</SelectItem>
                    <SelectItem value="TWO_FOR_ONE">2x1</SelectItem>
                    <SelectItem value="BUNDLE">Pack/Bundle</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div>
                <Label htmlFor="discount">
                  {formData.type === 'PERCENTAGE' ? 'Porcentaje de Descuento' : 'Monto de Descuento'}
                </Label>
                <Input
                  id="discount"
                  type="number"
                  step={formData.type === 'PERCENTAGE' ? '1' : '0.01'}
                  value={formData.discount}
                  onChange={(e) => {
                    const value = e.target.value === '' ? '' : parseFloat(e.target.value);
                    setFormData({ ...formData, discount: value });
                  }}
                  placeholder={formData.type === 'PERCENTAGE' ? '15' : '50.00'}
                  className={errors.discount ? 'border-red-500' : ''}
                />
                {errors.discount && (
                  <p className="text-sm text-red-500 mt-1">{errors.discount}</p>
                )}
              </div>
            </div>

            <Separator />

            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="startDate" className="flex items-center gap-2">
                  <Calendar className="h-4 w-4" />
                  Fecha de Inicio *
                </Label>
                <Input
                  id="startDate"
                  type="date"
                  value={formData.startDate}
                  onChange={(e) =>
                    setFormData({ ...formData, startDate: e.target.value })
                  }
                  className={errors.startDate ? 'border-red-500' : ''}
                />
                {errors.startDate && (
                  <p className="text-sm text-red-500 mt-1">{errors.startDate}</p>
                )}
              </div>

              <div>
                <Label htmlFor="endDate" className="flex items-center gap-2">
                  <Calendar className="h-4 w-4" />
                  Fecha de Fin *
                </Label>
                <Input
                  id="endDate"
                  type="date"
                  value={formData.endDate}
                  onChange={(e) => setFormData({ ...formData, endDate: e.target.value })}
                  className={errors.endDate ? 'border-red-500' : ''}
                />
                {errors.endDate && (
                  <p className="text-sm text-red-500 mt-1">{errors.endDate}</p>
                )}
              </div>
            </div>

            <div className="flex items-center justify-between">
              <div>
                <Label>Promoción Activa</Label>
                <p className="text-sm text-muted-foreground">
                  Se mostrará automáticamente en el período
                </p>
              </div>
              <Switch
                checked={formData.active}
                onCheckedChange={(checked) => setFormData({ ...formData, active: checked })}
              />
            </div>
          </CardContent>
        </Card>

        {/* Banner e Imagen */}
        <Card>
          <CardHeader>
            <CardTitle>Banner de Promoción</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {/* Imagen actual */}
            {formData.bannerImage && (
              <div className="relative aspect-[16/6] rounded-lg overflow-hidden group">
                <Image
                  src={formData.bannerImage}
                  alt="Banner"
                  fill
                  className="object-cover"
                />
                <button
                  type="button"
                  onClick={() => setFormData({ ...formData, bannerImage: '' })}
                  className="absolute top-2 right-2 bg-red-500 text-white rounded-full p-2 opacity-0 group-hover:opacity-100 transition-opacity"
                >
                  <X className="h-4 w-4" />
                </button>
              </div>
            )}

            {/* Upload */}
            <Label
              htmlFor="banner-upload"
              className="flex items-center justify-center h-32 border-2 border-dashed rounded-lg cursor-pointer hover:bg-accent transition-colors"
            >
              {uploadingBanner ? (
                <div className="flex flex-col items-center gap-2">
                  <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
                  <span className="text-sm text-muted-foreground">Subiendo...</span>
                </div>
              ) : (
                <div className="flex flex-col items-center gap-2">
                  <Upload className="h-8 w-8 text-muted-foreground" />
                  <span className="text-sm font-medium">Subir Banner</span>
                  <span className="text-xs text-muted-foreground">
                    Recomendado: 1280x480px
                  </span>
                </div>
              )}
            </Label>
            <input
              id="banner-upload"
              type="file"
              accept="image/*"
              onChange={handleBannerUpload}
              disabled={uploadingBanner}
              className="hidden"
            />

            <Button
              type="button"
              variant="outline"
              className="w-full"
              onClick={() => setShowPreview(!showPreview)}
            >
              <Eye className="mr-2 h-4 w-4" />
              {showPreview ? 'Ocultar' : 'Ver'} Preview
            </Button>
          </CardContent>
        </Card>
      </div>

      {/* Selector de Productos */}
      <Card>
        <CardHeader>
          <CardTitle>
            Productos Incluidos ({formData.productIds.length} seleccionados)
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 max-h-96 overflow-y-auto">
            {products.map((product) => {
              const isSelected = formData.productIds.includes(product.id);
              return (
                <label
                  key={product.id}
                  htmlFor={`product-${product.id}`}
                  className={`flex items-center gap-3 p-3 border rounded-lg cursor-pointer transition-colors ${
                    isSelected ? 'border-primary bg-primary/5' : 'hover:bg-accent'
                  }`}
                >
                  <Checkbox 
                    id={`product-${product.id}`}
                    checked={isSelected}
                    onCheckedChange={() => handleProductToggle(product.id)}
                  />
                  <div className="relative h-12 w-12 flex-shrink-0 rounded overflow-hidden">
                    <Image
                      src={product.images[0] || '/placeholder.png'}
                      alt={product.name}
                      fill
                      className="object-cover"
                    />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium truncate">{product.name}</p>
                    <p className="text-xs text-muted-foreground">
                      {formatPrice(product.price)}
                    </p>
                  </div>
                </label>
              );
            })}
          </div>
          {errors.productIds && (
            <p className="text-sm text-red-500 mt-2">{errors.productIds}</p>
          )}
        </CardContent>
      </Card>

      {/* Botones */}
      <div className="flex gap-4">
        <Button
          type="button"
          variant="outline"
          onClick={() => router.back()}
          disabled={isSubmitting}
        >
          Cancelar
        </Button>
        <Button type="submit" disabled={isSubmitting} className="flex-1">
          {isSubmitting ? (
            <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              Guardando...
            </>
          ) : promotion ? (
            'Actualizar Promoción'
          ) : (
            'Crear Promoción'
          )}
        </Button>
      </div>
    </form>
  );
}
