import { Server as WebSocketServer, WebSocket } from 'ws';
import { Client as SSHClient } from 'ssh2';
import dotenv from 'dotenv';
import { IncomingMessage } from 'http';
import { Server as HttpServer } from 'http';
dotenv.config();

export function setupConsoleWSS(server: HttpServer) {
  const wss = new WebSocketServer({ noServer: true });

  wss.on('connection', (ws: WebSocket, req: IncomingMessage) => {
    const url = req.url || '';
    const match = url.match(/\/api\/server\/(\d+)\/console/);
    const vmid = match ? match[1] : null;
    if (!vmid) {
      ws.close();
      return;
    }

    // Получаем IP и root-пароль из БД (упрощённо)
    // Здесь можно добавить реальный запрос к Prisma
  const host = process.env.PROXMOX_IP || process.env.PROXMOX_NODE;
    const username = 'root';
    const password = process.env.PROXMOX_ROOT_PASSWORD;

    const ssh = new SSHClient();
    const port = process.env.PROXMOX_SSH_PORT ? Number(process.env.PROXMOX_SSH_PORT) : 22;
    ssh.on('ready', () => {
      ssh.shell((err: Error | undefined, stream: any) => {
        if (err) {
          ws.send('Ошибка запуска shell: ' + err.message);
          ws.close();
          ssh.end();
          return;
        }
        ws.on('message', (msg: string | Buffer) => {
          stream.write(msg.toString());
        });
        stream.on('data', (data: Buffer) => {
          ws.send(data.toString());
        });
        stream.on('close', () => {
          ws.close();
          ssh.end();
        });
      });
    }).connect({
      host,
      port,
      username,
      password,
      hostVerifier: (hash: string) => {
        console.log('SSH fingerprint:', hash);
        return true; // всегда принимаем fingerprint
      }
    });

    ws.on('close', () => {
      ssh.end();
    });
  });

  server.on('upgrade', (request: IncomingMessage, socket: any, head: Buffer) => {
    if (request.url?.startsWith('/api/server/') && request.url?.endsWith('/console')) {
      wss.handleUpgrade(request, socket, head, (ws: WebSocket) => {
        wss.emit('connection', ws, request);
      });
    }
  });
}
