-- CreateTable
CREATE TABLE `users` (
    `id` VARCHAR(191) NOT NULL,
    `nome` VARCHAR(191) NOT NULL,
    `email` VARCHAR(191) NOT NULL,
    `senha` VARCHAR(191) NOT NULL,
    `ativo` BOOLEAN NOT NULL DEFAULT true,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updatedAt` DATETIME(3) NOT NULL,

    UNIQUE INDEX `users_email_key`(`email`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `turbinas` (
    `id` VARCHAR(191) NOT NULL,
    `nome` VARCHAR(191) NOT NULL,
    `codigo` VARCHAR(191) NOT NULL,
    `fabricante` VARCHAR(191) NOT NULL,
    `modelo` VARCHAR(191) NOT NULL,
    `potencia` DOUBLE NOT NULL,
    `dataInstalacao` DATETIME(3) NOT NULL,
    `dataFabricacao` DATETIME(3) NOT NULL,
    `status` ENUM('ATIVA', 'INATIVA', 'MANUTENCAO') NOT NULL DEFAULT 'ATIVA',
    `observacoes` TEXT NULL,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updatedAt` DATETIME(3) NOT NULL,

    UNIQUE INDEX `turbinas_codigo_key`(`codigo`),
    INDEX `turbinas_status_idx`(`status`),
    INDEX `turbinas_codigo_idx`(`codigo`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `pas` (
    `id` VARCHAR(191) NOT NULL,
    `turbinaId` VARCHAR(191) NOT NULL,
    `ordem` INTEGER NOT NULL,
    `codigo` VARCHAR(191) NOT NULL,
    `modelo` VARCHAR(191) NOT NULL,
    `dataUltimaAnalise` DATETIME(3) NULL,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updatedAt` DATETIME(3) NOT NULL,

    UNIQUE INDEX `pas_turbinaId_ordem_key`(`turbinaId`, `ordem`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `analises` (
    `id` VARCHAR(191) NOT NULL,
    `turbinaId` VARCHAR(191) NOT NULL,
    `titulo` VARCHAR(191) NOT NULL,
    `status` ENUM('PENDENTE', 'EM_ANDAMENTO', 'CONCLUIDA', 'CANCELADA') NOT NULL DEFAULT 'PENDENTE',
    `responsavel` VARCHAR(191) NOT NULL,
    `dataAnalise` DATETIME(3) NOT NULL,
    `observacoes` TEXT NULL,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updatedAt` DATETIME(3) NOT NULL,

    INDEX `analises_turbinaId_idx`(`turbinaId`),
    INDEX `analises_status_idx`(`status`),
    INDEX `analises_dataAnalise_idx`(`dataAnalise`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `ocorrencias` (
    `id` VARCHAR(191) NOT NULL,
    `analiseId` VARCHAR(191) NOT NULL,
    `paId` VARCHAR(191) NOT NULL,
    `tipo` VARCHAR(191) NOT NULL,
    `descricaoOutras` TEXT NULL,
    `gravidade` INTEGER NOT NULL,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updatedAt` DATETIME(3) NOT NULL,

    INDEX `ocorrencias_analiseId_idx`(`analiseId`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- AddForeignKey
ALTER TABLE `pas` ADD CONSTRAINT `pas_turbinaId_fkey` FOREIGN KEY (`turbinaId`) REFERENCES `turbinas`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `analises` ADD CONSTRAINT `analises_turbinaId_fkey` FOREIGN KEY (`turbinaId`) REFERENCES `turbinas`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `ocorrencias` ADD CONSTRAINT `ocorrencias_analiseId_fkey` FOREIGN KEY (`analiseId`) REFERENCES `analises`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `ocorrencias` ADD CONSTRAINT `ocorrencias_paId_fkey` FOREIGN KEY (`paId`) REFERENCES `pas`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;
