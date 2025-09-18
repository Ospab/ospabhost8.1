import { checkProxmoxConnection } from './modules/server/proxmoxApi';

(async () => {
  const result = await checkProxmoxConnection();
  console.log('Проверка соединения с Proxmox:', result);
})();
