import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

export default function NosotrosPage() {
  return (
    <div className="container mx-auto px-4 py-8">
      <div className="mx-auto max-w-4xl space-y-8">
        <div className="text-center">
          <h1 className="text-4xl font-bold mb-4">Sobre Nosotros</h1>
          <p className="text-xl text-muted-foreground">
            Dulces mexicanos de calidad desde 1995
          </p>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>Nuestra Historia</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <p>
              DulceríaOnline nació con la misión de llevar los mejores dulces mexicanos
              a cada rincón del país. Con más de 25 años de experiencia en el mercado,
              nos hemos consolidado como uno de los distribuidores de confianza tanto para
              consumidores finales como para revendedores.
            </p>
            <p>
              Trabajamos directamente con los fabricantes más reconocidos de México para
              garantizar la frescura y calidad de cada producto que llega a tus manos.
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Nuestra Promesa</CardTitle>
          </CardHeader>
          <CardContent>
            <ul className="space-y-2 list-disc list-inside">
              <li>Productos 100% auténticos y frescos</li>
              <li>Precios competitivos para mayoreo y menudeo</li>
              <li>Envíos rápidos y seguros a toda la República</li>
              <li>Atención personalizada para cada cliente</li>
              <li>Garantía de satisfacción en cada compra</li>
            </ul>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Contacto</CardTitle>
          </CardHeader>
          <CardContent className="space-y-2">
            <p><strong>Teléfono:</strong> +52 55 1234 5678</p>
            <p><strong>Email:</strong> ventas@dulceriaonline.mx</p>
            <p><strong>Horario:</strong> Lunes a Viernes 9:00 AM - 6:00 PM</p>
            <p><strong>Ubicación:</strong> Ciudad de México, México</p>
          </CardContent></Card>
      </div>
    </div>
  );
}
