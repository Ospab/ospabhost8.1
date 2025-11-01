import { Router } from 'express';
import { generateSitemap } from './sitemap.controller';

const router = Router();

router.get('/sitemap.xml', generateSitemap);

export default router;