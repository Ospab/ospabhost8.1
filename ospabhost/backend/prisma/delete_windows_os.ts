import { PrismaClient } from '@prisma/client';
const prisma = new PrismaClient();

async function main() {
  await prisma.operatingSystem.deleteMany({ where: { type: 'windows' } });
  console.log('Все Windows Server ОС удалены!');
}

main().finally(() => prisma.$disconnect());
