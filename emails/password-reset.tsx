import {
  Body,
  Container,
  Head,
  Heading,
  Html,
  Preview,
  Section,
  Text,
  Hr,
  Button,
} from '@react-email/components';
import * as React from 'react';

interface PasswordResetEmailProps {
  customerName: string;
  resetUrl: string;
}

export default function PasswordResetEmail({
  customerName = 'Cliente',
  resetUrl = 'http://localhost:3000/reset-password?token=xxx',
}: PasswordResetEmailProps) {
  return (
    <Html>
      <Head />
      <Preview>Recupera tu contraseña - Dulcería Online</Preview>
      <Body style={main}>
        <Container style={container}>
          <Section style={header}>
            <Heading style={h1}>🍬 Dulcería Online</Heading>
          </Section>

          <Section style={content}>
            <Heading as="h2" style={h2}>
              Recuperar Contraseña
            </Heading>
            <Text style={text}>
              Hola {customerName}, recibimos una solicitud para restablecer tu
              contraseña.
            </Text>
            <Text style={text}>
              Haz clic en el botón de abajo para crear una nueva contraseña. Este
              enlace expira en 1 hora.
            </Text>
          </Section>

          <Section style={content}>
            <Button style={button} href={resetUrl}>
              Restablecer Contraseña
            </Button>
          </Section>

          <Hr style={hr} />

          <Section style={content}>
            <Text style={textSmall}>
              Si no solicitaste este cambio, puedes ignorar este email. Tu
              contraseña no será modificada.
            </Text>
          </Section>

          <Hr style={hr} />
          <Section style={footer}>
            <Text style={footerText}>
              ¡Gracias por ser parte de Dulcería Online!
              <br />
              El equipo de Dulcería Online
            </Text>
          </Section>
        </Container>
      </Body>
    </Html>
  );
}

const main = {
  backgroundColor: '#f6f9fc',
  fontFamily:
    '-apple-system,BlinkMacSystemFont,"Segoe UI",Roboto,"Helvetica Neue",Ubuntu,sans-serif',
};

const container = {
  backgroundColor: '#ffffff',
  margin: '0 auto',
  padding: '20px 0 48px',
  marginBottom: '64px',
  maxWidth: '600px',
};

const header = {
  padding: '32px 24px',
  backgroundColor: '#7c3aed',
  textAlign: 'center' as const,
};

const h1 = {
  color: '#ffffff',
  fontSize: '28px',
  fontWeight: 'bold',
  margin: '0',
  padding: '0',
};

const content = {
  padding: '0 24px',
};

const h2 = {
  color: '#1f2937',
  fontSize: '24px',
  fontWeight: 'bold',
  margin: '24px 0 16px',
};

const text = {
  color: '#6b7280',
  fontSize: '16px',
  lineHeight: '24px',
  margin: '0 0 16px',
};

const textSmall = {
  color: '#9ca3af',
  fontSize: '14px',
  lineHeight: '20px',
  margin: '0 0 16px',
};

const hr = {
  borderColor: '#e5e7eb',
  margin: '24px 0',
};

const button = {
  backgroundColor: '#7c3aed',
  borderRadius: '8px',
  color: '#fff',
  fontSize: '16px',
  fontWeight: 'bold',
  textDecoration: 'none',
  textAlign: 'center' as const,
  display: 'block',
  padding: '14px 24px',
  margin: '24px auto',
  maxWidth: '300px',
};

const footer = {
  padding: '0 24px',
};

const footerText = {
  color: '#9ca3af',
  fontSize: '14px',
  lineHeight: '20px',
  margin: '8px 0',
  textAlign: 'center' as const,
};
