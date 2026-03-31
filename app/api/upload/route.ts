import { NextResponse } from 'next/server';
import { generateUploadSignature } from '@/lib/cloudinary';

// POST /api/upload - Obtener firma para upload directo a Cloudinary
export async function POST(request: Request) {
  try {
    const { folder } = await request.json();

    // Generar firma con validación de env vars
    const signatureData = generateUploadSignature(folder || 'uploads');

    console.log('[Upload API] Firma generada exitosamente para folder:', folder);

    return NextResponse.json(signatureData);
  } catch (error) {
    console.error('[Upload API] Error generando firma de Cloudinary:', error);
    
    // Retornar mensaje de error más descriptivo
    const errorMessage = error instanceof Error ? error.message : 'Error desconocido';
    
    return NextResponse.json(
      { 
        error: 'Error al generar firma de upload',
        details: errorMessage 
      },
      { status: 500 }
    );
  }
}
