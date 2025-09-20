import { Request, Response } from 'express';
import { PrismaClient } from '@prisma/client';
import {
  createLXContainer,
  controlContainer,
  getContainerStats,
  changeRootPassword as proxmoxChangeRootPassword,
  deleteContainer
} from './proxmoxApi';

const prisma = new PrismaClient();

// Создание сервера (контейнера)
export async function createServer(req: Request, res: Response) {
  try {
    const { osId, tariffId } = req.body;
    const userId = req.user?.id;
    if (!userId) return res.status(401).json({ error: 'Нет авторизации' });

    const os = await prisma.operatingSystem.findUnique({ where: { id: osId } });
    const tariff = await prisma.tariff.findUnique({ where: { id: tariffId } });
    const user = await prisma.user.findUnique({ where: { id: userId } });
    if (!os || !tariff || !user) return res.status(400).json({ error: 'Некорректные параметры' });

    // Проверка баланса пользователя
    if (user.balance < tariff.price) {
      return res.status(400).json({ error: 'Недостаточно средств на балансе' });
    }

    // Списываем средства
    await prisma.user.update({ where: { id: userId }, data: { balance: { decrement: tariff.price } } });

    // Генерация hostname из email
    let hostname = user.email.split('@')[0];
    hostname = hostname.replace(/[^a-zA-Z0-9-]/g, '');
    if (hostname.length < 3) hostname = `user${userId}`;
    if (hostname.length > 32) hostname = hostname.slice(0, 32);
    if (/^[0-9-]/.test(hostname)) hostname = `u${hostname}`;

    // Создаём контейнер в Proxmox
    const result = await createLXContainer({
      os: { template: os.template || '', type: os.type },
      tariff: { name: tariff.name, price: tariff.price, description: tariff.description || undefined },
      user: { id: user.id, username: user.username },
      hostname
    });
    if (result.status !== 'success') {
      // Возвращаем деньги обратно, если не удалось создать
      await prisma.user.update({ where: { id: userId }, data: { balance: { increment: tariff.price } } });
      // Логируем полный текст ошибки в файл
      const fs = require('fs');
      const logMsg = `[${new Date().toISOString()}] Ошибка Proxmox: ${JSON.stringify(result, null, 2)}\n`;
      fs.appendFile('proxmox-errors.log', logMsg, (err: NodeJS.ErrnoException | null) => {
        if (err) console.error('Ошибка записи лога:', err);
      });
      console.error('Ошибка Proxmox:', result.message);
      return res.status(500).json({
        error: 'Ошибка создания сервера в Proxmox',
        details: result.message,
        fullError: result
      });
    }

    // Сохраняем сервер в БД с реальным статусом
    const server = await prisma.server.create({
      data: {
        userId,
        tariffId,
        osId,
        status: result.containerStatus || 'creating',
        proxmoxId: Number(result.vmid),
        ipAddress: result.ipAddress,
        rootPassword: result.rootPassword,
      }
    });
    res.json(server);
  } catch (error: any) {
    console.error('Ошибка покупки сервера:', error);
    res.status(500).json({ error: error?.message || 'Ошибка покупки сервера' });
  }
}

// Получить статус сервера
export async function getServerStatus(req: Request, res: Response) {
  try {
    const id = Number(req.params.id);
    const server = await prisma.server.findUnique({ where: { id } });
    if (!server) return res.status(404).json({ error: 'Сервер не найден' });
    if (!server.proxmoxId) return res.status(400).json({ error: 'Нет VMID Proxmox' });
    const stats = await getContainerStats(server.proxmoxId);
    if (stats.status === 'error') {
      // Если контейнер не найден в Proxmox, возвращаем статус deleted и пустую статистику
      return res.json({
        ...server,
        status: 'deleted',
        stats: {
          data: {
            cpu: 0,
            memory: { usage: 0 }
          }
        },
        error: 'Контейнер не найден в Proxmox',
        details: stats.message
      });
    }
    res.json({ ...server, stats });
  } catch (error: any) {
    res.status(500).json({ error: error?.message || 'Ошибка получения статуса' });
  }
}

// Запустить сервер
export async function startServer(req: Request, res: Response) {
  await handleControl(req, res, 'start');
}
// Остановить сервер
export async function stopServer(req: Request, res: Response) {
  await handleControl(req, res, 'stop');
}
// Перезагрузить сервер
export async function restartServer(req: Request, res: Response) {
  await handleControl(req, res, 'restart');
}

async function handleControl(req: Request, res: Response, action: 'start' | 'stop' | 'restart') {
  try {
    const id = Number(req.params.id);
    const server = await prisma.server.findUnique({ where: { id } });
    if (!server || !server.proxmoxId) return res.status(404).json({ error: 'Сервер не найден или нет VMID' });
    // Получаем текущий статус VM
    const stats = await getContainerStats(server.proxmoxId);
    const currentStatus = stats.status === 'success' && stats.data ? stats.data.status : server.status;
    // Ограничения на действия
    if (action === 'start' && currentStatus === 'running') {
      return res.status(400).json({ error: 'Сервер уже запущен' });
    }
    if (action === 'stop' && currentStatus === 'stopped') {
      return res.status(400).json({ error: 'Сервер уже остановлен' });
    }
    // Выполняем действие
    const result = await controlContainer(server.proxmoxId, action);
    // Polling статуса VM после управления
    let newStatus = server.status;
    if (result.status === 'success') {
      let status = '';
      let attempts = 0;
      const maxAttempts = 10;
      while (attempts < maxAttempts) {
        await new Promise(resolve => setTimeout(resolve, 3000));
        const stats = await getContainerStats(server.proxmoxId);
        if (stats.status === 'success' && stats.data) {
          status = stats.data.status;
          if ((action === 'start' && status === 'running') ||
              (action === 'stop' && status === 'stopped') ||
              (action === 'restart' && status === 'running')) {
            break;
          }
        }
        attempts++;
      }
      switch (status) {
        case 'running':
          newStatus = 'running';
          break;
        case 'stopped':
          newStatus = 'stopped';
          break;
        case 'suspended':
          newStatus = 'suspended';
          break;
        default:
          newStatus = status || server.status;
      }
      await prisma.server.update({ where: { id }, data: { status: newStatus } });
    }
    res.json({ ...result, status: newStatus });
  } catch (error: any) {
    res.status(500).json({ error: error?.message || 'Ошибка управления сервером' });
  }
}

// Удалить сервер
export async function deleteServer(req: Request, res: Response) {
  try {
    const id = Number(req.params.id);
    const server = await prisma.server.findUnique({ where: { id } });
    if (!server || !server.proxmoxId) return res.status(404).json({ error: 'Сервер не найден или нет VMID' });
    // Удаляем контейнер в Proxmox
    const proxmoxResult = await deleteContainer(server.proxmoxId);
    if (proxmoxResult.status !== 'success') {
      return res.status(500).json({ error: 'Ошибка удаления контейнера в Proxmox', details: proxmoxResult });
    }
    await prisma.server.delete({ where: { id } });
    res.json({ status: 'deleted' });
  } catch (error: any) {
    res.status(500).json({ error: error?.message || 'Ошибка удаления сервера' });
  }
}

// Сменить root-пароль
export async function changeRootPassword(req: Request, res: Response) {
  try {
    const id = Number(req.params.id);
    const server = await prisma.server.findUnique({ where: { id } });
    if (!server || !server.proxmoxId) return res.status(404).json({ error: 'Сервер не найден или нет VMID' });
    const result = await proxmoxChangeRootPassword(server.proxmoxId);
    if (result?.status === 'success' && result.password) {
      await prisma.server.update({ where: { id }, data: { rootPassword: result.password } });
    }
    res.json(result);
  } catch (error: any) {
    res.status(500).json({ error: error?.message || 'Ошибка смены пароля' });
  }
}
