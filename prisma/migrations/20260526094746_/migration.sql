/*
  Warnings:

  - The primary key for the `projectaccess` table will be changed. If it partially fails, the table could be left without primary key constraint.
  - The primary key for the `projectstage` table will be changed. If it partially fails, the table could be left without primary key constraint.
  - The primary key for the `projecttemplate` table will be changed. If it partially fails, the table could be left without primary key constraint.
  - The primary key for the `prompt` table will be changed. If it partially fails, the table could be left without primary key constraint.
  - The primary key for the `promptaccess` table will be changed. If it partially fails, the table could be left without primary key constraint.
  - The primary key for the `team` table will be changed. If it partially fails, the table could be left without primary key constraint.
  - The primary key for the `teammember` table will be changed. If it partially fails, the table could be left without primary key constraint.
  - The primary key for the `user` table will be changed. If it partially fails, the table could be left without primary key constraint.
  - You are about to alter the column `password` on the `user` table. The data in that column could be lost. The data in that column will be cast from `VarChar(255)` to `VarChar(191)`.
  - The primary key for the `workspace` table will be changed. If it partially fails, the table could be left without primary key constraint.
  - The primary key for the `workspaceaccess` table will be changed. If it partially fails, the table could be left without primary key constraint.
  - The primary key for the `workspaceprompt` table will be changed. If it partially fails, the table could be left without primary key constraint.

*/
-- DropForeignKey
ALTER TABLE `projectaccess` DROP FOREIGN KEY `ProjectAccess_projectTemplateId_fkey`;

-- DropForeignKey
ALTER TABLE `projectaccess` DROP FOREIGN KEY `ProjectAccess_teamId_fkey`;

-- DropForeignKey
ALTER TABLE `projectstage` DROP FOREIGN KEY `ProjectStage_primaryPromptId_fkey`;

-- DropForeignKey
ALTER TABLE `projectstage` DROP FOREIGN KEY `ProjectStage_projectTemplateId_fkey`;

-- DropForeignKey
ALTER TABLE `projecttemplate` DROP FOREIGN KEY `ProjectTemplate_userId_fkey`;

-- DropForeignKey
ALTER TABLE `prompt` DROP FOREIGN KEY `Prompt_userId_fkey`;

-- DropForeignKey
ALTER TABLE `promptaccess` DROP FOREIGN KEY `PromptAccess_promptId_fkey`;

-- DropForeignKey
ALTER TABLE `promptaccess` DROP FOREIGN KEY `PromptAccess_teamId_fkey`;

-- DropForeignKey
ALTER TABLE `teammember` DROP FOREIGN KEY `TeamMember_teamId_fkey`;

-- DropForeignKey
ALTER TABLE `teammember` DROP FOREIGN KEY `TeamMember_userId_fkey`;

-- DropForeignKey
ALTER TABLE `workspace` DROP FOREIGN KEY `Workspace_userId_fkey`;

-- DropForeignKey
ALTER TABLE `workspaceaccess` DROP FOREIGN KEY `WorkspaceAccess_teamId_fkey`;

-- DropForeignKey
ALTER TABLE `workspaceaccess` DROP FOREIGN KEY `WorkspaceAccess_workspaceId_fkey`;

-- DropForeignKey
ALTER TABLE `workspaceprompt` DROP FOREIGN KEY `WorkspacePrompt_promptId_fkey`;

-- DropForeignKey
ALTER TABLE `workspaceprompt` DROP FOREIGN KEY `WorkspacePrompt_workspaceId_fkey`;

-- AlterTable
ALTER TABLE `projectaccess` DROP PRIMARY KEY,
    MODIFY `id` VARCHAR(191) NOT NULL,
    MODIFY `projectTemplateId` VARCHAR(191) NOT NULL,
    MODIFY `teamId` VARCHAR(191) NOT NULL,
    ADD PRIMARY KEY (`id`);

-- AlterTable
ALTER TABLE `projectstage` DROP PRIMARY KEY,
    MODIFY `id` VARCHAR(191) NOT NULL,
    MODIFY `projectTemplateId` VARCHAR(191) NOT NULL,
    MODIFY `primaryPromptId` VARCHAR(191) NULL,
    ADD PRIMARY KEY (`id`);

-- AlterTable
ALTER TABLE `projecttemplate` DROP PRIMARY KEY,
    MODIFY `id` VARCHAR(191) NOT NULL,
    MODIFY `userId` VARCHAR(191) NOT NULL,
    ADD PRIMARY KEY (`id`);

-- AlterTable
ALTER TABLE `prompt` DROP PRIMARY KEY,
    MODIFY `id` VARCHAR(191) NOT NULL,
    MODIFY `userId` VARCHAR(191) NOT NULL,
    ADD PRIMARY KEY (`id`);

-- AlterTable
ALTER TABLE `promptaccess` DROP PRIMARY KEY,
    MODIFY `id` VARCHAR(191) NOT NULL,
    MODIFY `promptId` VARCHAR(191) NOT NULL,
    MODIFY `teamId` VARCHAR(191) NOT NULL,
    ADD PRIMARY KEY (`id`);

-- AlterTable
ALTER TABLE `team` DROP PRIMARY KEY,
    MODIFY `id` VARCHAR(191) NOT NULL,
    ADD PRIMARY KEY (`id`);

-- AlterTable
ALTER TABLE `teammember` DROP PRIMARY KEY,
    MODIFY `id` VARCHAR(191) NOT NULL,
    MODIFY `userId` VARCHAR(191) NOT NULL,
    MODIFY `teamId` VARCHAR(191) NOT NULL,
    ADD PRIMARY KEY (`id`);

-- AlterTable
ALTER TABLE `user` DROP PRIMARY KEY,
    MODIFY `id` VARCHAR(191) NOT NULL,
    MODIFY `password` VARCHAR(191) NOT NULL,
    ADD PRIMARY KEY (`id`);

-- AlterTable
ALTER TABLE `workspace` DROP PRIMARY KEY,
    MODIFY `id` VARCHAR(191) NOT NULL,
    MODIFY `userId` VARCHAR(191) NOT NULL,
    ADD PRIMARY KEY (`id`);

-- AlterTable
ALTER TABLE `workspaceaccess` DROP PRIMARY KEY,
    MODIFY `id` VARCHAR(191) NOT NULL,
    MODIFY `workspaceId` VARCHAR(191) NOT NULL,
    MODIFY `teamId` VARCHAR(191) NOT NULL,
    ADD PRIMARY KEY (`id`);

-- AlterTable
ALTER TABLE `workspaceprompt` DROP PRIMARY KEY,
    MODIFY `id` VARCHAR(191) NOT NULL,
    MODIFY `workspaceId` VARCHAR(191) NOT NULL,
    MODIFY `promptId` VARCHAR(191) NOT NULL,
    ADD PRIMARY KEY (`id`);

-- AddForeignKey
ALTER TABLE `TeamMember` ADD CONSTRAINT `TeamMember_userId_fkey` FOREIGN KEY (`userId`) REFERENCES `User`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `TeamMember` ADD CONSTRAINT `TeamMember_teamId_fkey` FOREIGN KEY (`teamId`) REFERENCES `Team`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `Prompt` ADD CONSTRAINT `Prompt_userId_fkey` FOREIGN KEY (`userId`) REFERENCES `User`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `ProjectTemplate` ADD CONSTRAINT `ProjectTemplate_userId_fkey` FOREIGN KEY (`userId`) REFERENCES `User`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `ProjectStage` ADD CONSTRAINT `ProjectStage_projectTemplateId_fkey` FOREIGN KEY (`projectTemplateId`) REFERENCES `ProjectTemplate`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `ProjectStage` ADD CONSTRAINT `ProjectStage_primaryPromptId_fkey` FOREIGN KEY (`primaryPromptId`) REFERENCES `Prompt`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `Workspace` ADD CONSTRAINT `Workspace_userId_fkey` FOREIGN KEY (`userId`) REFERENCES `User`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `WorkspacePrompt` ADD CONSTRAINT `WorkspacePrompt_workspaceId_fkey` FOREIGN KEY (`workspaceId`) REFERENCES `Workspace`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `WorkspacePrompt` ADD CONSTRAINT `WorkspacePrompt_promptId_fkey` FOREIGN KEY (`promptId`) REFERENCES `Prompt`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `PromptAccess` ADD CONSTRAINT `PromptAccess_promptId_fkey` FOREIGN KEY (`promptId`) REFERENCES `Prompt`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `PromptAccess` ADD CONSTRAINT `PromptAccess_teamId_fkey` FOREIGN KEY (`teamId`) REFERENCES `Team`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `WorkspaceAccess` ADD CONSTRAINT `WorkspaceAccess_workspaceId_fkey` FOREIGN KEY (`workspaceId`) REFERENCES `Workspace`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `WorkspaceAccess` ADD CONSTRAINT `WorkspaceAccess_teamId_fkey` FOREIGN KEY (`teamId`) REFERENCES `Team`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `ProjectAccess` ADD CONSTRAINT `ProjectAccess_projectTemplateId_fkey` FOREIGN KEY (`projectTemplateId`) REFERENCES `ProjectTemplate`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `ProjectAccess` ADD CONSTRAINT `ProjectAccess_teamId_fkey` FOREIGN KEY (`teamId`) REFERENCES `Team`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;
