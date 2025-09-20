-- AlterTable
ALTER TABLE `server` ADD COLUMN `diskTemplate` VARCHAR(191) NULL,
    ADD COLUMN `node` VARCHAR(191) NULL,
    ADD COLUMN `proxmoxId` INTEGER NULL;
