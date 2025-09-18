import axios from 'axios';
import dotenv from 'dotenv';
dotenv.config();

const PROXMOX_API_URL = process.env.PROXMOX_API_URL;
const PROXMOX_TOKEN_ID = process.env.PROXMOX_TOKEN_ID;
const PROXMOX_TOKEN_SECRET = process.env.PROXMOX_TOKEN_SECRET;

export async function createProxmoxContainer({ os, tariff, user }: any) {
  try {
    const node = process.env.PROXMOX_NODE;
    const diskTemplate = process.env.PROXMOX_DISK_TEMPLATE;
    if (!node || !diskTemplate) {
      return { status: 'fail', message: 'Не указаны PROXMOX_NODE или PROXMOX_DISK_TEMPLATE в .env' };
    }
    const vmId = Math.floor(10000 + Math.random() * 89999);
    const res = await axios.post(
      `${PROXMOX_API_URL}/nodes/${node}/qemu`,
      {
        vmid: vmId,
        name: `user${user.id}-vm${vmId}`,
        ostype: os.code || 'l26',
        cores: tariff.cores || 2,
        memory: tariff.memory || 2048,
        storage: diskTemplate,
      },
      {
        headers: {
          'Authorization': `PVEAPIToken=${PROXMOX_TOKEN_ID}=${PROXMOX_TOKEN_SECRET}`,
          'Content-Type': 'application/json'
        }
      }
    );
    if (res.data && res.data.data) {
      return { status: 'ok', proxmoxId: vmId, message: 'Сервер создан на Proxmox', proxmox: res.data.data };
    }
    return { status: 'fail', message: 'Не удалось создать сервер на Proxmox', details: res.data };
  } catch (err) {
    return { status: 'fail', message: 'Ошибка создания сервера на Proxmox', error: err };
  }
}

export async function checkProxmoxConnection() {
  try {
    const res = await axios.get(
      `${PROXMOX_API_URL}/version`,
      {
        headers: {
          'Authorization': `PVEAPIToken=${PROXMOX_TOKEN_ID}=${PROXMOX_TOKEN_SECRET}`
        }
      }
    );
    if (res.data && res.data.data) {
      return { status: 'ok', message: 'Соединение с Proxmox установлено', version: res.data.data.version };
    }
    return { status: 'fail', message: 'Не удалось получить версию Proxmox' };
  } catch (err) {
    return { status: 'fail', message: 'Ошибка соединения с Proxmox', error: err };
  }
}
