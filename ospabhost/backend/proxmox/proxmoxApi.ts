import axios from 'axios';
import dotenv from 'dotenv';
dotenv.config();

const PROXMOX_API = `https://${process.env.PROXMOX_HOST}:${process.env.PROXMOX_PORT}/api2/json`;

function getProxmoxHeaders() {
  return {
    Authorization: `PVEAPIToken=${process.env.PROXMOX_API_TOKEN_ID}=${process.env.PROXMOX_API_TOKEN_SECRET}`,
  };
}

// Создание контейнера (LXC) из шаблона
export interface CreateContainerParams {
  vmid: number;
  hostname: string;
  password: string;
  ostemplate: string;
  storage: string;
  cores: number;
  memory: number;
  rootfsSize: number;
}

export async function createContainer({ vmid, hostname, password, ostemplate, storage, cores, memory, rootfsSize }: CreateContainerParams) {
  const url = `${PROXMOX_API}/nodes/${process.env.PROXMOX_NODE}/lxc`;
  const data = {
    vmid,
    hostname,
    password,
    ostemplate, // например: 'local:vztmpl/ubuntu-22.04-standard_22.04-1_amd64.tar.zst'
    storage,    // например: 'local'
    cores,      // количество ядер
    memory,     // RAM в МБ
    rootfs: `${storage}:${rootfsSize}`, // например: 'local:8'
    net0: 'name=eth0,bridge=vmbr0,ip=dhcp',
    // Дополнительные параметры по необходимости
  };
  try {
    const res = await axios.post(url, data, { headers: getProxmoxHeaders() });
    return res.data;
  } catch (err) {
    throw new Error('Ошибка создания контейнера: ' + (err instanceof Error ? err.message : err));
  }
}

