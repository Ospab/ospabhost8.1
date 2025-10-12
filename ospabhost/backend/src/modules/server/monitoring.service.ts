import { Server as SocketIOServer, Socket } from 'socket.io';
import { PrismaClient } from '@prisma/client';
import { getContainerStats } from './proxmoxApi';
import { sendResourceAlertEmail } from '../notification/email.service';

const prisma = new PrismaClient();

export class MonitoringService {
  private io: SocketIOServer;
  private monitoringInterval: NodeJS.Timeout | null = null;
  private readonly MONITORING_INTERVAL = 30000; // 30 секунд

  constructor(io: SocketIOServer) {
    this.io = io;
    this.setupSocketHandlers();
  }

  private setupSocketHandlers() {
  this.io.on('connection', (socket: Socket) => {
      console.log(`Client connected: ${socket.id}`);

      // Подписка на обновления конкретного сервера
      socket.on('subscribe-server', async (serverId: number) => {
        console.log(`Client ${socket.id} subscribed to server ${serverId}`);
        socket.join(`server-${serverId}`);
        
        // Отправляем начальную статистику
        try {
          const server = await prisma.server.findUnique({ where: { id: serverId } });
          if (server && server.proxmoxId) {
            const stats = await getContainerStats(server.proxmoxId);
            socket.emit('server-stats', { serverId, stats });
          }
        } catch (error) {
          console.error(`Error fetching initial stats for server ${serverId}:`, error);
        }
      });

      // Отписка от обновлений сервера
      socket.on('unsubscribe-server', (serverId: number) => {
        console.log(`Client ${socket.id} unsubscribed from server ${serverId}`);
        socket.leave(`server-${serverId}`);
      });

      socket.on('disconnect', () => {
        console.log(`Client disconnected: ${socket.id}`);
      });
    });
  }

  // Запуск периодического мониторинга
  public startMonitoring() {
    if (this.monitoringInterval) {
      console.log('Monitoring already running');
      return;
    }

    console.log('Starting server monitoring service...');
    this.monitoringInterval = setInterval(async () => {
      await this.checkAllServers();
    }, this.MONITORING_INTERVAL);

    // Первая проверка сразу
    this.checkAllServers();
  }

  // Остановка мониторинга
  public stopMonitoring() {
    if (this.monitoringInterval) {
      clearInterval(this.monitoringInterval);
      this.monitoringInterval = null;
      console.log('Monitoring service stopped');
    }
  }

  // Проверка всех активных серверов
  private async checkAllServers() {
    try {
      const servers = await prisma.server.findMany({
        where: {
          status: {
            in: ['running', 'stopped', 'creating']
          }
        }
      });

      for (const server of servers) {
        if (server.proxmoxId) {
          try {
            const stats = await getContainerStats(server.proxmoxId);
            
            if (stats.status === 'success' && stats.data) {
              // Обновляем статус и метрики в БД
              await prisma.server.update({
                where: { id: server.id },
                data: {
                  status: stats.data.status,
                  cpuUsage: stats.data.cpu || 0,
                  memoryUsage: stats.data.memory?.usage || 0,
                  diskUsage: stats.data.disk?.usage || 0,
                  networkIn: stats.data.network?.in || 0,
                  networkOut: stats.data.network?.out || 0,
                  lastPing: new Date()
                }
              });

              // Отправляем обновления подписанным клиентам
              this.io.to(`server-${server.id}`).emit('server-stats', {
                serverId: server.id,
                stats
              });

              // Проверяем превышение лимитов и отправляем алерты
              await this.checkResourceLimits(server, stats.data);
            }
          } catch (error) {
            console.error(`Error monitoring server ${server.id}:`, error);
          }
        }
      }
    } catch (error) {
      console.error('Error in checkAllServers:', error);
    }
  }

  // Проверка превышения лимитов ресурсов
  private async checkResourceLimits(server: any, stats: any) {
    const alerts = [];

    // CPU превышает 90%
    if (stats.cpu && stats.cpu > 0.9) {
      alerts.push({
        type: 'cpu',
        message: `CPU usage is at ${(stats.cpu * 100).toFixed(1)}%`,
        level: 'warning'
      });
      
      // Отправляем email уведомление
      await sendResourceAlertEmail(
        server.userId,
        server.id,
        'CPU',
        `${(stats.cpu * 100).toFixed(1)}%`
      );
    }

    // Memory превышает 90%
    if (stats.memory?.usage && stats.memory.usage > 90) {
      alerts.push({
        type: 'memory',
        message: `Memory usage is at ${stats.memory.usage.toFixed(1)}%`,
        level: 'warning'
      });
      
      // Отправляем email уведомление
      await sendResourceAlertEmail(
        server.userId,
        server.id,
        'Memory',
        `${stats.memory.usage.toFixed(1)}%`
      );
    }

    // Disk превышает 90%
    if (stats.disk?.usage && stats.disk.usage > 90) {
      alerts.push({
        type: 'disk',
        message: `Disk usage is at ${stats.disk.usage.toFixed(1)}%`,
        level: 'warning'
      });
      
      // Отправляем email уведомление
      await sendResourceAlertEmail(
        server.userId,
        server.id,
        'Disk',
        `${stats.disk.usage.toFixed(1)}%`
      );
    }

    // Отправляем алерты, если есть
    if (alerts.length > 0) {
      this.io.to(`server-${server.id}`).emit('server-alerts', {
        serverId: server.id,
        alerts
      });

      console.log(`Alerts for server ${server.id}:`, alerts);
    }
  }
}
