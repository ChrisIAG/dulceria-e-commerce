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
import { Badge } from '@/components/ui/badge';
import { Switch } from '@/components/ui/switch';
import { Loader2, Upload, X, Image as ImageIcon } from 'lucide-react';
import Image from 'next/image';
import { z } from 'zod';

interface Category {
  id: string;
  name: string;
}

interface AdminProductFormProps {
  categories: Category[];
  product?: {
    id: string;
    name: string;
    slug: string;
    description: string | null;
    categoryId: string | null;
    price: number;
    wholesalePrice: number | null;
    minWholesale: number | null;
    stock: number;
    images: string[];
    active: boolean;
    featured: boolean;
  };
  onSuccess?: () => void;
}

const productSchema = z.object({
  name: z.string().min(3, 'Nombre debe tener al menos 3 caracteres'),
  slug: z.string().min(3, 'Slug inválido'),
  description: z.string().optional(),
  categoryId: z.string().min(1, 'Selecciona una categoría'),
  price: z.number().positive('Precio debe ser mayor a 0'),
  wholesalePrice: z.number().positive('Precio mayoreo debe ser mayor a 0').optional(),
  minWholesale: z.number().int().positive().default(12),
  stock: z.number().int().min(0, 'Stock no puede ser negativo'),
  images: z.array(z.string()).min(1, 'Agrega al menos una imagen'),
  active: z.boolean(),
  featured: z.boolean(),
});

export function AdminProductForm({
  categories,
  product,
  onSuccess,
}: AdminProductFormProps) {
  const router = useRouter();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [uploadingImage, setUploadingImage] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});

  const [formData, setFormData] = useState({
    name: product?.name || '',
    slug: product?.slug || '',
    description: product?.description || '',
    categoryId: product?.categoryId || '',
    price: product?.price ?? '',
    wholesalePrice: product?.wholesalePrice ?? '',
    minWholesale: product?.minWholesale ?? 12,
    stock: product?.stock ?? 0,
    images: product?.images || [],
    active: product?.active ?? true,
    featured: product?.featured ?? false,
  });

  // Auto-generar slug desde el nombre
  useEffect(() => {
    if (!product && formData.name) {
      const slug = formData.name
        .toLowerCase()
        .normalize('NFD')
        .replace(/[\u0300-\u036f]/g, '')
        .replace(/[^a-z0-9]+/g, '-')
        .replace(/^-|-$/g, '');
      setFormData((prev) => ({ ...prev, slug }));
    }
  }, [formData.name, product]);

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files || files.length === 0) return;

    setUploadingImage(true);

    try {
      const uploadedUrls: string[] = [];

      for (const file of Array.from(files)) {
        // Obtener firma del servidor
        const signResponse = await fetch('/api/upload', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            folder: 'products',
          }),
        });

        if (!signResponse.ok) {
          throw new Error('Error al obtener firma de upload');
        }

        const { signature, timestamp, cloudName, apiKey } = await signResponse.json();

        // Subir a Cloudinary
        const formData = new FormData();
        formData.append('file', file);
        formData.append('signature', signature);
        formData.append('timestamp', timestamp.toString());
        formData.append('api_key', apiKey);
        formData.append('folder', 'products');

        const uploadResponse = await fetch(
          `https://api.cloudinary.com/v1_1/${cloudName}/image/upload`,
          {
            method: 'POST',
            body: formData,
          }
        );

        if (!uploadResponse.ok) {
          throw new Error('Error al subir imagen');
        }

        const data = await uploadResponse.json();
        uploadedUrls.push(data.secure_url);
      }

      setFormData((prev) => ({
        ...prev,
        images: [...prev.images, ...uploadedUrls],
      }));
    } catch (error) {
      console.error('Error subiendo imágenes:', error);
      alert('Error al subir las imágenes');
    } finally {
      setUploadingImage(false);
    }
  };

  const removeImage = (index: number) => {
    setFormData((prev) => ({
      ...prev,
      images: prev.images.filter((_, i) => i !== index),
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrors({});

    try {
      // Validar con Zod
      productSchema.parse({
        ...formData,
        price: Number(formData.price),
        wholesalePrice: formData.wholesalePrice ? Number(formData.wholesalePrice) : undefined,
        minWholesale: Number(formData.minWholesale),
        stock: Number(formData.stock),
      });

      setIsSubmitting(true);

      const method = product ? 'PUT' : 'POST';
      const url = product ? `/api/products/${product.id}` : '/api/products';

      const response = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...formData,
          price: Number(formData.price),
          wholesalePrice: formData.wholesalePrice ? Number(formData.wholesalePrice) : null,
          minWholesale: Number(formData.minWholesale),
          stock: Number(formData.stock),
        }),
      });

      if (!response.ok) {
        throw new Error('Error al guardar producto');
      }

      alert(product ? 'Producto actualizado' : 'Producto creado');
      if (onSuccess) {
        onSuccess();
      } else {
        router.push('/admin/productos');
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
        alert('Error al guardar producto');
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>Información Básica</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div className="col-span-2 md:col-span-1">
              <Label htmlFor="name">Nombre del Producto *</Label>
              <Input
                id="name"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                className={errors.name ? 'border-red-500' : ''}
              />
              {errors.name && (
                <p className="text-sm text-red-500 mt-1">{errors.name}</p>
              )}
            </div>

            <div className="col-span-2 md:col-span-1">
              <Label htmlFor="slug">
                Slug (URL) *
                <span className="text-xs text-muted-foreground ml-2">
                  Se genera automáticamente
                </span>
              </Label>
              <Input
                id="slug"
                value={formData.slug}
                onChange={(e) => setFormData({ ...formData, slug: e.target.value })}
                className={errors.slug ? 'border-red-500' : ''}
              />
              {errors.slug && (
                <p className="text-sm text-red-500 mt-1">{errors.slug}</p>
              )}
            </div>
          </div>

          <div>
            <Label htmlFor="description">Descripción</Label>
            <Textarea
              id="description"
              value={formData.description}
              onChange={(e) =>
                setFormData({ ...formData, description: e.target.value })
              }
              rows={4}
              placeholder="Describe el producto..."
            />
          </div>

          <div>
            <Label htmlFor="category">Categoría *</Label>
            <Select
              value={formData.categoryId}
              onValueChange={(value) =>
                setFormData({ ...formData, categoryId: value })
              }
            >
              <SelectTrigger className={errors.categoryId ? 'border-red-500' : ''}>
                <SelectValue placeholder="Selecciona una categoría" />
              </SelectTrigger>
              <SelectContent>
                {categories.map((cat) => (
                  <SelectItem key={cat.id} value={cat.id}>
                    {cat.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            {errors.categoryId && (
              <p className="text-sm text-red-500 mt-1">{errors.categoryId}</p>
            )}
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Precios e Inventario</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label htmlFor="price">Precio Menudeo (MXN) *</Label>
              <Input
                id="price"
                type="number"
                step="0.01"
                value={formData.price}
                onChange={(e) => {
                  const value = e.target.value === '' ? '' : parseFloat(e.target.value);
                  setFormData({ ...formData, price: value });
                }}
                className={errors.price ? 'border-red-500' : ''}
              />
              {errors.price && (
                <p className="text-sm text-red-500 mt-1">{errors.price}</p>
              )}
            </div>

            <div>
              <Label htmlFor="wholesalePrice">Precio Mayoreo (MXN)</Label>
              <Input
                id="wholesalePrice"
                type="number"
                step="0.01"
                value={formData.wholesalePrice || ''}
                onChange={(e) => {
                  const value = e.target.value === '' ? '' : parseFloat(e.target.value);
                  setFormData({
                    ...formData,
                    wholesalePrice: value,
                  });
                }}
                placeholder="Opcional"
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label htmlFor="minWholesale">Cantidad Mínima Mayoreo</Label>
              <Input
                id="minWholesale"
                type="number"
                value={formData.minWholesale}
                onChange={(e) => {
                  const value = e.target.value === '' ? 0 : parseInt(e.target.value, 10);
                  setFormData({ ...formData, minWholesale: isNaN(value) ? 0 : value });
                }}
              />
            </div>

            <div>
              <Label htmlFor="stock">Stock Disponible *</Label>
              <Input
                id="stock"
                type="number"
                value={formData.stock}
                onChange={(e) => {
                  const value = e.target.value === '' ? 0 : parseInt(e.target.value, 10);
                  setFormData({ ...formData, stock: isNaN(value) ? 0 : value });
                }}
                className={errors.stock ? 'border-red-500' : ''}
              />
              {errors.stock && (
                <p className="text-sm text-red-500 mt-1">{errors.stock}</p>
              )}
            </div>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Imágenes *</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {/* Grid de imágenes */}
          {formData.images.length > 0 && (
            <div className="grid grid-cols-4 gap-4">
              {formData.images.map((url, index) => (
                <div key={index} className="relative aspect-square group">
                  <Image
                    src={url}
                    alt={`Imagen ${index + 1}`}
                    fill
                    className="object-cover rounded-lg"
                  />
                  <button
                    type="button"
                    onClick={() => removeImage(index)}
                    className="absolute top-1 right-1 bg-red-500 text-white rounded-full p-1 opacity-0 group-hover:opacity-100 transition-opacity"
                  >
                    <X className="h-4 w-4" />
                  </button>
                  {index === 0 && (
                    <Badge className="absolute bottom-2 left-2" variant="secondary">
                      Principal
                    </Badge>
                  )}
                </div>
              ))}
            </div>
          )}

          {/* Upload button */}
          <div>
            <Label
              htmlFor="image-upload"
              className="flex items-center justify-center h-32 border-2 border-dashed rounded-lg cursor-pointer hover:bg-accent transition-colors"
            >
              {uploadingImage ? (
                <div className="flex flex-col items-center gap-2">
                  <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
                  <span className="text-sm text-muted-foreground">Subiendo...</span>
                </div>
              ) : (
                <div className="flex flex-col items-center gap-2">
                  <Upload className="h-8 w-8 text-muted-foreground" />
                  <span className="text-sm font-medium">Subir Imágenes</span>
                  <span className="text-xs text-muted-foreground">
                    Múltiples archivos permitidos
                  </span>
                </div>
              )}
            </Label>
            <input
              id="image-upload"
              type="file"
              accept="image/*"
              multiple
              onChange={handleImageUpload}
              disabled={uploadingImage}
              className="hidden"
            />
            {errors.images && (
              <p className="text-sm text-red-500 mt-2">{errors.images}</p>
            )}
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Configuración</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <Label>Producto Activo</Label>
              <p className="text-sm text-muted-foreground">
                Los clientes pueden ver y comprar este producto
              </p>
            </div>
            <Switch
              checked={formData.active}
              onCheckedChange={(checked) =>
                setFormData({ ...formData, active: checked })
              }
            />
          </div>

          <div className="flex items-center justify-between">
            <div>
              <Label>Producto Destacado</Label>
              <p className="text-sm text-muted-foreground">
                Se mostrará en la página principal
              </p>
            </div>
            <Switch
              checked={formData.featured}
              onCheckedChange={(checked) =>
                setFormData({ ...formData, featured: checked })
              }
            />
          </div>
        </CardContent>
      </Card>

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
          ) : product ? (
            'Actualizar Producto'
          ) : (
            'Crear Producto'
          )}
        </Button>
      </div>
    </form>
  );
}
