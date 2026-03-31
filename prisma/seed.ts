import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

async function main() {
  console.log('🌱 Sembrando datos de prueba...');

  // Crear usuario admin
  const hashedPassword = await bcrypt.hash('admin123', 10);
  
  const admin = await prisma.user.upsert({
    where: { email: 'admin@dulceria.com' },
    update: {},
    create: {
      email: 'admin@dulceria.com',
      name: 'Administrador',
      password: hashedPassword,
      role: 'ADMIN',
      clientType: 'RETAIL',
    },
  });

  console.log('✅ Usuario admin creado:', admin.email);

  // Crear categorías
  const categories = [
    {
      name: 'Dulces Mexicanos',
      slug: 'dulces-mexicanos',
      image: '/categories/dulces-mexicanos.jpg',
    },
    {
      name: 'Chocolates',
      slug: 'chocolates',
      image: '/categories/chocolates.jpg',
    },
    {
      name: 'Botanas',
      slug: 'botanas',
      image: '/categories/botanas.jpg',
    },
    {
      name: 'Charamuscas',
      slug: 'charamuscas',
      image: '/categories/charamuscas.jpg',
    },
  ];

  for (const cat of categories) {
    await prisma.category.upsert({
      where: { slug: cat.slug },
      update: {},
      create: cat,
    });
  }

  console.log('✅ Categorías creadas');

  // Obtener IDs de categorías
  const dulcesCategory = await prisma.category.findUnique({
    where: { slug: 'dulces-mexicanos' },
  });

  const chocolatesCategory = await prisma.category.findUnique({
    where: { slug: 'chocolates' },
  });

  // Crear productos de ejemplo
  const products = [
    {
      name: 'Mazapán',
      slug: 'mazapan',
      description: 'Delicioso dulce de cacahuate tradicional mexicano',
      price: 5.0,
      wholesalePrice: 3.5,
      minWholesale: 50,
      stock: 500,
      categoryId: dulcesCategory?.id,
      images: ['/products/mazapan.jpg'],
      active: true,
      featured: true,
    },
    {
      name: 'Tamarindo',
      slug: 'tamarindo',
      description: 'Dulce de tamarindo con chile',
      price: 3.0,
      wholesalePrice: 2.0,
      minWholesale: 100,
      stock: 800,
      categoryId: dulcesCategory?.id,
      images: ['/products/tamarindo.jpg'],
      active: true,
      featured: false,
    },
    {
      name: 'Rockaleta',
      slug: 'rockaleta',
      description: 'Paleta de caramelo con relleno ácido',
      price: 4.0,
      wholesalePrice: 2.5,
      minWholesale: 100,
      stock: 600,
      categoryId: dulcesCategory?.id,
      images: ['/products/rockaleta.jpg'],
      active: true,
      featured: false,
    },
    {
      name: 'Carlos V',
      slug: 'carlos-v',
      description: 'Chocolate con leche clásico',
      price: 12.0,
      wholesalePrice: 9.0,
      minWholesale: 24,
      stock: 300,
      categoryId: chocolatesCategory?.id,
      images: ['/products/carlos-v.jpg'],
      active: true,
      featured: true,
    },
    {
      name: 'Kinder Bueno',
      slug: 'kinder-bueno',
      description: 'Chocolate relleno de avellana',
      price: 18.0,
      wholesalePrice: 14.0,
      minWholesale: 24,
      stock: 200,
      categoryId: chocolatesCategory?.id,
      images: ['/products/kinder-bueno.jpg'],
      active: true,
      featured: false,
    },
  ];

  for (const product of products) {
    await prisma.product.upsert({
      where: { slug: product.slug },
      update: {},
      create: product,
    });
  }

  console.log('✅ Productos de ejemplo creados');

  // Crear promoción de ejemplo
  const promo = await prisma.promotion.create({
    data: {
      title: 'Descuento de Bienvenida',
      description: '10% de descuento en productos seleccionados',
      discount: 10.0,
      type: 'PERCENTAGE',
      startDate: new Date(),
      endDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000), // 30 días
      active: true,
      bannerImage: '/promotions/bienvenida.jpg',
    },
  });

  console.log('✅ Promoción creada:', promo.title);

  console.log('\n🎉 ¡Datos de prueba sembrados exitosamente!');
  console.log('\n📧 Usuario admin:');
  console.log('   Email: admin@dulceria.com');
  console.log('   Password: admin123');
  console.log('\n🔐 ¡Recuerda cambiar la contraseña en producción!');
}

main()
  .catch((e) => {
    console.error('❌ Error al sembrar datos:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
