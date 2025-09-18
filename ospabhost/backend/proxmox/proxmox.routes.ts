import { Router } from 'express';
import { createContainer } from './proxmoxApi';

const router = Router();


// Маршрут для создания контейнера
router.post('/container', async (req, res) => {
  try {
    const { vmid, hostname, password, ostemplate, storage, cores, memory, rootfsSize } = req.body;
    const result = await createContainer({ vmid, hostname, password, ostemplate, storage, cores, memory, rootfsSize });
    res.json(result);
  } catch (err) {
    res.status(500).json({ error: err instanceof Error ? err.message : err });
  }
});

export default router;
