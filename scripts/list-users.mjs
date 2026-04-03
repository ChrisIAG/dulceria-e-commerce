import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function listUsers() {
  const users = await prisma.user.findMany();
  console.log('📋 Usuarios en la base de datos:\n');
  users.forEach(u => {
    console.log(`- ${u.name} (${u.email}) - ID: ${u.id}`);
  });
  console.log(`\nTotal: ${users.length} usuarios`);
  await prisma.$disconnect();
}

listUsers();
