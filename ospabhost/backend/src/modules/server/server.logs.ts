import axios from 'axios';
import dotenv from 'dotenv';

dotenv.config();

const PROXMOX_API_URL = process.env.PROXMOX_API_URL;
const PROXMOX_TOKEN_ID = process.env.PROXMOX_TOKEN_ID;
const PROXMOX_TOKEN_SECRET = process.env.PROXMOX_TOKEN_SECRET;
const PROXMOX_NODE = process.env.PROXMOX_NODE || 'proxmox';

function getProxmoxHeaders(): Record<string, string> {
  return {
    'Authorization': `PVEAPIToken=${PROXMOX_TOKEN_ID}=${PROXMOX_TOKEN_SECRET}`,
    'Content-Type': 'application/json'
  };
}

/**
 * Получение логов контейнера LXC
 * @param vmid - ID контейнера
 * @param lines - количество строк логов (по умолчанию 100)
 * @returns объект с логами или ошибкой
 */
export async function getContainerLogs(vmid: number, lines: number = 100) {
  try {
    // Получаем логи через Proxmox API
    // Используем журнал systemd для LXC контейнеров
    const response = await axios.get(
      `${PROXMOX_API_URL}/nodes/${PROXMOX_NODE}/lxc/${vmid}/log?limit=${lines}`,
      { headers: getProxmoxHeaders() }
    );

    const logs = response.data?.data || [];
    
    // Форматируем логи для удобного отображения
    const formattedLogs = logs.map((log: { n: number; t: string }) => ({
      line: log.n,
      text: log.t,
      timestamp: new Date().toISOString() // Proxmox не всегда возвращает timestamp
    }));

    return {
      status: 'success',
      logs: formattedLogs,
      total: formattedLogs.length
    };
  } catch (error: any) {
    console.error('Ошибка получения логов контейнера:', error);
    
    // Если API не поддерживает /log, пробуем альтернативный способ
    if (error.response?.status === 400 || error.response?.status === 501) {
      return getContainerSystemLogs(vmid, lines);
    }
    
    return {
      status: 'error',
      message: error.response?.data?.errors || error.message,
      logs: []
    };
  }
}

/**
 * Альтернативный метод получения логов через exec команды
 */
async function getContainerSystemLogs(vmid: number, lines: number = 100) {
  try {
    // Выполняем команду для получения логов из контейнера
    const response = await axios.post(
      `${PROXMOX_API_URL}/nodes/${PROXMOX_NODE}/lxc/${vmid}/status/exec`,
      {
        command: `/bin/journalctl -n ${lines} --no-pager || tail -n ${lines} /var/log/syslog || echo "Логи недоступны"`
      },
      { headers: getProxmoxHeaders() }
    );

    // Получаем результат выполнения команды
    if (response.data?.data) {
      const taskId = response.data.data;
      
      // Ждем завершения задачи и получаем вывод
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      const outputResponse = await axios.get(
        `${PROXMOX_API_URL}/nodes/${PROXMOX_NODE}/tasks/${taskId}/log`,
        { headers: getProxmoxHeaders() }
      );

      const output = outputResponse.data?.data || [];
      const formattedLogs = output.map((log: { n: number; t: string }, index: number) => ({
        line: index + 1,
        text: log.t || log,
        timestamp: new Date().toISOString()
      }));

      return {
        status: 'success',
        logs: formattedLogs,
        total: formattedLogs.length
      };
    }

    return {
      status: 'error',
      message: 'Не удалось получить логи',
      logs: []
    };
  } catch (error: any) {
    console.error('Ошибка получения системных логов:', error);
    return {
      status: 'error',
      message: error.response?.data?.errors || error.message,
      logs: []
    };
  }
}

/**
 * Получение последних действий/событий контейнера
 */
export async function getContainerEvents(vmid: number) {
  try {
    const response = await axios.get(
      `${PROXMOX_API_URL}/cluster/tasks?vmid=${vmid}`,
      { headers: getProxmoxHeaders() }
    );

    const tasks = response.data?.data || [];
    
    // Форматируем события
    const events = tasks.slice(0, 50).map((task: any) => ({
      type: task.type,
      status: task.status,
      starttime: new Date(task.starttime * 1000).toLocaleString(),
      endtime: task.endtime ? new Date(task.endtime * 1000).toLocaleString() : 'В процессе',
      user: task.user,
      node: task.node,
      id: task.upid
    }));

    return {
      status: 'success',
      events
    };
  } catch (error: any) {
    console.error('Ошибка получения событий контейнера:', error);
    return {
      status: 'error',
      message: error.response?.data?.errors || error.message,
      events: []
    };
  }
}
