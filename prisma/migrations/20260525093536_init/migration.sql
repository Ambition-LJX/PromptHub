-- CreateTable
CREATE TABLE `User` (
    `id` VARCHAR(36) NOT NULL PRIMARY KEY,
    `username` VARCHAR(191) NOT NULL,
    `email` VARCHAR(191) NOT NULL,
    `password` VARCHAR(255) NOT NULL,
    `role` ENUM('ADMIN', 'USER') NOT NULL DEFAULT 'USER',
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updatedAt` DATETIME(3) NOT NULL,
    UNIQUE INDEX `User_username_key`(`username`),
    UNIQUE INDEX `User_email_key`(`email`),
    INDEX `User_email_idx`(`email`),
    INDEX `User_username_idx`(`username`)
) DEFAULT CHARSET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `Team` (
    `id` VARCHAR(36) NOT NULL PRIMARY KEY,
    `name` VARCHAR(191) NOT NULL,
    `description` TEXT,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updatedAt` DATETIME(3) NOT NULL,
    INDEX `Team_name_idx`(`name`)
) DEFAULT CHARSET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `TeamMember` (
    `id` VARCHAR(36) NOT NULL PRIMARY KEY,
    `userId` VARCHAR(36) NOT NULL,
    `teamId` VARCHAR(36) NOT NULL,
    `role` ENUM('OWNER', 'MEMBER') NOT NULL DEFAULT 'MEMBER',
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    UNIQUE INDEX `TeamMember_userId_teamId_key`(`userId`, `teamId`),
    INDEX `TeamMember_teamId_idx`(`teamId`),
    INDEX `TeamMember_userId_idx`(`userId`),
    CONSTRAINT `TeamMember_userId_fkey` FOREIGN KEY (`userId`) REFERENCES `User` (`id`) ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT `TeamMember_teamId_fkey` FOREIGN KEY (`teamId`) REFERENCES `Team` (`id`) ON DELETE CASCADE ON UPDATE CASCADE
) DEFAULT CHARSET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `Prompt` (
    `id` VARCHAR(36) NOT NULL PRIMARY KEY,
    `title` VARCHAR(191) NOT NULL,
    `content` TEXT NOT NULL,
    `description` TEXT,
    `language` VARCHAR(255) NOT NULL DEFAULT '[]',
    `role` VARCHAR(255) NOT NULL DEFAULT '[]',
    `stage` VARCHAR(255) NOT NULL DEFAULT '[]',
    `tags` VARCHAR(255) NOT NULL DEFAULT '[]',
    `isFavorite` BOOLEAN NOT NULL DEFAULT false,
    `versions` VARCHAR(255) NOT NULL DEFAULT '[]',
    `visibility` ENUM('PRIVATE', 'TEAM', 'SHARED') NOT NULL DEFAULT 'PRIVATE',
    `userId` VARCHAR(36) NOT NULL,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updatedAt` DATETIME(3) NOT NULL,
    INDEX `Prompt_userId_idx`(`userId`),
    INDEX `Prompt_isFavorite_idx`(`isFavorite`),
    INDEX `Prompt_updatedAt_idx`(`updatedAt`),
    INDEX `Prompt_title_idx`(`title`),
    INDEX `Prompt_visibility_idx`(`visibility`),
    CONSTRAINT `Prompt_userId_fkey` FOREIGN KEY (`userId`) REFERENCES `User` (`id`) ON DELETE CASCADE ON UPDATE CASCADE
) DEFAULT CHARSET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `ProjectTemplate` (
    `id` VARCHAR(36) NOT NULL PRIMARY KEY,
    `name` VARCHAR(191) NOT NULL,
    `description` TEXT,
    `stages` VARCHAR(500) NOT NULL DEFAULT '[]',
    `visibility` ENUM('PRIVATE', 'TEAM', 'SHARED') NOT NULL DEFAULT 'PRIVATE',
    `userId` VARCHAR(36) NOT NULL,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updatedAt` DATETIME(3) NOT NULL,
    INDEX `ProjectTemplate_userId_idx`(`userId`),
    INDEX `ProjectTemplate_visibility_idx`(`visibility`),
    CONSTRAINT `ProjectTemplate_userId_fkey` FOREIGN KEY (`userId`) REFERENCES `User` (`id`) ON DELETE CASCADE ON UPDATE CASCADE
) DEFAULT CHARSET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `ProjectStage` (
    `id` VARCHAR(36) NOT NULL PRIMARY KEY,
    `projectTemplateId` VARCHAR(36) NOT NULL,
    `name` VARCHAR(191) NOT NULL,
    `order` INT NOT NULL,
    `promptIds` VARCHAR(500) NOT NULL DEFAULT '[]',
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updatedAt` DATETIME(3) NOT NULL,
    `primaryPromptId` VARCHAR(36),
    INDEX `ProjectStage_projectTemplateId_idx`(`projectTemplateId`),
    INDEX `ProjectStage_order_idx`(`order`),
    CONSTRAINT `ProjectStage_projectTemplateId_fkey` FOREIGN KEY (`projectTemplateId`) REFERENCES `ProjectTemplate` (`id`) ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT `ProjectStage_primaryPromptId_fkey` FOREIGN KEY (`primaryPromptId`) REFERENCES `Prompt` (`id`) ON DELETE SET NULL ON UPDATE CASCADE
) DEFAULT CHARSET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `Workspace` (
    `id` VARCHAR(36) NOT NULL PRIMARY KEY,
    `name` VARCHAR(191) NOT NULL,
    `description` TEXT,
    `visibility` ENUM('PRIVATE', 'TEAM', 'SHARED') NOT NULL DEFAULT 'PRIVATE',
    `userId` VARCHAR(36) NOT NULL,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updatedAt` DATETIME(3) NOT NULL,
    INDEX `Workspace_userId_idx`(`userId`),
    INDEX `Workspace_visibility_idx`(`visibility`),
    CONSTRAINT `Workspace_userId_fkey` FOREIGN KEY (`userId`) REFERENCES `User` (`id`) ON DELETE CASCADE ON UPDATE CASCADE
) DEFAULT CHARSET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `WorkspacePrompt` (
    `id` VARCHAR(36) NOT NULL PRIMARY KEY,
    `workspaceId` VARCHAR(36) NOT NULL,
    `promptId` VARCHAR(36) NOT NULL,
    `order` INT NOT NULL DEFAULT 0,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    UNIQUE INDEX `WorkspacePrompt_workspaceId_promptId_key`(`workspaceId`, `promptId`),
    INDEX `WorkspacePrompt_workspaceId_idx`(`workspaceId`),
    INDEX `WorkspacePrompt_promptId_idx`(`promptId`),
    CONSTRAINT `WorkspacePrompt_workspaceId_fkey` FOREIGN KEY (`workspaceId`) REFERENCES `Workspace` (`id`) ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT `WorkspacePrompt_promptId_fkey` FOREIGN KEY (`promptId`) REFERENCES `Prompt` (`id`) ON DELETE CASCADE ON UPDATE CASCADE
) DEFAULT CHARSET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `PromptAccess` (
    `id` VARCHAR(36) NOT NULL PRIMARY KEY,
    `promptId` VARCHAR(36) NOT NULL,
    `teamId` VARCHAR(36) NOT NULL,
    `canEdit` BOOLEAN NOT NULL DEFAULT false,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    UNIQUE INDEX `PromptAccess_promptId_teamId_key`(`promptId`, `teamId`),
    INDEX `PromptAccess_teamId_idx`(`teamId`),
    CONSTRAINT `PromptAccess_promptId_fkey` FOREIGN KEY (`promptId`) REFERENCES `Prompt` (`id`) ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT `PromptAccess_teamId_fkey` FOREIGN KEY (`teamId`) REFERENCES `Team` (`id`) ON DELETE CASCADE ON UPDATE CASCADE
) DEFAULT CHARSET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `WorkspaceAccess` (
    `id` VARCHAR(36) NOT NULL PRIMARY KEY,
    `workspaceId` VARCHAR(36) NOT NULL,
    `teamId` VARCHAR(36) NOT NULL,
    `canEdit` BOOLEAN NOT NULL DEFAULT false,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    UNIQUE INDEX `WorkspaceAccess_workspaceId_teamId_key`(`workspaceId`, `teamId`),
    INDEX `WorkspaceAccess_teamId_idx`(`teamId`),
    CONSTRAINT `WorkspaceAccess_workspaceId_fkey` FOREIGN KEY (`workspaceId`) REFERENCES `Workspace` (`id`) ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT `WorkspaceAccess_teamId_fkey` FOREIGN KEY (`teamId`) REFERENCES `Team` (`id`) ON DELETE CASCADE ON UPDATE CASCADE
) DEFAULT CHARSET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `ProjectAccess` (
    `id` VARCHAR(36) NOT NULL PRIMARY KEY,
    `projectTemplateId` VARCHAR(36) NOT NULL,
    `teamId` VARCHAR(36) NOT NULL,
    `canEdit` BOOLEAN NOT NULL DEFAULT false,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    UNIQUE INDEX `ProjectAccess_projectTemplateId_teamId_key`(`projectTemplateId`, `teamId`),
    INDEX `ProjectAccess_teamId_idx`(`teamId`),
    CONSTRAINT `ProjectAccess_projectTemplateId_fkey` FOREIGN KEY (`projectTemplateId`) REFERENCES `ProjectTemplate` (`id`) ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT `ProjectAccess_teamId_fkey` FOREIGN KEY (`teamId`) REFERENCES `Team` (`id`) ON DELETE CASCADE ON UPDATE CASCADE
) DEFAULT CHARSET utf8mb4 COLLATE utf8mb4_unicode_ci;
