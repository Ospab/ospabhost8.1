import { useEffect, useState } from 'react';
import io from 'socket.io-client';

type Socket = SocketIOClient.Socket;

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

    socketInstance.on('connect_error', (error: Error) => {
      console.error('WebSocket connection error:', error);
    });

    setSocket(socketInstance);

    return () => {
      socketInstance.close();
    };
  }, []);

  return { socket, connected };
}


// Типы для статистики и алертов
export interface ServerStats {
  status?: string;
  cpu?: number;
  memory?: {
    usage: number;
  };
  disk?: {
    usage: number;
  };
  network?: {
    in: number;
    out: number;
  };
}

export interface ServerAlert {
  type: 'cpu' | 'memory' | 'disk';
  message: string;
  level: 'warning' | 'info' | 'critical';
}

interface ServerStatsEvent {
  serverId: number;
  stats: ServerStats;
}

interface ServerAlertsEvent {
  serverId: number;
  alerts: ServerAlert[];
}

export function useServerStats(serverId: number | null) {
  const { socket, connected } = useSocket();
  const [stats, setStats] = useState<ServerStats | null>(null);
  const [alerts, setAlerts] = useState<ServerAlert[]>([]);

  useEffect(() => {
    if (!socket || !connected || !serverId) return;

    socket.emit('subscribe-server', serverId);

    const handleStats = (data: ServerStatsEvent) => {
      if (data.serverId === serverId) {
        setStats(data.stats);
      }
    };
    const handleAlerts = (data: ServerAlertsEvent) => {
      if (data.serverId === serverId) {
        setAlerts(data.alerts);
      }
    };

    socket.on('server-stats', handleStats);
    socket.on('server-alerts', handleAlerts);

    return () => {
      socket.emit('unsubscribe-server', serverId);
      socket.off('server-stats', handleStats);
      socket.off('server-alerts', handleAlerts);
    };
  }, [socket, connected, serverId]);

  return { stats, alerts, connected };
}
