import { PrismaClient } from '@prisma/client';
const prisma = new PrismaClient();

const stripeId = 'cs_test_a1Y7hxI3SNSKOV8Ty3gVsMNIDRPn3xmDEj0bgMTHMPSSLDJovl1y6W8v5Y';

const orders = await prisma.order.findMany({
  where: { stripeId },
  orderBy: { createdAt: 'asc' },
  select: { id: true, folio: true, createdAt: true },
});

console.log(`Found ${orders.length} orders with this stripeId:`);
orders.forEach(o => console.log(`  ${o.folio} - ${o.createdAt}`));

if (orders.length > 1) {
  // Keep the first one, delete the rest
  const toDelete = orders.slice(1).map(o => o.id);
  console.log(`\nDeleting ${toDelete.length} duplicates...`);

  // Delete order items first (FK constraint)
  await prisma.orderItem.deleteMany({ where: { orderId: { in: toDelete } } });
  await prisma.order.deleteMany({ where: { id: { in: toDelete } } });

  // Restore stock for the extra duplicates (each duplicate decremented stock)
  const items = await prisma.orderItem.findMany({
    where: { orderId: orders[0].id },
  });
  for (const item of items) {
    await prisma.product.update({
      where: { id: item.productId },
      data: { stock: { increment: item.quantity * toDelete.length } },
    });
  }

  console.log('Done. Stock restored for', toDelete.length, 'extra decrements.');
} else {
  console.log('No duplicates found.');
}

await prisma.$disconnect();
