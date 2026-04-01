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

interface WelcomeEmailProps {
  customerName: string;
}

export default function WelcomeEmail({ customerName = 'Cliente' }: WelcomeEmailProps) {
  return (
    <Html>
      <Head />
      <Preview>¡Bienvenido a Dulcería Online! 🍬</Preview>
      <Body style={main}>
        <Container style={container}>
          {/* Header */}
          <Section style={header}>
            <Heading style={h1}>🍬 Dulcería Online</Heading>
          </Section>

          {/* Welcome Message */}
          <Section style={content}>
            <Heading as="h2" style={h2}>
              ¡Bienvenido, {customerName}!
            </Heading>
            <Text style={text}>
              Nos emociona que te hayas unido a nuestra comunidad de amantes de los dulces
              mexicanos.
            </Text>
            <Text style={text}>
              En Dulcería Online encontrarás los mejores dulces tradicionales y modernos,
              con opciones tanto para compra al menudeo como al mayoreo.
            </Text>
          </Section>

          <Hr style={hr} />

          {/* Beneficios */}
          <Section style={content}>
            <Heading as="h3" style={h3}>
              ¿Qué puedes hacer ahora?
            </Heading>
            <ul style={list}>
              <li style={listItem}>
                <Text style={listText}>
                  🛒 <strong>Explora nuestro catálogo</strong> de dulces mexicanos
                </Text>
              </li>
              <li style={listItem}>
                <Text style={listText}>
                  💼 <strong>Compra al mayoreo</strong> con precios especiales
                </Text>
              </li>
              <li style={listItem}>
                <Text style={listText}>
                  📦 <strong>Rastrea tus pedidos</strong> en tiempo real
                </Text>
              </li>
              <li style={listItem}>
                <Text style={listText}>
                  ⭐ <strong>Guarda tus favoritos</strong> para compras futuras
                </Text>
              </li>
            </ul>
          </Section>

          {/* CTA */}
          <Section style={content}>
            <Button
              style={button}
              href={`${process.env.NEXTAUTH_URL || 'http://localhost:3000'}/catalogo`}
            >
              Comenzar a comprar
            </Button>
          </Section>

          <Hr style={hr} />

          {/* Datos de Mayoreo */}
          <Section style={infoBox}>
            <Heading as="h4" style={h4}>
              💡 ¿Sabías que...?
            </Heading>
            <Text style={text}>
              Al comprar cantidades mayores, accedes automáticamente a nuestros precios de
              mayoreo. ¡Ahorra más comprando más!
            </Text>
          </Section>

          {/* Footer */}
          <Hr style={hr} />
          <Section style={footer}>
            <Text style={footerText}>
              Si tienes alguna pregunta, estamos aquí para ayudarte. Responde a este email
              o visita nuestra sección de ayuda.
            </Text>
            <Text style={footerText}>
              ¡Gracias por elegirnos!
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

const h4 = {
  color: '#1f2937',
  fontSize: '16px',
  fontWeight: '600',
  margin: '0 0 12px',
};

const text = {
  color: '#6b7280',
  fontSize: '16px',
  lineHeight: '24px',
  margin: '0 0 16px',
};

const hr = {
  borderColor: '#e5e7eb',
  margin: '24px 0',
};

const list = {
  padding: '0',
  margin: '0 0 16px',
  listStylePosition: 'inside' as const,
};

const listItem = {
  margin: '0 0 12px',
  listStyle: 'none',
};

const listText = {
  color: '#6b7280',
  fontSize: '16px',
  lineHeight: '24px',
  margin: '0',
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

const infoBox = {
  padding: '24px',
  backgroundColor: '#fef3c7',
  borderRadius: '8px',
  border: '1px solid #fbbf24',
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
