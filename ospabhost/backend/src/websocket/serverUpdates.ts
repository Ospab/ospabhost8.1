import { Server as SocketServer } from 'socket.io';
import { Server as HttpServer } from 'http';
import jwt from 'jsonwebtoken';
import { PrismaClient } from '@prisma/client';
import { getContainerStats } from '../modules/server/proxmoxApi';

const prisma = new PrismaClient();
const JWT_SECRET = process.env.JWT_SECRET || 'your_super_secret_key';

export function initializeWebSocket(httpServer: HttpServer) {
  const io = new SocketServer(httpServer, {
    cors: {
      origin: ['http://localhost:3000', 'http://localhost:5173'],
      credentials: true,
      methods: ['GET', 'POST']
    }
  });

  // Authentication middleware
  io.use(async (socket, next) => {
    try {
      const token = socket.handshake.auth.token || socket.handshake.headers.authorization?.split(' ')[1];
      
      if (!token) {
        return next(new Error('Authentication error: No token provided'));
      }

      const decoded = jwt.verify(token, JWT_SECRET) as { id: number };
      const user = await prisma.user.findUnique({ where: { id: decoded.id } });
      
      if (!user) {
        return next(new Error('Authentication error: User not found'));
      }

      socket.data.userId = user.id;
      next();
    } catch (error) {
      next(new Error('Authentication error: Invalid token'));
    }
  });

  io.on('connection', (socket) => {
    console.log(`WebSocket connected: ${socket.id}, User: ${socket.data.userId}`);

    // Subscribe to server updates
    socket.on('subscribe:server', async (serverId: number) => {
      try {
        const server = await prisma.server.findUnique({
          where: { id: serverId },
          include: { os: true, tariff: true }
        });

        if (!server || server.userId !== socket.data.userId) {
          socket.emit('error', { message: 'Server not found or access denied' });
          return;
        }

        socket.join(`server:${serverId}`);
        console.log(`User ${socket.data.userId} subscribed to server ${serverId}`);
        
        // Send initial data
        if (server.proxmoxId) {
          const stats = await getContainerStats(server.proxmoxId);
          socket.emit('server:update', {
            serverId,
            server,
            stats: stats.status === 'success' ? stats.data : null
          });
        }
      } catch (error) {
        console.error('Error subscribing to server:', error);
        socket.emit('error', { message: 'Failed to subscribe to server updates' });
      }
    });

    // Unsubscribe from server updates
    socket.on('unsubscribe:server', (serverId: number) => {
      socket.leave(`server:${serverId}`);
      console.log(`User ${socket.data.userId} unsubscribed from server ${serverId}`);
    });

    // Handle disconnect
    socket.on('disconnect', () => {
      console.log(`WebSocket disconnected: ${socket.id}`);
    });
  });

  // Periodic updates for all active servers
  const updateInterval = setInterval(async () => {
    try {
      const servers = await prisma.server.findMany({
        where: {
          status: {
            in: ['running', 'stopped', 'suspended']
          }
        },
        include: { os: true, tariff: true }
      });

      for (const server of servers) {
        if (server.proxmoxId) {
          try {
            const stats = await getContainerStats(server.proxmoxId);
            
            if (stats.status === 'success' && stats.data) {
              // Update database with latest metrics
              await prisma.server.update({
                where: { id: server.id },
                data: {
                  status: stats.data.status,
                  cpuUsage: stats.data.cpu,
                  memoryUsage: stats.data.memory.usage,
                  diskUsage: stats.data.disk.usage,
                  lastPing: new Date()
                }
              });

              // Save metrics history
              await prisma.serverMetrics.create({
                data: {
                  serverId: server.id,
                  cpu: stats.data.cpu,
                  memory: stats.data.memory.usage,
                  disk: stats.data.disk.usage,
                  networkIn: stats.data.network.in,
                  networkOut: stats.data.network.out
                }
              });

              // Emit to subscribed clients
              io.to(`server:${server.id}`).emit('server:update', {
                serverId: server.id,
                server: await prisma.server.findUnique({
                  where: { id: server.id },
                  include: { os: true, tariff: true }
                }),
                stats: stats.data
              });
            }
          } catch (error) {
            console.error(`Error updating server ${server.id}:`, error);
          }
        }
      }
    } catch (error) {
      console.error('Error in periodic update:', error);
    }
  }, 30000); // Every 30 seconds

  // Cleanup on server shutdown
  const cleanup = () => {
    clearInterval(updateInterval);
    io.close();
  };

  return { io, cleanup };
}
