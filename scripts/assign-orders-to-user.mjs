import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function assignOrdersToUser() {
  try {
    // Email del admin
    const adminEmail = 'admin@dulceria.com';
    
    // Buscar el usuario admin
    const admin = await prisma.user.findUnique({
      where: { email: adminEmail }
    });
    
    if (!admin) {
      console.log('❌ Usuario admin no encontrado con email:', adminEmail);
      return;
    }
    
    console.log('✅ Usuario admin encontrado:', admin.name, '- ID:', admin.id);
    
    // Buscar todas las órdenes sin userId
    const ordersWithoutUser = await prisma.order.findMany({
      where: {
        userId: null
      }
    });
    
    console.log(`\n📦 Órdenes sin userId encontradas: ${ordersWithoutUser.length}\n`);
    
    if (ordersWithoutUser.length === 0) {
      console.log('No hay órdenes para asignar.');
      return;
    }
    
    // Asignar cada orden al admin
    for (const order of ordersWithoutUser) {
      await prisma.order.update({
        where: { id: order.id },
        data: { userId: admin.id }
      });
      console.log(`✅ Orden ${order.folio} asignada a ${admin.name}`);
    }
    
    console.log(`\n🎉 ${ordersWithoutUser.length} órdenes asignadas exitosamente al admin!`);
    
  } catch (error) {
    console.error('❌ Error:', error);
  } finally {
    await prisma.$disconnect();
  }
}

assignOrdersToUser();
