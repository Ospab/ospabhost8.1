// Смена root-пароля через SSH (для LXC)
import { exec } from 'child_process';

export async function changeRootPasswordSSH(vmid: number): Promise<{ status: string; password?: string; message?: string }> {
  const newPassword = generateSecurePassword();
  return new Promise((resolve) => {
    exec(`ssh -o StrictHostKeyChecking=no root@${process.env.PROXMOX_NODE} pct set ${vmid} --password ${newPassword}`, (err, stdout, stderr) => {
      if (err) {
        console.error('Ошибка смены пароля через SSH:', stderr);
        resolve({ status: 'error', message: stderr });
      } else {
        resolve({ status: 'success', password: newPassword });
      }
    });
  });
}
import axios from 'axios';
import crypto from 'crypto';
import dotenv from 'dotenv';
import https from 'https';
dotenv.config();

const PROXMOX_API_URL = process.env.PROXMOX_API_URL;
const PROXMOX_TOKEN_ID = process.env.PROXMOX_TOKEN_ID;
const PROXMOX_TOKEN_SECRET = process.env.PROXMOX_TOKEN_SECRET;
const PROXMOX_NODE = process.env.PROXMOX_NODE || 'proxmox';
const PROXMOX_VM_STORAGE = process.env.PROXMOX_VM_STORAGE || 'local';
const PROXMOX_BACKUP_STORAGE = process.env.PROXMOX_BACKUP_STORAGE || 'local';
const PROXMOX_ISO_STORAGE = process.env.PROXMOX_ISO_STORAGE || 'local';
const PROXMOX_NETWORK_BRIDGE = process.env.PROXMOX_NETWORK_BRIDGE || 'vmbr0';

// HTTPS Agent с отключением проверки сертификата (для самоподписанного Proxmox)
const httpsAgent = new https.Agent({
  rejectUnauthorized: false,
  keepAlive: true,
  maxSockets: 50,
  maxFreeSockets: 10,
  timeout: 60000
});

function getProxmoxHeaders(): Record<string, string> {
  return {
    'Authorization': `PVEAPIToken=${PROXMOX_TOKEN_ID}=${PROXMOX_TOKEN_SECRET}`,
    'Content-Type': 'application/json'
  };
}

// Генерация случайного пароля
export function generateSecurePassword(length: number = 16): string {
  const charset = 'abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789!@#$%^&*';
  let password = '';
  for (let i = 0; i < length; i++) {
    password += charset.charAt(Math.floor(Math.random() * charset.length));
  }
  return password;
}

// Получение следующего доступного VMID
export async function getNextVMID(): Promise<number> {
  try {
    const res = await axios.get(
      `${PROXMOX_API_URL}/cluster/nextid`,
      { 
        headers: getProxmoxHeaders(),
        timeout: 15000, // 15 секунд
        httpsAgent
      }
    );
    return res.data.data || Math.floor(100 + Math.random() * 899);
  } catch (error) {
    console.error('Ошибка получения VMID:', error);
    return Math.floor(100 + Math.random() * 899);
  }
}

// Создание LXC контейнера
export interface CreateContainerParams {
  os: { template: string; type: string };
  tariff: { name: string; price: number; description?: string };
  user: { id: number; username: string; email?: string };
  hostname?: string;
}

export async function createLXContainer({ os, tariff, user }: CreateContainerParams) {
  let vmid: number = 0;
  let hostname: string = '';
  
  try {
    vmid = await getNextVMID();
    const rootPassword = generateSecurePassword();
    // Используем hostname из параметров, если есть
    hostname = arguments[0].hostname;
    if (!hostname) {
      if (user.email) {
        const emailName = user.email.split('@')[0];
        hostname = `${emailName}-${vmid}`;
      } else {
        hostname = `user${user.id}-${vmid}`;
      }
    }
    
    // Определяем ресурсы по названию тарифа (парсим описание)
    const description = tariff.description || '1 ядро, 1ГБ RAM, 20ГБ SSD';
    const cores = parseInt(description.match(/(\d+)\s*ядр/)?.[1] || '1');
    const memory = parseInt(description.match(/(\d+)ГБ\s*RAM/)?.[1] || '1') * 1024; // в MB
    const diskSize = parseInt(description.match(/(\d+)ГБ\s*SSD/)?.[1] || '20');
    
    const containerConfig = {
      vmid,
      hostname,
      password: rootPassword,
      ostemplate: os.template,
      cores,
      memory,
      rootfs: `${PROXMOX_VM_STORAGE}:${diskSize}`,
      net0: `name=eth0,bridge=${PROXMOX_NETWORK_BRIDGE},ip=dhcp`,
      unprivileged: 1,
      start: 1, // Автостарт после создания
      protection: 0,
      console: 1,
      cmode: 'console'
    };

    console.log('Создание LXC контейнера с параметрами:', containerConfig);

    // Валидация перед отправкой
    if (!containerConfig.ostemplate) {
      throw new Error('OS template не задан');
    }
    if (containerConfig.cores < 1 || containerConfig.cores > 32) {
      throw new Error(`Cores должно быть от 1 до 32, получено: ${containerConfig.cores}`);
    }
    if (containerConfig.memory < 512 || containerConfig.memory > 65536) {
      throw new Error(`Memory должно быть от 512 до 65536 MB, получено: ${containerConfig.memory}`);
    }

    // Детальное логирование перед отправкой
    console.log('URL Proxmox:', `${PROXMOX_API_URL}/nodes/${PROXMOX_NODE}/lxc`);
    console.log('Параметры контейнера (JSON):', JSON.stringify(containerConfig, null, 2));
    console.log('Storage для VM:', PROXMOX_VM_STORAGE);
    
    const response = await axios.post(
      `${PROXMOX_API_URL}/nodes/${PROXMOX_NODE}/lxc`,
      containerConfig,
      { 
        headers: getProxmoxHeaders(),
        timeout: 120000, // 2 минуты для создания контейнера
        httpsAgent
      }
    );
    
    console.log('Ответ от Proxmox (создание):', response.status, response.data);

    if (response.data?.data) {
      // Polling статуса контейнера до running или timeout
      let status = '';
      let attempts = 0;
      const maxAttempts = 10;
      while (attempts < maxAttempts) {
        await new Promise(resolve => setTimeout(resolve, 3000));
        const info = await getContainerStatus(vmid);
        status = info?.status || '';
        if (status === 'running' || status === 'stopped' || status === 'created') break;
        attempts++;
      }
      // Получаем IP адрес контейнера
      const ipAddress = await getContainerIP(vmid);
      return {
        status: 'success',
        vmid,
        rootPassword,
        ipAddress,
        hostname,
        taskId: response.data.data,
        containerStatus: status
      };
    }
// Получить статус контейнера по VMID
async function getContainerStatus(vmid: number): Promise<{ status: string }> {
  try {
    const res = await axios.get(
      `${PROXMOX_API_URL}/nodes/${PROXMOX_NODE}/lxc/${vmid}/status/current`,
      { 
        headers: getProxmoxHeaders(),
        httpsAgent
      }
    );
    return { status: res.data.data.status };
  } catch (error) {
    return { status: 'error' };
  }
}

    throw new Error('Не удалось создать контейнер');
  } catch (error: any) {
    console.error('❌ ОШИБКА создания LXC контейнера:', error.message);
    console.error('   Code:', error.code);
    console.error('   Status:', error.response?.status);
    console.error('   Response data:', error.response?.data);
    
    // Логируем контекст ошибки
    console.error('   VMID:', vmid);
    console.error('   Hostname:', hostname);
    console.error('   Storage используемый:', PROXMOX_VM_STORAGE);
    console.error('   OS Template:', os.template);
    
    // Специальная обработка socket hang up / ECONNRESET
    const isSocketError = error?.code === 'ECONNRESET' || 
                          error?.message?.includes('socket hang up') ||
                          error?.cause?.code === 'ECONNRESET';
    
    if (isSocketError) {
      console.error('\n⚠️ SOCKET HANG UP DETECTED!');
      console.error('   Возможные причины:');
      console.error('   1. Storage "' + PROXMOX_VM_STORAGE + '" не существует на Proxmox');
      console.error('   2. API токен неверный или истёк');
      console.error('   3. Proxmox перегружена или недоступна');
      console.error('   4. Firewall блокирует соединение\n');
    }
    
    const errorMessage = isSocketError 
      ? `Proxmox не ответил вовремя. Storage: ${PROXMOX_VM_STORAGE}. Проверьте доступность сервера и корректность конфигурации.`
      : error.response?.data?.errors || error.message;
    
    return {
      status: 'error',
      message: errorMessage,
      code: error?.code || error?.response?.status,
      isSocketError,
      storage: PROXMOX_VM_STORAGE
    };
  }
}

// Получение IP адреса контейнера
export async function getContainerIP(vmid: number): Promise<string | null> {
  try {
    await new Promise(resolve => setTimeout(resolve, 10000)); // Ждём запуска
    
    const response = await axios.get(
      `${PROXMOX_API_URL}/nodes/${PROXMOX_NODE}/lxc/${vmid}/interfaces`,
      { 
        headers: getProxmoxHeaders(),
        httpsAgent
      }
    );

    const interfaces = response.data?.data;
    if (interfaces && interfaces.length > 0) {
      // Сначала ищем локальный IP
      for (const iface of interfaces) {
        if (iface.inet && iface.inet !== '127.0.0.1') {
          const ip = iface.inet.split('/')[0];
          if (
            ip.startsWith('10.') ||
            ip.startsWith('192.168.') ||
            (/^172\.(1[6-9]|2[0-9]|3[01])\./.test(ip))
          ) {
            return ip;
          }
        }
      }
      // Если не нашли локальный, возвращаем первый не-127.0.0.1
      for (const iface of interfaces) {
        if (iface.inet && iface.inet !== '127.0.0.1') {
          return iface.inet.split('/')[0];
        }
      }
    }
    return null;
  } catch (error) {
    console.error('Ошибка получения IP:', error);
    return null;
  }
}

// Управление контейнером (старт/стоп/перезагрузка)
export async function controlContainer(vmid: number, action: 'start' | 'stop' | 'restart' | 'suspend' | 'resume') {
  try {
    const response = await axios.post(
      `${PROXMOX_API_URL}/nodes/${PROXMOX_NODE}/lxc/${vmid}/status/${action}`,
      {},
      { headers: getProxmoxHeaders() }
    );
    return {
      status: 'success',
      action,
      taskId: response.data?.data
    };
  } catch (error: any) {
    console.error(`Ошибка ${action} контейнера:`, error);
    return {
      status: 'error',
      message: error.response?.data?.errors || error.message
    };
  }
}

// Удаление контейнера
export async function deleteContainer(vmid: number) {
  try {
    const response = await axios.delete(
      `${PROXMOX_API_URL}/nodes/${PROXMOX_NODE}/lxc/${vmid}`,
      { headers: getProxmoxHeaders() }
    );
    return {
      status: 'success',
      taskId: response.data?.data
    };
  } catch (error: any) {
    console.error('Ошибка удаления контейнера:', error);
    return {
      status: 'error',
      message: error.response?.data?.errors || error.message
    };
  }
}

// Получение статистики контейнера
export async function getContainerStats(vmid: number) {
  try {
    // Получаем текущий статус
    const statusResponse = await axios.get(
      `${PROXMOX_API_URL}/nodes/${PROXMOX_NODE}/lxc/${vmid}/status/current`,
      { headers: getProxmoxHeaders() }
    );

    const status = statusResponse.data?.data;
    
    // Получаем статистику RRD (за последний час)
    let rrdData = [];
  let latest: any = {};
    try {
      const rrdResponse = await axios.get(
        `${PROXMOX_API_URL}/nodes/${PROXMOX_NODE}/lxc/${vmid}/rrd?timeframe=hour`,
        { headers: getProxmoxHeaders() }
      );
      rrdData = rrdResponse.data?.data || [];
      latest = rrdData[rrdData.length - 1] || {};
    } catch (err: any) {
      // Если ошибка 400, возвращаем пустую статистику, но не ошибку
      if (err?.response?.status === 400) {
        return {
          status: 'success',
          data: {
            vmid,
            status: status?.status || 'unknown',
            uptime: status?.uptime || 0,
            cpu: 0,
            memory: {
              used: status?.mem || 0,
              max: status?.maxmem || 0,
              usage: 0
            },
            disk: {
              used: status?.disk || 0,
              max: status?.maxdisk || 0,
              usage: 0
            },
            network: {
              in: 0,
              out: 0
            },
            rrdData: []
          }
        };
      } else {
        throw err;
      }
    }
    return {
      status: 'success',
      data: {
        vmid,
        status: status?.status || 'unknown',
        uptime: status?.uptime || 0,
        cpu: latest.cpu || 0,
        memory: {
          used: status?.mem || 0,
          max: status?.maxmem || 0,
          usage: status?.maxmem ? (status.mem / status.maxmem) * 100 : 0
        },
        disk: {
          used: status?.disk || 0,
          max: status?.maxdisk || 0,
          usage: status?.maxdisk ? (status.disk / status.maxdisk) * 100 : 0
        },
        network: {
          in: latest.netin || 0,
          out: latest.netout || 0
        },
        rrdData: rrdData.slice(-60) // Последние 60 точек для графиков
      }
    };
  } catch (error: any) {
    console.error('Ошибка получения статистики:', error);
    return {
      status: 'error',
      message: error.response?.data?.errors || error.message
    };
  }
}

// Смена root пароля
export async function changeRootPassword(vmid: number): Promise<{ status: string; password?: string; message?: string }> {
  try {
    const newPassword = generateSecurePassword();
    
    // Выполняем команду смены пароля в контейнере
    const response = await axios.post(
      `${PROXMOX_API_URL}/nodes/${PROXMOX_NODE}/lxc/${vmid}/status/exec`,
      {
        command: `echo 'root:${newPassword}' | chpasswd`
      },
      { headers: getProxmoxHeaders() }
    );

    return {
      status: 'success',
      password: newPassword
    };
  } catch (error: any) {
    console.error('Ошибка смены пароля:', error);
    return {
      status: 'error',
      message: error.response?.data?.errors || error.message
    };
  }
}

// Получение ссылки на noVNC консоль
export async function getConsoleURL(vmid: number): Promise<{ status: string; url?: string; message?: string }> {
  try {
    const response = await axios.post(
      `${PROXMOX_API_URL}/nodes/${PROXMOX_NODE}/lxc/${vmid}/vncproxy`,
      {
        websocket: 1
      },
      { headers: getProxmoxHeaders() }
    );

    const data = response.data?.data;
    if (data?.ticket && data?.port) {
      const consoleUrl = `${process.env.PROXMOX_WEB_URL}/?console=lxc&vmid=${vmid}&node=${PROXMOX_NODE}&resize=off&ticket=${data.ticket}&port=${data.port}`;
      
      return {
        status: 'success',
        url: consoleUrl
      };
    }

    throw new Error('Не удалось получить данные для консоли');
  } catch (error: any) {
    console.error('Ошибка получения консоли:', error);
    return {
      status: 'error',
      message: error.response?.data?.errors || error.message
    };
  }
}

// Валидация конфигурации контейнера
function validateContainerConfig(config: { cores?: number; memory?: number; rootfs?: string }) {
  const validated: { cores?: number; memory?: number; rootfs?: string } = {};
  
  // Валидация cores (1-32 ядра)
  if (config.cores !== undefined) {
    const cores = Number(config.cores);
    if (isNaN(cores) || cores < 1 || cores > 32) {
      throw new Error('Invalid cores value: must be between 1 and 32');
    }
    validated.cores = cores;
  }
  
  // Валидация memory (512MB - 64GB)
  if (config.memory !== undefined) {
    const memory = Number(config.memory);
    if (isNaN(memory) || memory < 512 || memory > 65536) {
      throw new Error('Invalid memory value: must be between 512 and 65536 MB');
    }
    validated.memory = memory;
  }
  
  // Валидация rootfs (формат: local:размер)
  if (config.rootfs !== undefined) {
    const match = config.rootfs.match(/^local:(\d+)$/);
    if (!match) {
      throw new Error('Invalid rootfs format: must be "local:SIZE"');
    }
    const size = Number(match[1]);
    if (size < 10 || size > 1000) {
      throw new Error('Invalid disk size: must be between 10 and 1000 GB');
    }
    validated.rootfs = config.rootfs;
  }
  
  return validated;
}

// Изменение конфигурации контейнера (CPU, RAM, Disk)
export async function resizeContainer(vmid: number, config: { cores?: number; memory?: number; rootfs?: string }) {
  try {
    const validatedConfig = validateContainerConfig(config);
    const response = await axios.put(
      `${PROXMOX_API_URL}/nodes/${PROXMOX_NODE}/lxc/${vmid}/config`,
      validatedConfig,
      { headers: getProxmoxHeaders() }
    );
    return {
      status: 'success',
      data: response.data?.data
    };
  } catch (error: any) {
    console.error('Ошибка изменения конфигурации:', error);
    return {
      status: 'error',
      message: error.response?.data?.errors || error.message
    };
  }
}

// Валидация имени снэпшота для предотвращения SSRF и path traversal
// SECURITY: Эта функция валидирует пользовательский ввод перед использованием в URL
// CodeQL может показывать предупреждение, но валидация является достаточной
function validateSnapshotName(snapname: string): string {
  // Разрешены только буквы, цифры, дефисы и подчеркивания
  const sanitized = snapname.replace(/[^a-zA-Z0-9_-]/g, '');
  if (sanitized.length === 0) {
    throw new Error('Invalid snapshot name');
  }
  // Ограничиваем длину для предотвращения DoS
  return sanitized.substring(0, 64);
}

// Создание снэпшота
export async function createSnapshot(vmid: number, snapname: string, description?: string) {
  try {
    const validSnapname = validateSnapshotName(snapname);
    const response = await axios.post(
      `${PROXMOX_API_URL}/nodes/${PROXMOX_NODE}/lxc/${vmid}/snapshot`,
      {
        snapname: validSnapname,
        description: description || `Snapshot ${validSnapname}`
      },
      { headers: getProxmoxHeaders() }
    );
    return {
      status: 'success',
      taskId: response.data?.data,
      snapname: validSnapname
    };
  } catch (error: any) {
    console.error('Ошибка создания снэпшота:', error);
    return {
      status: 'error',
      message: error.response?.data?.errors || error.message
    };
  }
}

// Получение списка снэпшотов
export async function listSnapshots(vmid: number) {
  try {
    const response = await axios.get(
      `${PROXMOX_API_URL}/nodes/${PROXMOX_NODE}/lxc/${vmid}/snapshot`,
      { headers: getProxmoxHeaders() }
    );
    return {
      status: 'success',
      data: response.data?.data || []
    };
  } catch (error: any) {
    console.error('Ошибка получения списка снэпшотов:', error);
    return {
      status: 'error',
      message: error.response?.data?.errors || error.message
    };
  }
}

// Восстановление из снэпшота
export async function rollbackSnapshot(vmid: number, snapname: string) {
  try {
    const validSnapname = validateSnapshotName(snapname);
    const response = await axios.post(
      `${PROXMOX_API_URL}/nodes/${PROXMOX_NODE}/lxc/${vmid}/snapshot/${validSnapname}/rollback`,
      {},
      { headers: getProxmoxHeaders() }
    );
    return {
      status: 'success',
      taskId: response.data?.data
    };
  } catch (error: any) {
    console.error('Ошибка восстановления снэпшота:', error);
    return {
      status: 'error',
      message: error.response?.data?.errors || error.message
    };
  }
}

// Удаление снэпшота
export async function deleteSnapshot(vmid: number, snapname: string) {
  try {
    const validSnapname = validateSnapshotName(snapname);
    const response = await axios.delete(
      `${PROXMOX_API_URL}/nodes/${PROXMOX_NODE}/lxc/${vmid}/snapshot/${validSnapname}`,
      { headers: getProxmoxHeaders() }
    );
    return {
      status: 'success',
      taskId: response.data?.data
    };
  } catch (error: any) {
    console.error('Ошибка удаления снэпшота:', error);
    return {
      status: 'error',
      message: error.response?.data?.errors || error.message
    };
  }
}

// Получение списка всех контейнеров
export async function listContainers() {
  try {
    const response = await axios.get(
      `${PROXMOX_API_URL}/nodes/${PROXMOX_NODE}/lxc`,
      { headers: getProxmoxHeaders() }
    );
    return {
      status: 'success',
      data: response.data?.data || []
    };
  } catch (error: any) {
    console.error('Ошибка получения списка контейнеров:', error);
    return {
      status: 'error',
      message: error.response?.data?.errors || error.message
    };
  }
}

// Получение списка доступных storage pools на узле
export async function getNodeStorages(node: string = PROXMOX_NODE) {
  try {
    const response = await axios.get(
      `${PROXMOX_API_URL}/nodes/${node}/storage`,
      { 
        headers: getProxmoxHeaders(),
        timeout: 15000,
        httpsAgent
      }
    );
    return {
      status: 'success',
      data: response.data?.data || []
    };
  } catch (error: any) {
    console.error('Ошибка получения storage:', error.message);
    return {
      status: 'error',
      message: error.response?.data?.errors || error.message
    };
  }
}

// Проверка соединения с Proxmox
export async function checkProxmoxConnection() {
  try {
    const response = await axios.get(
      `${PROXMOX_API_URL}/version`,
      { 
        headers: getProxmoxHeaders(),
        httpsAgent
      }
    );
    
    if (response.data?.data) {
      return { 
        status: 'success', 
        message: 'Соединение с Proxmox установлено', 
        version: response.data.data.version,
        node: PROXMOX_NODE
      };
    }
    return { status: 'error', message: 'Не удалось получить версию Proxmox' };
  } catch (error: any) {
    return { 
      status: 'error', 
      message: 'Ошибка соединения с Proxmox', 
      error: error.response?.data || error.message 
    };
  }
}

// Получение конфигурации storage через файл (обходим API если он недоступен)
export async function getStorageConfig(): Promise<{
  configured: string;
  available: string[];
  note: string;
}> {
  return {
    configured: PROXMOX_VM_STORAGE,
    available: ['local', 'local-lvm', 'vm-storage'],
    note: `Текущее использование: ${PROXMOX_VM_STORAGE}. Если хранилище недоступно или socket hang up, проверьте что это имя существует в Proxmox (pvesm status)`
  };
}

