-- =============================================
-- AI 提示词管理系统 - MySQL 数据库初始化脚本
-- 适用于 MySQL 5.7+ / MySQL 8.0+
-- =============================================

-- 1. 创建数据库
CREATE DATABASE IF NOT EXISTS `prompt_hub`
  CHARACTER SET utf8mb4
  COLLATE utf8mb4_unicode_ci;

USE `prompt_hub`;

-- =============================================
-- 2. 建表语句（完全对应 Prisma schema）
-- =============================================

-- 用户表
CREATE TABLE IF NOT EXISTS `User` (
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

-- 团队表
CREATE TABLE IF NOT EXISTS `Team` (
    `id` VARCHAR(36) NOT NULL PRIMARY KEY,
    `name` VARCHAR(191) NOT NULL,
    `description` TEXT,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updatedAt` DATETIME(3) NOT NULL,
    INDEX `Team_name_idx`(`name`)
) DEFAULT CHARSET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- 团队成员关联表
CREATE TABLE IF NOT EXISTS `TeamMember` (
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

-- 提示词表
CREATE TABLE IF NOT EXISTS `Prompt` (
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

-- 项目流程模板表
CREATE TABLE IF NOT EXISTS `ProjectTemplate` (
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

-- 项目阶段表
CREATE TABLE IF NOT EXISTS `ProjectStage` (
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

-- 工作集表
CREATE TABLE IF NOT EXISTS `Workspace` (
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

-- 工作集与提示词关联表
CREATE TABLE IF NOT EXISTS `WorkspacePrompt` (
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

-- 提示词团队访问权限表
CREATE TABLE IF NOT EXISTS `PromptAccess` (
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

-- 工作集团队访问权限表
CREATE TABLE IF NOT EXISTS `WorkspaceAccess` (
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

-- 项目模板团队访问权限表
CREATE TABLE IF NOT EXISTS `ProjectAccess` (
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

-- =============================================
-- 3. 初始化数据（Seed Data）
-- 默认管理员账号: admin@prompthub.local / password123
-- 密码哈希: bcrypt, cost factor 12
-- =============================================

-- 管理员用户
INSERT INTO `User` (`id`, `username`, `email`, `password`, `role`, `createdAt`, `updatedAt`)
VALUES (
    UUID(),
    'admin',
    'admin@prompthub.local',
    '$2a$12$LQv3c1yqBWVHxkd0LHAkCOYz6TtxMQJqhN8/LewKyNiLR/eOvLCNG',
    'ADMIN',
    NOW(3),
    NOW(3)
) ON DUPLICATE KEY UPDATE `id` = `id`;

SET @admin_id = (SELECT `id` FROM `User` WHERE `email` = 'admin@prompthub.local' LIMIT 1);

-- 10 个提示词模板
INSERT INTO `Prompt` (`id`, `title`, `content`, `description`, `language`, `role`, `stage`, `tags`, `isFavorite`, `versions`, `visibility`, `userId`, `createdAt`, `updatedAt`)
VALUES
(
    UUID(), 'TypeScript 代码审查',
    '你是一位资深的 TypeScript 工程师。请帮我审查以下代码，关注：\n\n1. **类型安全**：是否有 any 类型滥用、类型守卫是否完善\n2. **代码规范**：是否符合 TypeScript 最佳实践\n3. **潜在 Bug**：边界条件、空值处理、异步错误\n4. **性能优化**：是否有不必要的重复计算或内存泄漏\n5. **可维护性**：命名是否清晰、函数是否过于复杂\n\n代码如下：\n```typescript\n{{code}}\n```',
    '对 TypeScript 代码进行全面审查，检查类型安全和最佳实践',
    '["TypeScript"]', '["前端", "全栈"]', '["代码审查"]', '["typescript", "code-review", "最佳实践"]',
    0, '[]', 'PRIVATE', @admin_id, NOW(3), NOW(3)
),
(
    UUID(), 'Python 后端 API 开发',
    '请帮我使用 Python 开发一个 RESTful API 后端服务：\n\n**技术栈要求：**\n- 框架：FastAPI 或 Flask\n- 数据库：{{database}}\n- ORM：SQLAlchemy\n- 认证：JWT Token\n\n**功能需求：**\n{{requirements}}\n\n**要求：**\n1. 提供完整的项目结构\n2. 包含 CRUD 接口设计\n3. 添加数据验证和错误处理\n4. 包含单元测试示例\n5. 提供 Docker 部署配置',
    '基于 FastAPI/Flask 开发 Python RESTful 后端 API',
    '["Python"]', '["后端"]', '["编码"]', '["python", "api", "fastapi", "restful"]',
    0, '[]', 'PRIVATE', @admin_id, NOW(3), NOW(3)
),
(
    UUID(), 'React 组件开发',
    '请帮我开发一个 React 组件：\n\n**组件需求：**\n{{component_requirements}}\n\n**技术要求：**\n- React {{react_version}} + TypeScript\n- 使用函数式组件 + Hooks\n- 样式方案：{{style_solution}}\n- 需要处理的状态：{{states}}\n\n**要求：**\n1. 组件 Props 接口定义清晰\n2. 包含必要的注释和 JSDoc\n3. 处理好加载状态和错误状态\n4. 符合无障碍访问标准（a11y）\n5. 提供使用示例',
    '快速生成高质量的 React TypeScript 组件',
    '["TypeScript", "JavaScript"]', '["前端"]', '["编码"]', '["react", "组件", "hooks", "typescript"]',
    0, '[]', 'PRIVATE', @admin_id, NOW(3), NOW(3)
),
(
    UUID(), '数据库设计',
    '请帮我设计一个数据库架构：\n\n**业务背景：**\n{{business_description}}\n\n**系统规模：**\n- 预计用户量：{{user_scale}}\n- 日活：{{daily_active_users}}\n- 数据增量：{{data_growth}}\n\n**技术选型：**\n- 数据库类型：{{database_type}}\n- 是否需要缓存：{{need_cache}}\n\n**要求：**\n1. 绘制 ER 图（文字描述）\n2. 给出表结构定义（DDL）\n3. 设计合理的索引\n4. 考虑数据分表策略\n5. 提供性能优化建议',
    '根据业务需求设计合理的数据库架构',
    '["SQL"]', '["后端", "全栈"]', '["架构设计", "技术选型"]', '["数据库", "架构", "ER图", "DDL"]',
    0, '[]', 'PRIVATE', @admin_id, NOW(3), NOW(3)
),
(
    UUID(), '需求分析文档生成',
    '请帮我分析以下需求，并生成详细的需求文档：\n\n**原始需求：**\n{{raw_requirements}}\n\n**项目背景：**\n{{project_background}}\n\n**输出要求：**\n1. **业务需求概述**：用简洁的语言描述核心功能\n2. **用户故事**：按照 MVP 优先级列出用户故事（使用 User Story Mapping 格式）\n3. **功能清单**：区分核心功能、扩展功能、未来功能\n4. **非功能需求**：性能、安全、可用性、可维护性\n5. **约束条件**：技术限制、时间限制、资源限制\n6. **风险评估**：识别潜在风险和缓解措施\n7. **验收标准**：每条需求可量化、可测试的验收条件',
    '将模糊的需求转化为结构化的需求文档',
    '["TypeScript", "Python"]', '["前端", "后端", "全栈"]', '["需求分析"]', '["需求分析", "PRD", "用户故事"]',
    0, '[]', 'PRIVATE', @admin_id, NOW(3), NOW(3)
),
(
    UUID(), 'Git Commit 规范检查',
    '请检查以下 Git Commit 信息是否符合规范：\n\nCommit 信息：\n```\n{{commit_message}}\n```\n\n如果不符合，请按照以下规范重写：\n\n**提交类型：**\n- feat：新功能\n- fix：Bug 修复\n- docs：文档更新\n- style：代码格式（不影响功能）\n- refactor：重构（不是新功能或修复）\n- test：测试相关\n- chore：构建/工具相关\n\n**格式：**\n`[type]: subject\n\nbody (可选)\n\nfooter (可选)`\n\n**要求：**\n1. Subject 不超过 50 字符\n2. 使用动词开头，首字母小写\n3. 不要在结尾加句号',
    '检查并规范化 Git Commit 信息',
    '["TypeScript", "JavaScript", "Python", "Shell"]', '["前端", "后端", "全栈", "DevOps"]', '["代码审查"]', '["git", "commit", "规范"]',
    0, '[]', 'PRIVATE', @admin_id, NOW(3), NOW(3)
),
(
    UUID(), '系统架构设计',
    '请帮我设计一个系统的架构方案：\n\n**系统概述：**\n{{system_overview}}\n\n**核心功能：**\n{{core_features}}\n\n**性能指标要求：**\n- QPS：{{qps}}\n- 延迟：{{latency}}\n- 可用性：{{availability}}\n\n**技术偏好：**\n- 语言：{{languages}}\n- 基础设施：{{infrastructure}}\n\n**要求：**\n1. 给出系统架构图（文字描述架构组件和关系）\n2. 推荐技术栈和中间件\n3. 设计高可用和容灾方案\n4. 说明核心模块的职责划分\n5. 给出数据流向和存储策略\n6. 列出关键技术难点和解决方案',
    '设计系统的整体架构方案',
    '["TypeScript", "Python", "Go"]', '["后端", "全栈"]', '["架构设计", "技术选型"]', '["架构", "系统设计", "高可用"]',
    0, '[]', 'PRIVATE', @admin_id, NOW(3), NOW(3)
),
(
    UUID(), '部署脚本生成',
    '请帮我生成项目的部署脚本：\n\n**项目信息：**\n- 项目类型：{{project_type}}\n- 技术栈：{{tech_stack}}\n- 部署环境：{{deployment_env}}\n- 域名：{{domain}}\n\n**要求：**\n1. 提供 Docker 配置（Dockerfile + docker-compose.yml）\n2. 提供 Nginx 反向代理配置\n3. 提供 CI/CD 配置（GitHub Actions 或 GitLab CI）\n4. 配置 HTTPS（Let''s Encrypt）\n5. 提供健康检查配置\n6. 配置日志收集\n7. 给出回滚方案',
    '生成完整的项目部署脚本和 CI/CD 配置',
    '["Shell", "TypeScript"]', '["前端", "后端", "全栈", "DevOps"]', '["部署"]', '["docker", "ci-cd", "nginx", "部署"]',
    0, '[]', 'PRIVATE', @admin_id, NOW(3), NOW(3)
),
(
    UUID(), '单元测试编写',
    '请帮我为以下代码编写单元测试：\n\n**被测代码：**\n```{{language}}\n{{code}}\n```\n\n**测试要求：**\n- 测试框架：{{test_framework}}\n- 覆盖率目标：{{coverage_target}}%\n\n**要求：**\n1. 使用 AAA（Arrange-Act-Assert）模式\n2. 覆盖所有函数分支\n3. 测试边界条件\n4. Mock 外部依赖\n5. 提供有意义的测试描述\n6. 包含性能和压力测试用例',
    '为代码编写高质量的单元测试',
    '["TypeScript", "Python", "JavaScript"]', '["前端", "后端", "全栈"]', '["测试"]', '["测试", "unit-test", "jest", "pytest"]',
    0, '[]', 'PRIVATE', @admin_id, NOW(3), NOW(3)
),
(
    UUID(), '性能分析与优化',
    '请帮我分析和优化系统性能：\n\n**场景描述：**\n{{scenario}}\n\n**当前指标：**\n- 响应时间：{{response_time}}\n- 吞吐量：{{throughput}}\n- 资源使用：{{resource_usage}}\n\n**瓶颈分析：**\n请从以下几个角度分析：\n1. 数据库层面（慢查询、索引缺失、N+1 问题）\n2. 缓存层面（缓存命中率、缓存穿透/雪崩）\n3. 代码层面（同步阻塞、循环耗时、内存泄漏）\n4. 网络层面（请求合并、压缩、CDN）\n5. 架构层面（单点瓶颈、扩展性）\n\n**请给出：**\n1. 性能瓶颈排序（按影响程度）\n2. 每个瓶颈的优化方案\n3. 优化后的预期收益\n4. 实施优先级建议',
    '分析系统性能瓶颈并给出优化方案',
    '["TypeScript", "Python", "SQL"]', '["后端", "全栈"]', '["运维监控"]', '["性能", "优化", "profiling", "数据库优化"]',
    0, '[]', 'PRIVATE', @admin_id, NOW(3), NOW(3)
);

-- 3 个项目流程模板
INSERT INTO `ProjectTemplate` (`id`, `name`, `description`, `stages`, `visibility`, `userId`, `createdAt`, `updatedAt`)
VALUES
(UUID(), '全栈 Web 开发标准流程', '适用于大多数 Web 项目的完整开发流程，从需求分析到部署上线', '[]', 'PRIVATE', @admin_id, NOW(3), NOW(3)),
(UUID(), '前端项目开发流程', '专注于前端项目的开发流程，从技术调研到 CI/CD 部署', '[]', 'PRIVATE', @admin_id, NOW(3), NOW(3)),
(UUID(), '后端 API 服务开发', '后端微服务或 API 服务的标准开发流程', '[]', 'PRIVATE', @admin_id, NOW(3), NOW(3));

-- 为每个项目模板创建 8 个阶段
SET @proj_count = 0;
WHILE @proj_count < 3 DO
    SET @proj_id = (SELECT `id` FROM `ProjectTemplate` WHERE `userId` = @admin_id LIMIT 1 OFFSET @proj_count);
    INSERT INTO `ProjectStage` (`id`, `projectTemplateId`, `name`, `order`, `promptIds`, `createdAt`, `updatedAt`)
    VALUES
    (UUID(), @proj_id, '需求分析', 0, '[]', NOW(3), NOW(3)),
    (UUID(), @proj_id, '架构设计', 1, '[]', NOW(3), NOW(3)),
    (UUID(), @proj_id, '技术选型', 2, '[]', NOW(3), NOW(3)),
    (UUID(), @proj_id, '编码', 3, '[]', NOW(3), NOW(3)),
    (UUID(), @proj_id, '代码审查', 4, '[]', NOW(3), NOW(3)),
    (UUID(), @proj_id, '测试', 5, '[]', NOW(3), NOW(3)),
    (UUID(), @proj_id, '部署', 6, '[]', NOW(3), NOW(3)),
    (UUID(), @proj_id, '运维监控', 7, '[]', NOW(3), NOW(3));
    SET @proj_count = @proj_count + 1;
END WHILE;

-- 1 个工作集
INSERT INTO `Workspace` (`id`, `name`, `description`, `visibility`, `userId`, `createdAt`, `updatedAt`)
VALUES (UUID(), '代码审查工作集', '包含代码审查、Git 规范检查、性能分析等提示词', 'PRIVATE', @admin_id, NOW(3), NOW(3));

-- =============================================
-- 4. 验证查询
-- =============================================
SELECT '=== 数据库初始化完成 ===' AS `status`;
SELECT CONCAT('用户数: ', COUNT(*)) AS `info` FROM `User`;
SELECT CONCAT('提示词数: ', COUNT(*)) AS `info` FROM `Prompt`;
SELECT CONCAT('项目模板数: ', COUNT(*)) AS `info` FROM `ProjectTemplate`;
SELECT CONCAT('项目阶段数: ', COUNT(*)) AS `info` FROM `ProjectStage`;
SELECT CONCAT('工作集数: ', COUNT(*)) AS `info` FROM `Workspace`;
