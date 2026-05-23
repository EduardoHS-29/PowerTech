-- AlterTable
ALTER TABLE `turbinas` ADD COLUMN `dataFabricacao` DATETIME(3) NULL;

-- CreateTable
CREATE TABLE `pas` (
    `id` VARCHAR(191) NOT NULL,
    `turbinaId` VARCHAR(191) NOT NULL,
    `ordem` INTEGER NOT NULL,
    `codigo` VARCHAR(191) NOT NULL,
    `modelo` VARCHAR(191) NOT NULL,
    `dataUltimaAnalise` DATETIME(3) NULL,
    `status` ENUM('ATIVA', 'INATIVA', 'SUBSTITUIDA') NOT NULL DEFAULT 'ATIVA',
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updatedAt` DATETIME(3) NOT NULL,

    UNIQUE INDEX `pas_turbinaId_ordem_key`(`turbinaId`, `ordem`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- AddForeignKey
ALTER TABLE `pas` ADD CONSTRAINT `pas_turbinaId_fkey` FOREIGN KEY (`turbinaId`) REFERENCES `turbinas`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;
