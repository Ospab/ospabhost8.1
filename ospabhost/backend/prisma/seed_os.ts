import { PrismaClient } from '@prisma/client';
const prisma = new PrismaClient();

async function main() {
  const oses = [
    { name: 'Ubuntu 22.04', type: 'linux', template: 'local:vztmpl/ubuntu-22.04-standard_22.04-1_amd64.tar.zst' },
    { name: 'Debian 12', type: 'linux', template: 'local:vztmpl/debian-12-standard_12.7-1_amd64.tar.zst' },
    { name: 'CentOS 9', type: 'linux', template: 'local:vztmpl/centos-9-stream-default_20240828_amd64.tar.xz' },
    { name: 'AlmaLinux 9', type: 'linux', template: 'local:vztmpl/almalinux-9-default_20240911_amd64.tar.xz' },
    { name: 'Rocky Linux 9', type: 'linux', template: 'local:vztmpl/rockylinux-9-default_20240912_amd64.tar.xz' },
    { name: 'Arch Linux', type: 'linux', template: 'local:vztmpl/archlinux-base_20240911-1_amd64.tar.zst' },
    { name: 'Fedora 41', type: 'linux', template: 'local:vztmpl/fedora-41-default_20241118_amd64.tar.xz' },
  ];
  for (const os of oses) {
    await prisma.operatingSystem.upsert({
      where: { name: os.name },
      update: os,
      create: os,
    });
  }
  console.log('ОС успешно добавлены!');
}

main().finally(() => prisma.$disconnect());
