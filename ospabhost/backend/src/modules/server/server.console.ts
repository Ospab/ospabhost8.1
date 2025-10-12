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


    // Получаем параметры SSH из .env
    const host = process.env.SSH_HOST || process.env.PROXMOX_IP || process.env.PROXMOX_NODE;
    const port = process.env.SSH_PORT ? Number(process.env.SSH_PORT) : (process.env.PROXMOX_SSH_PORT ? Number(process.env.PROXMOX_SSH_PORT) : 22);
    const username = process.env.SSH_USER || 'root';
    let password = process.env.SSH_PASSWORD || process.env.PROXMOX_ROOT_PASSWORD;
    if (password && password.startsWith('"') && password.endsWith('"')) {
      password = password.slice(1, -1);
    }
    const privateKeyPath = process.env.SSH_PRIVATE_KEY_PATH;
    let privateKey: Buffer | undefined = undefined;
    if (privateKeyPath) {
      try {
        privateKey = require('fs').readFileSync(privateKeyPath);
      } catch (e) {
        console.error('Ошибка чтения SSH ключа:', e);
      }
    }

    const ssh = new SSHClient();
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
      password: privateKey ? undefined : password,
      privateKey,
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
