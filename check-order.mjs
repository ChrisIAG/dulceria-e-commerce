import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function checkAllOrders() {
  const orders = await prisma.order.findMany({
    orderBy: { createdAt: 'desc' },
    take: 5,
    include: { 
      items: { 
        include: { 
          product: { select: { name: true } } 
        } 
      },
      coupon: { select: { code: true, discountType: true, discountValue: true } }
    }
  });
  
  console.log(`📊 Total órdenes: ${await prisma.order.count()}\n`);
  console.log('📝 Últimas 5 órdenes:\n');
  
  orders.forEach((order, index) => {
    console.log(`${index + 1}. Folio: ${order.folio}`);
    console.log(`   Fecha: ${order.createdAt.toLocaleString('es-MX')}`);
    console.log(`   Status: ${order.status}`);
    console.log(`   UserID: ${order.userId || 'NO ASIGNADO'}`);
    console.log(`   Email en notes: ${order.notes || 'N/A'}`);
    console.log(`   Subtotal: $${order.subtotal} MXN`);
    if (order.discount > 0) {
      console.log(`   Descuento: -$${order.discount} MXN (Cupón: ${order.coupon?.code || 'N/A'})`);
    }
    console.log(`   Total: $${order.total} MXN`);
    console.log(`   Items: ${order.items.length}`);
    order.items.forEach(item => {
      console.log(`      - ${item.product?.name || 'Producto'}: ${item.quantity} × $${item.unitPrice}`);
    });
    console.log('');
  });
}

checkAllOrders()
  .catch(console.error)
  .finally(() => prisma.$disconnect());
