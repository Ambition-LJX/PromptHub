# PromptHub - AI 提示词管理系统

<div align="center">

[![Next.js](https://img.shields.io/badge/Next.js-16.2.6-black?style=flat-square&logo=next.js)](https://nextjs.org/)
[![TypeScript](https://img.shields.io/badge/TypeScript-5-blue?style=flat-square&logo=typescript)](https://www.typescriptlang.org/)
[![Prisma](https://img.shields.io/badge/Prisma-ORM-2D3748?style=flat-square&logo=prisma)](https://prisma.io/)
[![MySQL](https://img.shields.io/badge/MySQL-8.0-4479A1?style=flat-square&logo=mysql)](https://www.mysql.com/)
[![Tailwind CSS](https://img.shields.io/badge/Tailwind%20CSS-4-38B2AC?style=flat-square&logo=tailwind-css)](https://tailwindcss.com/)
[![License](https://img.shields.io/badge/License-MIT-green?style=flat-square)](LICENSE)

**一个现代化、功能完整的 AI 提示词管理与协作平台**

[English](README_EN.md) | 中文

</div>

---

## 功能特性

### 提示词管理
- **多维度标签体系** - 按语言（TS/JS/Python/Go...）、角色（前端/后端/全栈...）、阶段（需求/设计/编码/测试...）分类
- **收藏与搜索** - 支持标题和内容关键词搜索，输入防抖优化
- **变量高亮** - 自动识别并高亮 `{{variable}}` 格式的变量
- **版本历史** - 记录提示词的每次修改版本
- **一键复制** - 快速复制提示词内容到剪贴板
- **分享机制** - 支持私有（PRIVATE）、团队（TEAM）、共享（SHARED）三种可见范围

### 项目模板
- 将多个提示词串联成完整的工作流模板
- 支持拖拽调整提示词在流水线中的顺序
- 一键生成完整提示词链（Markdown 格式导出）
- 内置 8 个默认开发阶段模板

### 工作空间
- 将相关提示词分组管理
- 工作空间级别的一键 Markdown 导出
- 拖拽排序整理

### 团队协作
- 创建团队、邀请成员、分配角色（OWNER / MEMBER）
- 团队内共享提示词、项目模板、工作空间
- 细粒度的访问权限控制

### 界面与主题
- 11 款精心设计的玻璃拟态主题（深空极光 / 赛博朋克 / 薄荷清新 / 琥珀黄昏 ...）
- 明暗模式切换
- 响应式布局，支持网格/列表视图切换
- 平滑的过渡动画与交互反馈

---

## 技术栈

| 层级 | 技术选型 |
|------|---------|
| 框架 | Next.js 16.2.6 (App Router) |
| 语言 | TypeScript 5 |
| 数据库 | MySQL 8.0 + Prisma ORM |
| 认证 | JWT (jose) + bcryptjs |
| UI 组件 | Radix UI Primitives |
| 样式 | Tailwind CSS v4 + CSS 变量 |
| 图标 | Lucide React |
| 工具库 | cva (组件变体) / clsx / tailwind-merge |

---

## 项目结构

```
PromptHub/
├── prisma/
│   ├── schema.prisma      # 数据库模型定义
│   ├── seed.ts            # 初始数据种子
│   ├── migrations/        # 数据库迁移记录
│   └── dev.db             # SQLite 开发数据库
├── public/                # 静态资源
├── src/
│   ├── app/               # Next.js App Router 页面
│   │   ├── api/           # RESTful API 路由
│   │   ├── prompts/       # 提示词管理页面
│   │   ├── projects/      # 项目模板页面
│   │   ├── workspaces/    # 工作空间页面
│   │   ├── teams/         # 团队管理页面
│   │   ├── login/         # 登录页
│   │   └── register/      # 注册页
│   ├── components/
│   │   ├── ui/            # 基础 UI 组件
│   │   ├── common/        # 通用组件
│   │   ├── prompts/       # 提示词相关组件
│   │   ├── projects/      # 项目模板组件
│   │   ├── workspaces/    # 工作空间组件
│   │   └── layout/        # 布局组件
│   ├── lib/               # 工具函数
│   ├── config/            # 配置文件
│   ├── types/             # TypeScript 类型定义
│   └── styles/            # 样式文件
├── .env                   # 环境变量
├── .env.example           # 环境变量示例
├── next.config.ts         # Next.js 配置
├── package.json
└── tsconfig.json
```

---

## 快速开始

### 环境要求

- Node.js 18+
- MySQL 8.0+ 或 SQLite（开发环境）
- npm / yarn / pnpm

### 安装依赖

```bash
npm install
```

### 配置环境变量

```bash
cp .env.example .env
```

编辑 `.env` 文件，填入你的数据库连接信息：

```env
DATABASE_URL="mysql://root:password@localhost:3306/prompt_hub"
JWT_SECRET="your-super-secret-jwt-key-change-in-production"
JWT_EXPIRES_IN="7d"
```

> **提示**：如果你使用 MySQL，请确保先创建数据库 `prompt_hub`：
> ```sql
> CREATE DATABASE prompt_hub CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
> ```

### 初始化数据库

```bash
# 生成 Prisma Client
npm run db:generate

# 执行数据库迁移
npm run db:migrate

# 填充初始数据（创建管理员账号和示例提示词）
npm run db:seed
```

> 默认管理员账号：`admin@prompthub.local` / `password123`

### 启动开发服务器

```bash
npm run dev
```

访问 [http://localhost:3000](http://localhost:3000) 即可打开应用。

### 其他命令

```bash
npm run build      # 生产环境构建
npm run start      # 启动生产服务器
npm run lint       # 运行 ESLint 检查
npm run db:studio  # 打开 Prisma Studio（可视化数据库管理）
```

---

## API 接口一览

### 认证

| 接口 | 方法 | 描述 |
|------|------|------|
| `/api/auth/register` | POST | 用户注册 |
| `/api/auth/login` | POST | 用户登录 |
| `/api/auth/logout` | POST | 用户登出 |
| `/api/auth/me` | GET | 获取当前用户信息 |

### 提示词

| 接口 | 方法 | 描述 |
|------|------|------|
| `/api/prompts` | GET, POST | 获取列表 / 创建提示词 |
| `/api/prompts/[id]` | GET, PUT, DELETE | 单个提示词的增删改查 |
| `/api/prompts/tags` | GET | 获取所有标签 |
| `/api/prompts/picker` | GET | 提示词选择器 |
| `/api/prompts/[id]/share` | POST | 分享提示词 |

### 项目模板

| 接口 | 方法 | 描述 |
|------|------|------|
| `/api/projects` | GET, POST | 获取列表 / 创建项目 |
| `/api/projects/[id]` | GET, PUT, DELETE | 单个项目模板的增删改查 |
| `/api/projects/[id]/chain` | GET | 获取提示词链 |
| `/api/projects/[id]/share` | POST | 分享项目 |
| `/api/projects/stages/[stageId]` | PUT, DELETE | 阶段操作 |

### 工作空间

| 接口 | 方法 | 描述 |
|------|------|------|
| `/api/workspaces` | GET, POST | 获取列表 / 创建工作空间 |
| `/api/workspaces/[id]` | GET, PUT, DELETE | 单个工作空间的增删改查 |
| `/api/workspaces/lightweight` | GET | 轻量级工作空间列表 |
| `/api/workspaces/[id]/share` | POST | 分享工作空间 |

### 团队

| 接口 | 方法 | 描述 |
|------|------|------|
| `/api/teams` | GET, POST | 获取列表 / 创建团队 |
| `/api/teams/[id]` | GET, DELETE | 单个团队的查看/删除 |
| `/api/teams/[id]/members` | GET, POST, DELETE | 团队成员管理 |

---

## 数据模型

系统定义了以下核心数据模型：

- **User** - 用户账户
- **Prompt** - 提示词（含语言/角色/阶段/自定义标签、收藏、版本历史）
- **ProjectTemplate** - 项目模板
- **ProjectStage** - 项目阶段
- **Workspace** - 工作空间
- **WorkspacePrompt** - 工作空间中的提示词关联
- **Team** - 团队
- **TeamMember** - 团队成员
- **PromptAccess** / **WorkspaceAccess** / **ProjectAccess** - 分享与权限

---

## 内置主题

| 主题名 | 风格描述 |
|--------|---------|
| Deep Space | 深邃星空，蓝色主调 |
| Aurora Light | 极光流光，清新明快 |
| Rose Quartz | 玫瑰石英，柔美粉紫 |
| Emerald Forest | 翡翠森林，自然绿色 |
| Sunset Orange | 落日余晖，暖橙色调 |
| Cyberpunk | 赛博朋克，霓虹紫绿 |
| Arctic Blue | 北极冰蓝，冷调科技 |
| Lavender Dream | 薰衣草梦，梦幻紫灰 |
| Mint Fresh | 薄荷清新，清爽绿白 |
| Golden Hour | 黄金时刻，金棕暖调 |
| Midnight Purple | 午夜紫黑，高端神秘 |

---

## 示例提示词

种子数据包含 10 条高质量示例提示词，覆盖：

- TypeScript 代码审查
- Python RESTful API 开发
- React 组件开发
- 数据库设计分析
- 需求分析文档生成
- Git Commit 规范检查
- 系统架构设计
- 自动化部署脚本
- 单元测试编写
- 性能分析与优化

以及 3 个完整项目模板，每个模板包含 8 个开发阶段的提示词链。

---

## License

MIT License - 详见 [LICENSE](LICENSE) 文件。
