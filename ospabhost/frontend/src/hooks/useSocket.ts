import { useEffect, useState } from 'react';
import { io, Socket } from 'socket.io-client';

const SOCKET_URL = 'http://localhost:5000';

export function useSocket() {
  const [socket, setSocket] = useState<Socket | null>(null);
  const [connected, setConnected] = useState(false);

  useEffect(() => {
    const socketInstance = io(SOCKET_URL, {
      transports: ['websocket', 'polling'],
      reconnection: true,
      reconnectionDelay: 1000,
      reconnectionAttempts: 5
    });

    socketInstance.on('connect', () => {
      console.log('WebSocket connected');
      setConnected(true);
    });

    socketInstance.on('disconnect', () => {
      console.log('WebSocket disconnected');
      setConnected(false);
    });

    socketInstance.on('connect_error', (error) => {
      console.error('WebSocket connection error:', error);
    });

    setSocket(socketInstance);

    return () => {
      socketInstance.close();
    };
  }, []);

  return { socket, connected };
}

export function useServerStats(serverId: number | null) {
  const { socket, connected } = useSocket();
  const [stats, setStats] = useState<any>(null);
  const [alerts, setAlerts] = useState<any[]>([]);

  useEffect(() => {
    if (!socket || !connected || !serverId) return;

    // Подписываемся на обновления сервера
    socket.emit('subscribe-server', serverId);

    // Обработчик обновлений статистики
    socket.on('server-stats', (data: any) => {
      if (data.serverId === serverId) {
        setStats(data.stats);
      }
    });

    // Обработчик алертов
    socket.on('server-alerts', (data: any) => {
      if (data.serverId === serverId) {
        setAlerts(data.alerts);
      }
    });

    // Отписываемся при размонтировании
    return () => {
      socket.emit('unsubscribe-server', serverId);
      socket.off('server-stats');
      socket.off('server-alerts');
    };
  }, [socket, connected, serverId]);

  return { stats, alerts, connected };
}
