import { PrismaClient } from '@prisma/client';
const prisma = new PrismaClient();

async function main() {
  const tariffs = [
    { name: 'Минимальный', price: 150, description: '1 ядро, 1ГБ RAM, 20ГБ SSD' },
    { name: 'Базовый', price: 300, description: '2 ядра, 2ГБ RAM, 40ГБ SSD' },
    { name: 'Старт', price: 500, description: '2 ядра, 4ГБ RAM, 60ГБ SSD' },
    { name: 'Оптимальный', price: 700, description: '4 ядра, 4ГБ RAM, 80ГБ SSD' },
    { name: 'Профи', price: 1000, description: '4 ядра, 8ГБ RAM, 120ГБ SSD' },
    { name: 'Бизнес', price: 1500, description: '8 ядер, 16ГБ RAM, 200ГБ SSD' },
    { name: 'Корпоративный', price: 2000, description: '12 ядер, 24ГБ RAM, 300ГБ SSD' },
    { name: 'Премиум', price: 2500, description: '16 ядер, 32ГБ RAM, 400ГБ SSD' },
    { name: 'Энтерпрайз', price: 2800, description: '24 ядра, 48ГБ RAM, 500ГБ SSD' },
    { name: 'Максимум', price: 3000, description: '32 ядра, 64ГБ RAM, 1ТБ SSD' },
  ];
  for (const t of tariffs) {
    await prisma.tariff.upsert({
      where: { name: t.name },
      update: t,
      create: t,
    });
  }
  console.log('Тарифы успешно добавлены!');
}

main().finally(() => prisma.$disconnect());
