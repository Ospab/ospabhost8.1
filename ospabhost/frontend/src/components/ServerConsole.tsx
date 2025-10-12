import React, { useEffect, useRef } from 'react';
import { useParams } from 'react-router-dom';
import { Terminal } from 'xterm';
import 'xterm/css/xterm.css';

const ServerConsole: React.FC = () => {
  const { id } = useParams();
  const termRef = useRef<HTMLDivElement>(null);
  const wsRef = useRef<WebSocket | null>(null);
  const xtermRef = useRef<Terminal | null>(null);
  const reconnectAttempts = useRef(0);

  // Логгер ошибок
  const logError = (msg: string, err?: unknown) => {
    console.error('[Console]', msg, err);
  };

  useEffect(() => {
    let disposed = false;
    if (!termRef.current) return;
    let term: Terminal | null = null;
    try {
      term = new Terminal({
        rows: 24,
        cols: 80,
        fontSize: 16,
        theme: {
          background: '#18181b',
          foreground: '#e5e7eb',
        },
        cursorBlink: true,
      });
      term.open(termRef.current);
      xtermRef.current = term;
    } catch (err) {
      logError('Ошибка инициализации xterm', err);
      return;
    }

    // Resize обработка
    const handleResize = () => {
      try {
        term?.resize(
          Math.floor(termRef.current?.offsetWidth ? termRef.current.offsetWidth / 9 : 80),
          Math.floor(termRef.current?.offsetHeight ? termRef.current.offsetHeight / 20 : 24)
        );
      } catch (err) {
        logError('Ошибка resize терминала', err);
      }
    };
    window.addEventListener('resize', handleResize);
    setTimeout(handleResize, 100);

    // WebSocket с авто-подключением
    const connectWS = () => {
      if (disposed) return;
  const ws = new WebSocket(`wss://ospab.host:5000/api/server/${id}/console`);
      wsRef.current = ws;

      ws.onopen = () => {
        reconnectAttempts.current = 0;
        term?.write('\x1b[32mПодключено к серверу\x1b[0m\r\n');
      };
      ws.onmessage = (event) => {
        try {
          term?.write(event.data);
        } catch (err) {
          logError('Ошибка вывода данных в терминал', err);
        }
      };
      ws.onclose = (event) => {
        logError('WebSocket закрыт', event);
        term?.write('\r\n\x1b[31mОтключено от сервера\x1b[0m\r\n');
        // Авто-подключение (до 5 попыток)
        if (!disposed && reconnectAttempts.current < 5) {
          reconnectAttempts.current++;
          setTimeout(connectWS, 1000 * reconnectAttempts.current);
        }
      };
      ws.onerror = (event) => {
        logError('WebSocket ошибка', event);
        term?.write('\r\n\x1b[31mОшибка соединения\x1b[0m\r\n');
      };

      term?.onData((data: string) => {
        try {
          if (ws.readyState === WebSocket.OPEN) {
            ws.send(data);
          }
        } catch (err) {
          logError('Ошибка отправки данных по WebSocket', err);
        }
      });
    };
    connectWS();

    return () => {
      disposed = true;
      try {
        wsRef.current?.close();
      } catch (err) {
        logError('Ошибка закрытия WebSocket', err);
      }
      try {
        term?.dispose();
      } catch (err) {
        logError('Ошибка dispose терминала', err);
      }
      window.removeEventListener('resize', handleResize);
    };
  }, [id]);

  return (
    <div className="bg-black rounded-xl p-2 w-full h-[500px]">
      <div ref={termRef} style={{ width: '100%', height: '100%' }} />
    </div>
  );
};

export default ServerConsole;
