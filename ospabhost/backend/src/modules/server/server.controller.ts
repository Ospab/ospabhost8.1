import { Request, Response } from 'express';
import { PrismaClient } from '@prisma/client';
import {
  createLXContainer,
  controlContainer,
  getContainerStats,
  changeRootPassword as proxmoxChangeRootPassword,
  deleteContainer,
  resizeContainer,
  createSnapshot,
  listSnapshots,
  rollbackSnapshot,
  deleteSnapshot
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
  // Нормализуем hostname: убираем недопустимые символы, приводим к нижнему регистру
  hostname = hostname.replace(/[^a-zA-Z0-9-]/g, '').toLowerCase();
  // Удалим ведущие и завершающие дефисы
  hostname = hostname.replace(/^-+|-+$/g, '');
  if (hostname.length < 3) hostname = `user${userId}`;
  if (hostname.length > 32) hostname = hostname.slice(0, 32);
  // Если начинается с цифры или дефиса — префикс
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
      const errorMsg = result.message || JSON.stringify(result);
      const isSocketError = errorMsg.includes('ECONNRESET') || errorMsg.includes('socket hang up');
      const logMsg = `[${new Date().toISOString()}] Ошибка Proxmox при создании контейнера (userId=${userId}, hostname=${hostname}, vmid=${result.vmid || 'unknown'}): ${errorMsg}${isSocketError ? ' [SOCKET_ERROR - возможно таймаут]' : ''}\n`;
      
      fs.appendFile('proxmox-errors.log', logMsg, (err: NodeJS.ErrnoException | null) => {
        if (err) console.error('Ошибка записи лога:', err);
      });
      
      console.error('Ошибка Proxmox при создании контейнера:', result);
      
      return res.status(500).json({
        error: 'Ошибка создания сервера в Proxmox',
        details: isSocketError 
          ? 'Сервер Proxmox не ответил вовремя. Пожалуйста, попробуйте позже.' 
          : result.message,
        fullError: result
      });
    }

    // Сохраняем сервер в БД, статус всегда 'running' после покупки
    // Устанавливаем дату следующего платежа через 30 дней
    const nextPaymentDate = new Date();
    nextPaymentDate.setDate(nextPaymentDate.getDate() + 30);

    const server = await prisma.server.create({
      data: {
        userId,
        tariffId,
        osId,
        status: 'running',
        proxmoxId: Number(result.vmid),
        ipAddress: result.ipAddress,
        rootPassword: result.rootPassword,
        nextPaymentDate,
        autoRenew: true
      }
    });

    // Создаём первую транзакцию о покупке
    await prisma.transaction.create({
      data: {
        userId,
        amount: -tariff.price,
        type: 'withdrawal',
        description: `Покупка сервера #${server.id}`,
        balanceBefore: user.balance,
        balanceAfter: user.balance - tariff.price
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
    const server = await prisma.server.findUnique({ 
      where: { id },
      include: {
        tariff: true,
        os: true,
        user: {
          select: {
            id: true,
            username: true,
            email: true,
          }
        }
      }
    });
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
    let actionSuccess = false;
    let status = '';
    let attempts = 0;
    const maxAttempts = 10;
    if (result.status === 'success') {
      while (attempts < maxAttempts) {
        await new Promise(resolve => setTimeout(resolve, 3000));
        const stats = await getContainerStats(server.proxmoxId);
        if (stats.status === 'success' && stats.data) {
          status = stats.data.status;
          if ((action === 'start' && status === 'running') ||
              (action === 'stop' && status === 'stopped') ||
              (action === 'restart' && status === 'running')) {
            actionSuccess = true;
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
    // Если статус изменился, считаем действие успешным даже если result.status !== 'success'
    if (newStatus !== server.status) {
      return res.json({ status: 'success', newStatus, message: 'Статус сервера изменён успешно' });
    }
    // Если не удалось, возвращаем исходный ответ
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
    // Используем SSH для смены пароля
    const { changeRootPasswordSSH } = require('./proxmoxApi');
    const result = await changeRootPasswordSSH(server.proxmoxId);
    if (result?.status === 'success' && result.password) {
      await prisma.server.update({ where: { id }, data: { rootPassword: result.password } });
    }
    res.json(result);
  } catch (error: any) {
    res.status(500).json({ error: error?.message || 'Ошибка смены пароля' });
  }
}

// Изменить конфигурацию сервера
export async function resizeServer(req: Request, res: Response) {
  try {
    const id = Number(req.params.id);
    const { cores, memory, disk } = req.body;
    const server = await prisma.server.findUnique({ where: { id } });
    if (!server || !server.proxmoxId) return res.status(404).json({ error: 'Сервер не найден или нет VMID' });
    
    const config: any = {};
    if (cores) config.cores = Number(cores);
    if (memory) config.memory = Number(memory);
    if (disk) {
      const vmStorage = process.env.PROXMOX_VM_STORAGE || 'local';
      config.rootfs = `${vmStorage}:${Number(disk)}`;
    }
    
    const result = await resizeContainer(server.proxmoxId, config);
    res.json(result);
  } catch (error: any) {
    res.status(500).json({ error: error?.message || 'Ошибка изменения конфигурации' });
  }
}

// Создать снэпшот
export async function createServerSnapshot(req: Request, res: Response) {
  try {
    const id = Number(req.params.id);
    const { snapname, description } = req.body;
    if (!snapname) return res.status(400).json({ error: 'Не указано имя снэпшота' });
    
    const server = await prisma.server.findUnique({ where: { id } });
    if (!server || !server.proxmoxId) return res.status(404).json({ error: 'Сервер не найден или нет VMID' });
    
    const result = await createSnapshot(server.proxmoxId, snapname, description);
    res.json(result);
  } catch (error: any) {
    res.status(500).json({ error: error?.message || 'Ошибка создания снэпшота' });
  }
}

// Получить список снэпшотов
export async function getServerSnapshots(req: Request, res: Response) {
  try {
    const id = Number(req.params.id);
    const server = await prisma.server.findUnique({ where: { id } });
    if (!server || !server.proxmoxId) return res.status(404).json({ error: 'Сервер не найден или нет VMID' });
    
    const result = await listSnapshots(server.proxmoxId);
    res.json(result);
  } catch (error: any) {
    res.status(500).json({ error: error?.message || 'Ошибка получения снэпшотов' });
  }
}

// Восстановить из снэпшота
export async function rollbackServerSnapshot(req: Request, res: Response) {
  try {
    const id = Number(req.params.id);
    const { snapname } = req.body;
    if (!snapname) return res.status(400).json({ error: 'Не указано имя снэпшота' });
    
    const server = await prisma.server.findUnique({ where: { id } });
    if (!server || !server.proxmoxId) return res.status(404).json({ error: 'Сервер не найден или нет VMID' });
    
    const result = await rollbackSnapshot(server.proxmoxId, snapname);
    res.json(result);
  } catch (error: any) {
    res.status(500).json({ error: error?.message || 'Ошибка восстановления снэпшота' });
  }
}

// Удалить снэпшот
export async function deleteServerSnapshot(req: Request, res: Response) {
  try {
    const id = Number(req.params.id);
    const { snapname } = req.body;
    if (!snapname) return res.status(400).json({ error: 'Не указано имя снэпшота' });
    
    const server = await prisma.server.findUnique({ where: { id } });
    if (!server || !server.proxmoxId) return res.status(404).json({ error: 'Сервер не найден или нет VMID' });
    
    const result = await deleteSnapshot(server.proxmoxId, snapname);
    res.json(result);
  } catch (error: any) {
    res.status(500).json({ error: error?.message || 'Ошибка удаления снэпшота' });
  }
}
