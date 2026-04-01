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

interface OrderStatusUpdateEmailProps {
  customerName: string;
  folio: string;
  status: string;
  trackingNumber?: string;
  carrier?: string;
}

const STATUS_LABELS: Record<string, string> = {
  PENDING: 'Pendiente de pago',
  PAID: 'Pagado - En preparación',
  PREPARING: 'Preparando tu pedido',
  SHIPPED: 'Enviado',
  DELIVERED: 'Entregado',
  CANCELLED: 'Cancelado',
};

const STATUS_MESSAGES: Record<string, string> = {
  PENDING: 'Tu pedido está pendiente de confirmación de pago.',
  PAID: '¡Tu pago ha sido confirmado! Estamos preparando tu pedido.',
  PREPARING:
    'Tu pedido está siendo preparado con cuidado. Pronto estará listo para envío.',
  SHIPPED:
    '¡Tu pedido está en camino! Recibirás tus productos pronto.',
  DELIVERED: '¡Tu pedido ha sido entregado! Esperamos que lo disfrutes.',
  CANCELLED:
    'Tu pedido ha sido cancelado. Si tienes alguna pregunta, contáctanos.',
};

const STATUS_EMOJIS: Record<string, string> = {
  PENDING: '⏳',
  PAID: '✅',
  PREPARING: '📦',
  SHIPPED: '🚚',
  DELIVERED: '🎉',
  CANCELLED: '❌',
};

export default function OrderStatusUpdateEmail({
  customerName = 'Cliente',
  folio = 'ORD-123456',
  status = 'PREPARING',
  trackingNumber,
  carrier,
}: OrderStatusUpdateEmailProps) {
  const statusLabel = STATUS_LABELS[status] || status;
  const statusMessage = STATUS_MESSAGES[status] || 'Tu pedido ha sido actualizado.';
  const statusEmoji = STATUS_EMOJIS[status] || '📋';

  return (
    <Html>
      <Head />
      <Preview>Actualización de tu pedido {folio} - {statusLabel}</Preview>
      <Body style={main}>
        <Container style={container}>
          {/* Header */}
          <Section style={header}>
            <Heading style={h1}>🍬 Dulcería Online</Heading>
          </Section>

          {/* Status Badge */}
          <Section style={content}>
            <div style={statusBadge}>
              <Text style={statusEmoji_style}>{statusEmoji}</Text>
              <Heading as="h2" style={h2}>
                {statusLabel}
              </Heading>
            </div>
          </Section>

          {/* Mensaje */}
          <Section style={content}>
            <Text style={greeting}>Hola {customerName},</Text>
            <Text style={text}>{statusMessage}</Text>
            <Text style={orderNumber}>
              Pedido: <strong>{folio}</strong>
            </Text>
          </Section>

          {/* Tracking Info */}
          {trackingNumber && carrier && (
            <>
              <Hr style={hr} />
              <Section style={content}>
                <Heading as="h3" style={h3}>
                  Información de Rastreo
                </Heading>
                <div style={trackingBox}>
                  <Text style={trackingLabel}>Paquetería:</Text>
                  <Text style={trackingValue}>{carrier}</Text>
                  <Text style={trackingLabel}>Número de guía:</Text>
                  <Text style={trackingValue}>{trackingNumber}</Text>
                </div>
                <Text style={text}>
                  Puedes usar este número para rastrear tu paquete en el sitio web de {carrier}.
                </Text>
              </Section>
            </>
          )}

          {/* CTA Button */}
          {status !== 'CANCELLED' && (
            <Section style={content}>
              <Button style={button} href={`${process.env.NEXTAUTH_URL || 'http://localhost:3000'}/mi-cuenta/pedidos/${folio}`}>
                Ver detalles del pedido
              </Button>
            </Section>
          )}

          {/* Footer */}
          <Hr style={hr} />
          <Section style={footer}>
            <Text style={footerText}>
              Si tienes alguna pregunta sobre tu pedido, responde a este email o
              contáctanos.
            </Text>
            <Text style={footerText}>
              ¡Gracias por tu preferencia!
              <br />
              El equipo de Dulcería Online
            </Text>
          </Section>
        </Container>
      </Body>
    </Html>
  );
}

// Estilos
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

const statusBadge = {
  textAlign: 'center' as const,
  padding: '24px',
  backgroundColor: '#f9fafb',
  borderRadius: '12px',
  margin: '24px 0',
};

const statusEmoji_style = {
  fontSize: '48px',
  margin: '0 0 12px',
};

const h2 = {
  color: '#1f2937',
  fontSize: '24px',
  fontWeight: 'bold',
  margin: '0',
};

const h3 = {
  color: '#1f2937',
  fontSize: '18px',
  fontWeight: '600',
  margin: '24px 0 16px',
};

const greeting = {
  color: '#1f2937',
  fontSize: '16px',
  fontWeight: '600',
  margin: '24px 0 8px',
};

const text = {
  color: '#6b7280',
  fontSize: '16px',
  lineHeight: '24px',
  margin: '0 0 16px',
};

const orderNumber = {
  color: '#1f2937',
  fontSize: '16px',
  margin: '16px 0',
  padding: '12px',
  backgroundColor: '#f3f4f6',
  borderRadius: '8px',
  textAlign: 'center' as const,
};

const hr = {
  borderColor: '#e5e7eb',
  margin: '24px 0',
};

const trackingBox = {
  backgroundColor: '#f9fafb',
  padding: '16px',
  borderRadius: '8px',
  margin: '16px 0',
  border: '1px solid #e5e7eb',
};

const trackingLabel = {
  color: '#6b7280',
  fontSize: '14px',
  margin: '0 0 4px',
  fontWeight: '600',
};

const trackingValue = {
  color: '#1f2937',
  fontSize: '16px',
  margin: '0 0 12px',
  fontFamily: 'monospace',
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
