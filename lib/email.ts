import { Resend } from 'resend';

if (!process.env.RESEND_API_KEY) {
  console.warn('⚠️  RESEND_API_KEY no está configurado. Los emails no se enviarán.');
}

export const resend = new Resend(process.env.RESEND_API_KEY || 'demo-key');

export const EMAIL_FROM = process.env.EMAIL_FROM || 'onboarding@resend.dev';

// Helper para enviar emails con manejo de errores
export async function sendEmail({
  to,
  subject,
  react,
}: {
  to: string | string[];
  subject: string;
  react: React.ReactElement;
}) {
  try {
    const { data, error } = await resend.emails.send({
      from: EMAIL_FROM,
      to,
      subject,
      react,
    });

    if (error) {
      console.error('❌ Error sending email:', error);
      return { success: false, error };
    }

    console.log('✅ Email sent successfully:', data);
    return { success: true, data };
  } catch (error) {
    console.error('❌ Exception sending email:', error);
    return { success: false, error };
  }
}
