import { NextRequest, NextResponse } from 'next/server';
import { randomBytes } from 'crypto';
import { z } from 'zod';
import { prisma } from '@/lib/prisma';
import { sendEmail } from '@/lib/email';
import PasswordResetEmail from '@/emails/password-reset';

const schema = z.object({
  email: z.string().email('Email inválido'),
});

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { email } = schema.parse(body);

    const user = await prisma.user.findUnique({ where: { email } });

    // Always return success to prevent email enumeration
    if (!user) {
      return NextResponse.json({
        message: 'Si el email existe, recibirás un enlace para restablecer tu contraseña.',
      });
    }

    // Generate token and set 1-hour expiry
    const token = randomBytes(32).toString('hex');
    const expires = new Date(Date.now() + 60 * 60 * 1000); // 1 hour

    await prisma.user.update({
      where: { id: user.id },
      data: {
        passwordResetToken: token,
        passwordResetExpires: expires,
      },
    });

    const baseUrl = process.env.NEXTAUTH_URL || 'http://localhost:3000';
    const resetUrl = `${baseUrl}/reset-password?token=${token}`;

    sendEmail({
      to: email,
      subject: 'Recupera tu contraseña - Dulcería Online 🍬',
      react: PasswordResetEmail({
        customerName: user.name || 'Cliente',
        resetUrl,
      }),
    }).catch((error) => {
      console.error('Error sending password reset email:', error);
    });

    return NextResponse.json({
      message: 'Si el email existe, recibirás un enlace para restablecer tu contraseña.',
    });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: 'Email inválido', details: error.issues },
        { status: 400 }
      );
    }
    console.error('Error en forgot-password:', error);
    return NextResponse.json(
      { error: 'Error al procesar la solicitud' },
      { status: 500 }
    );
  }
}
