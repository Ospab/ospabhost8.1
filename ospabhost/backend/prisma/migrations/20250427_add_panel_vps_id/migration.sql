-- Добавление полей для интеграции с VPS Panel
ALTER TABLE `server` ADD COLUMN `panelVpsId` INT,
                      ADD COLUMN `panelSyncStatus` VARCHAR(255) DEFAULT 'pending';

-- Создание индекса для быстрого поиска серверов по ID на панели
CREATE INDEX `idx_panelVpsId` ON `server`(`panelVpsId`);
