import {
  Body,
  Container,
  Head,
  Heading,
  Html,
  Img,
  Preview,
  Section,
  Text,
  Hr,
  Row,
  Column,
} from '@react-email/components';
import * as React from 'react';

interface OrderItem {
  product: {
    name: string;
    images?: string[];
  } | null;
  quantity: number;
  unitPrice: number;
  total: number;
}

interface OrderConfirmationEmailProps {
  customerName: string;
  folio: string;
  items: OrderItem[];
  subtotal: number;
  discount: number;
  total: number;
  address?: {
    street: string;
    city: string;
    state: string;
    zipCode: string;
    country: string;
  };
}

export default function OrderConfirmationEmail({
  customerName = 'Cliente',
  folio = 'ORD-123456',
  items = [],
  subtotal = 0,
  discount = 0,
  total = 0,
  address,
}: OrderConfirmationEmailProps) {
  const formatPrice = (price: number) => {
    return new Intl.NumberFormat('es-MX', {
      style: 'currency',
      currency: 'MXN',
    }).format(price);
  };

  return (
    <Html>
      <Head />
      <Preview>Tu pedido {folio} ha sido confirmado - Dulcería Online</Preview>
      <Body style={main}>
        <Container style={container}>
          {/* Header */}
          <Section style={header}>
            <Heading style={h1}>🍬 Dulcería Online</Heading>
          </Section>

          {/* Confirmación */}
          <Section style={content}>
            <Heading as="h2" style={h2}>
              ¡Gracias por tu pedido, {customerName}!
            </Heading>
            <Text style={text}>
              Tu pedido ha sido recibido y está siendo procesado. Te notificaremos cuando
              esté listo para envío.
            </Text>
            <Text style={orderNumber}>
              Número de pedido: <strong>{folio}</strong>
            </Text>
          </Section>

          <Hr style={hr} />

          {/* Items del pedido */}
          <Section style={content}>
            <Heading as="h3" style={h3}>
              Resumen del Pedido
            </Heading>

            {items.map((item, index) => (
              <Row key={index} style={itemRow}>
                <Column style={itemImageCol}>
                  {item.product?.images?.[0] ? (
                    <Img
                      src={item.product.images[0]}
                      alt={item.product.name}
                      width="60"
                      height="60"
                      style={itemImage}
                    />
                  ) : (
                    <div style={imagePlaceholder}>📦</div>
                  )}
                </Column>
                <Column style={itemDetails}>
                  <Text style={itemName}>{item.product?.name || 'Producto'}</Text>
                  <Text style={itemQuantity}>Cantidad: {item.quantity}</Text>
                </Column>
                <Column style={itemPriceCol}>
                  <Text style={itemPrice}>{formatPrice(item.total)}</Text>
                </Column>
              </Row>
            ))}
          </Section>

          <Hr style={hr} />

          {/* Totales */}
          <Section style={content}>
            <Row style={totalRow}>
              <Column>
                <Text style={totalLabel}>Subtotal:</Text>
              </Column>
              <Column align="right">
                <Text style={totalValue}>{formatPrice(subtotal)}</Text>
              </Column>
            </Row>

            {discount > 0 && (
              <Row style={totalRow}>
                <Column>
                  <Text style={totalLabel}>Descuento:</Text>
                </Column>
                <Column align="right">
                  <Text style={totalValue}>-{formatPrice(discount)}</Text>
                </Column>
              </Row>
            )}

            <Row style={totalRow}>
              <Column>
                <Text style={totalLabelBold}>Total:</Text>
              </Column>
              <Column align="right">
                <Text style={totalValueBold}>{formatPrice(total)}</Text>
              </Column>
            </Row>
          </Section>

          {/* Dirección de envío */}
          {address && (
            <>
              <Hr style={hr} />
              <Section style={content}>
                <Heading as="h3" style={h3}>
                  Dirección de Envío
                </Heading>
                <Text style={address_text}>
                  {address.street}
                  <br />
                  {address.city}, {address.state} {address.zipCode}
                  <br />
                  {address.country}
                </Text>
              </Section>
            </>
          )}

          {/* Footer */}
          <Hr style={hr} />
          <Section style={footer}>
            <Text style={footerText}>
              Si tienes alguna pregunta sobre tu pedido, responde a este email o
              contáctanos.
            </Text>
            <Text style={footerText}>
              ¡Gracias por tu compra!
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

const h2 = {
  color: '#1f2937',
  fontSize: '24px',
  fontWeight: 'bold',
  margin: '24px 0 16px',
};

const h3 = {
  color: '#1f2937',
  fontSize: '18px',
  fontWeight: '600',
  margin: '24px 0 16px',
};

const text = {
  color: '#6b7280',
  fontSize: '16px',
  lineHeight: '24px',
  margin: '0 0 16px',
};

const orderNumber = {
  color: '#1f2937',
  fontSize: '18px',
  fontWeight: '600',
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

const itemRow = {
  marginBottom: '16px',
};

const itemImageCol = {
  width: '80px',
  verticalAlign: 'top' as const,
};

const itemImage = {
  borderRadius: '8px',
  objectFit: 'cover' as const,
};

const imagePlaceholder = {
  width: '60px',
  height: '60px',
  backgroundColor: '#f3f4f6',
  borderRadius: '8px',
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  fontSize: '24px',
};

const itemDetails = {
  verticalAlign: 'top' as const,
  paddingLeft: '12px',
  paddingRight: '12px',
};

const itemName = {
  color: '#1f2937',
  fontSize: '16px',
  fontWeight: '600',
  margin: '0 0 4px',
};

const itemQuantity = {
  color: '#6b7280',
  fontSize: '14px',
  margin: '0',
};

const itemPriceCol = {
  width: '100px',
  verticalAlign: 'top' as const,
  textAlign: 'right' as const,
};

const itemPrice = {
  color: '#1f2937',
  fontSize: '16px',
  fontWeight: '600',
  margin: '0',
};

const totalRow = {
  marginBottom: '8px',
};

const totalLabel = {
  color: '#6b7280',
  fontSize: '16px',
  margin: '0',
};

const totalValue = {
  color: '#1f2937',
  fontSize: '16px',
  margin: '0',
};

const totalLabelBold = {
  color: '#1f2937',
  fontSize: '18px',
  fontWeight: 'bold',
  margin: '8px 0 0',
};

const totalValueBold = {
  color: '#7c3aed',
  fontSize: '20px',
  fontWeight: 'bold',
  margin: '8px 0 0',
};

const address_text = {
  color: '#6b7280',
  fontSize: '16px',
  lineHeight: '24px',
  margin: '0',
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
