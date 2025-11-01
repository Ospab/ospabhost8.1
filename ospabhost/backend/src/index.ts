import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import authRoutes from './modules/auth/auth.routes';
import ticketRoutes from './modules/ticket/ticket.routes';
import checkRoutes from './modules/check/check.routes';
import proxmoxRoutes from '../proxmox/proxmox.routes';
import tariffRoutes from './modules/tariff';
import osRoutes from './modules/os';
import serverRoutes from './modules/server';

dotenv.config();

const app = express();

app.use(cors({
  origin: [
    'http://localhost:3000',
    'http://localhost:5173',
    'https://ospab.host'
  ],
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization']
}));

app.use(express.json());

app.use((req, res, next) => {
  console.log(`${new Date().toISOString()} - ${req.method} ${req.path}`);
  next();
});

import { checkProxmoxConnection } from './modules/server/proxmoxApi';

app.get('/', async (req, res) => {
  let proxmoxStatus;
  try {
    proxmoxStatus = await checkProxmoxConnection();
  } catch (err) {
    proxmoxStatus = { status: 'fail', message: 'Ошибка проверки Proxmox', error: err };
  }

  res.json({
    message: 'Сервер ospab.host запущен!',
    timestamp: new Date().toISOString(),
    port: PORT,
    database: process.env.DATABASE_URL ? 'подключена' : 'НЕ НАСТРОЕНА',
    proxmox: proxmoxStatus
  });
});

// ==================== SITEMAP ====================
app.get('/sitemap.xml', (req, res) => {
  const baseUrl = 'https://ospab.host';
  
  const staticPages = [
    { loc: '/', priority: '1.0', changefreq: 'weekly' },
    { loc: '/about', priority: '0.9', changefreq: 'monthly' },
    { loc: '/tariffs', priority: '0.95', changefreq: 'weekly' },
    { loc: '/login', priority: '0.7', changefreq: 'monthly' },
    { loc: '/register', priority: '0.8', changefreq: 'monthly' },
    { loc: '/terms', priority: '0.5', changefreq: 'yearly' },
    { loc: '/privacy', priority: '0.5', changefreq: 'yearly' },
  ];

  let xml = '<?xml version="1.0" encoding="UTF-8"?>\n';
  xml += '<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n';

  for (const page of staticPages) {
    xml += '  <url>\n';
    xml += `    <loc>${baseUrl}${page.loc}</loc>\n`;
    xml += `    <priority>${page.priority}</priority>\n`;
    xml += `    <changefreq>${page.changefreq}</changefreq>\n`;
    xml += '  </url>\n';
  }

  xml += '</urlset>';

  res.header('Content-Type', 'application/xml');
  res.send(xml);
});

// ==================== ROBOTS.TXT ====================
app.get('/robots.txt', (req, res) => {
  const robots = `User-agent: *
Allow: /
Allow: /about
Allow: /tariffs
Allow: /login
Allow: /register
Allow: /terms

Disallow: /dashboard
Disallow: /api/
Disallow: /admin
Disallow: /private

Sitemap: https://ospab.host/sitemap.xml

# Google
User-agent: Googlebot
Allow: /
Crawl-delay: 0

# Yandex
User-agent: Yandexbot
Allow: /
Crawl-delay: 0`;

  res.header('Content-Type', 'text/plain; charset=utf-8');
  res.send(robots);
});

import path from 'path';
app.use('/uploads/checks', express.static(path.join(__dirname, '../uploads/checks')));

app.use('/api/auth', authRoutes);
app.use('/api/ticket', ticketRoutes);
app.use('/api/check', checkRoutes);
app.use('/api/proxmox', proxmoxRoutes);
app.use('/api/tariff', tariffRoutes);
app.use('/api/os', osRoutes);
app.use('/api/server', serverRoutes);

const PORT = process.env.PORT || 5000;

import { setupConsoleWSS } from './modules/server/server.console';
import https from 'https';
import fs from 'fs';

// ИСПРАВЛЕНО: используйте fullchain сертификат
const sslOptions = {
  key: fs.readFileSync('/etc/apache2/ssl/ospab.host.key'),
  cert: fs.readFileSync('/etc/apache2/ssl/ospab.host.fullchain.crt'),
};

const httpsServer = https.createServer(sslOptions, app);
setupConsoleWSS(httpsServer);

httpsServer.listen(PORT, () => {
  console.log(`🚀 HTTPS сервер запущен на порту ${PORT}`);
  console.log(`📊 База данных: ${process.env.DATABASE_URL ? 'подключена' : 'НЕ НАСТРОЕНА'}`);
  console.log(`📍 Sitemap доступен: https://ospab.host:${PORT}/sitemap.xml`);
  console.log(`🤖 Robots.txt доступен: https://ospab.host:${PORT}/robots.txt`);
});