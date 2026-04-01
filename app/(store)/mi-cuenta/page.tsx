import { redirect } from 'next/navigation';
import { auth } from '@/lib/auth';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import Link from 'next/link';
import { User, ShoppingBag, Settings, LogOut } from 'lucide-react';
import { signOut } from '@/lib/auth';

export default async function MiCuentaPage() {
  const session = await auth();

  if (!session?.user) {
    redirect('/login');
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="mx-auto max-w-4xl">
        <div className="mb-8">
          <h1 className="text-4xl font-bold mb-2">Mi Cuenta</h1>
          <p className="text-muted-foreground">
            Gestiona tu perfil y consulta tus pedidos
          </p>
        </div>

        <div className="grid gap-6 md:grid-cols-2">
          {/* Información del perfil */}
          <Card>
            <CardHeader>
              <div className="flex items-center gap-3">
                <div className="rounded-full bg-primary/10 p-3">
                  <User className="h-6 w-6 text-primary" />
                </div>
                <div>
                  <CardTitle>Información Personal</CardTitle>
                  <CardDescription>Tus datos de cuenta</CardDescription>
                </div>
              </div>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Nombre</p>
                <p className="text-lg font-semibold">{session.user.name || 'Sin nombre'}</p>
              </div>
              <div>
                <p className="text-sm font-medium text-muted-foreground">Email</p>
                <p className="text-lg font-semibold">{session.user.email}</p>
              </div>
              <div>
                <p className="text-sm font-medium text-muted-foreground">Tipo de cuenta</p>
                <p className="text-lg font-semibold">
                  {(session.user as any).role === 'ADMIN' ? 'Administrador' : 'Cliente'}
                </p>
              </div>
              <Link href="/mi-cuenta/editar">
                <Button variant="outline" className="w-full">
                  <Settings className="mr-2 h-4 w-4" />
                  Editar Perfil
                </Button>
              </Link>
            </CardContent>
          </Card>

          {/* Mis pedidos */}
          <Card>
            <CardHeader>
              <div className="flex items-center gap-3">
                <div className="rounded-full bg-green-100 p-3">
                  <ShoppingBag className="h-6 w-6 text-green-600" />
                </div>
                <div>
                  <CardTitle>Mis Pedidos</CardTitle>
                  <CardDescription>Historial de compras</CardDescription>
                </div>
              </div>
            </CardHeader>
            <CardContent className="space-y-4">
              <p className="text-muted-foreground">
                Consulta el estado de tus pedidos y el historial de compras.
              </p>
              <Link href="/mi-cuenta/pedidos">
                <Button variant="outline" className="w-full">
                  <ShoppingBag className="mr-2 h-4 w-4" />
                  Ver Mis Pedidos
                </Button>
              </Link>
            </CardContent>
          </Card>
        </div>

        {/* Accesos rápidos */}
        <Card className="mt-6">
          <CardHeader>
            <CardTitle>Accesos Rápidos</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid gap-3 sm:grid-cols-2">
              <Link href="/catalogo">
                <Button variant="outline" className="w-full justify-start">
                  Explorar Catálogo
                </Button>
              </Link>
              <Link href="/promociones">
                <Button variant="outline" className="w-full justify-start">
                  Ver Promociones
                </Button>
              </Link>
              <Link href="/mayoreo">
                <Button variant="outline" className="w-full justify-start">
                  Precios Mayoreo
                </Button>
              </Link>
              {(session.user as any).role === 'ADMIN' && (
                <Link href="/admin">
                  <Button variant="outline" className="w-full justify-start">
                    Panel Administrador
                  </Button>
                </Link>
              )}
            </div>
          </CardContent>
        </Card>

        {/* Cerrar sesión */}
        <div className="mt-6">
          <form
            action={async () => {
              'use server';
              await signOut({ redirectTo: '/' });
            }}
          >
            <Button type="submit" variant="destructive" className="w-full">
              <LogOut className="mr-2 h-4 w-4" />
              Cerrar Sesión
            </Button>
          </form>
        </div>
      </div>
    </div>
  );
}
