# PromptHub 运行指南

## 环境要求

- Node.js 18+
- MySQL 8.0

## 快速启动

### 1. 安装依赖

```bash
npm install
```

### 2. 配置环境变量

```bash
cp .env.example .env
```

编辑 `.env`，修改数据库连接：

```env
DATABASE_URL="mysql://root:你的密码@localhost:3306/prompt_hub"
JWT_SECRET="your-secret-key"
```

### 3. 创建数据库

```sql
CREATE DATABASE prompt_hub CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
```

### 4. 初始化

```bash
npm run db:generate
npm run db:migrate
npm run db:seed
```

> 默认管理员：`admin@prompthub.local` / `password123`

### 5. 启动

```bash
npm run dev
```

访问 http://localhost:3000

---

## 常用命令

| 命令 | 说明 |
|------|------|
| `npm run dev` | 开发服务器 |
| `npm run build` | 生产构建 |
| `npm run start` | 生产运行 |
| `npm run db:studio` | 数据库可视化 |
