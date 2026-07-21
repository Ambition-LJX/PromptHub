# PromptHub Docker 部署指南

使用 Docker Compose 一键部署 PromptHub（Next.js 应用 + MySQL 8.0 数据库）。

## 环境要求

- Docker 20.10+
- Docker Compose v2+（已集成在新版 Docker Desktop 中）

## 快速开始

### 1. 准备环境变量

```bash
cd PromptHub
cp .env.docker.example .env.docker
```

编辑 `.env.docker`，**务必修改**：

- `MYSQL_ROOT_PASSWORD` — MySQL root 密码
- `MYSQL_PASSWORD` — 应用数据库用户密码
- `JWT_SECRET` — JWT 签名密钥（生产环境请用 `openssl rand -base64 48` 生成）

### 2. 构建并启动

```bash
docker compose --env-file .env.docker up -d --build
```

首次启动会自动：

1. 等待 MySQL 健康
2. 执行 `prisma migrate deploy`（应用数据库迁移）
3. 检测到数据库为空时执行 `prisma db seed`（注入默认管理员与示例 prompt）
4. 启动 Next.js 生产服务器

### 3. 访问应用

浏览器打开：http://localhost:3000

默认管理员账号：

```
邮箱: admin@prompthub.local
密码: password123
```

## 常用命令

| 操作 | 命令 |
|------|------|
| 查看服务状态 | `docker compose ps` |
| 查看应用日志 | `docker compose logs -f app` |
| 查看数据库日志 | `docker compose logs -f mysql` |
| 停止服务 | `docker compose down` |
| 停止并删除数据卷（⚠️ 清空数据库） | `docker compose down -v` |
| 重新构建并启动 | `docker compose --env-file .env.docker up -d --build` |
| 进入应用容器 | `docker compose exec app sh` |
| 进入数据库 | `docker compose exec mysql mysql -u root -p` |

## 端口冲突处理

如果本机已占用 3000 / 3306 端口，在 `.env.docker` 中修改：

```env
APP_PORT=3001
MYSQL_PORT=3307
```

## 数据持久化

MySQL 数据存储在命名卷 `prompthub-mysql-data` 中。

- `docker compose down` 不会删除数据
- `docker compose down -v` 会删除数据卷（谨慎！）
- 备份：`docker run --rm -v prompthub-mysql-data:/data -v $(pwd):/backup alpine tar czf /backup/mysql-backup.tar.gz -C /data .`
- 恢复：`docker run --rm -v prompthub-mysql-data:/data -v $(pwd):/backup alpine tar xzf /backup/mysql-backup.tar.gz -C /data`

## 重新部署（代码更新后）

```bash
git pull
docker compose --env-file .env.docker up -d --build
```

应用容器会重新构建，迁移自动应用。已有数据保留。

## 关闭 Seed 加速启动

确认数据库已初始化后，在 `.env.docker` 中设置：

```env
RUN_SEED=false
```

后续启动会跳过 seed 检查，加快启动速度。

## 第三方登录（GitHub OAuth）

登录页已集成 GitHub 登录按钮。要启用，需在 GitHub 注册 OAuth 应用并把凭据填入 `.env.docker`。未配置时点击按钮会提示"该第三方登录尚未配置"。

### 1. 配置 GitHub OAuth App

1. 打开 https://github.com/settings/developers → **New OAuth App**
2. 填写：
   - **Application name**: PromptHub（任意）
   - **Homepage URL**: `http://localhost:3000`（生产环境填你的域名）
   - **Authorization callback URL**: `http://localhost:3000/api/auth/oauth/github/callback`
3. 创建后获取 **Client ID**，点击 **Generate a new client secret** 获取 **Client Secret**
4. 填入 `.env.docker`：

```env
GITHUB_CLIENT_ID=你的Client ID
GITHUB_CLIENT_SECRET=你的Client Secret
```

### 2. 设置回调基础 URL

`.env.docker` 中的 `OAUTH_CALLBACK_BASE_URL` 必须与你在上方填写的 Homepage/回调地址的根域名一致：

```env
# 本地开发
OAUTH_CALLBACK_BASE_URL=http://localhost:3000
# 生产部署
OAUTH_CALLBACK_BASE_URL=https://your-domain.com
```

### 3. 重启生效

```bash
docker compose --env-file .env.docker up -d --build
```

### 登录行为说明

- **首次用 GitHub 登录**：自动创建新账号（无密码，用户名取自 OAuth 昵称）
- **邮箱已存在的本地账号**：直接登录该账号并自动关联 OAuth（同邮箱即视为同一用户）
- **OAuth 用户尝试密码登录**：会提示"该账号使用 GitHub 登录，请点击对应按钮"

## 架构说明

```
┌─────────────────────────────────────────────┐
│  Host Machine                               │
│                                             │
│  ┌─────────────────┐   ┌─────────────────┐ │
│  │  prompthub-app  │   │ prompthub-mysql │ │
│  │  Next.js :3000  │◄─►│  MySQL 8.0      │ │
│  │  (Node 22)      │   │  :3306          │ │
│  └────────┬────────┘   └────────┬────────┘ │
│           │                      │          │
│           │ host:3000            │ volume:  │
│           ▼                      ▼          │
│      浏览器访问            prompthub-mysql  │
│                            -data (持久卷)   │
└─────────────────────────────────────────────┘
```

- **网络**：自定义桥接网络 `prompthub-net`，容器间通过服务名 `mysql` 通信
- **健康检查**：MySQL 容器配置了 `mysqladmin ping` 健康检查，app 依赖其健康后才启动
- **进程管理**：app 容器使用 `dumb-init` 作为 PID 1，正确处理信号与僵尸进程
- **最小化镜像**：Next.js `standalone` 输出 + 多阶段构建，运行镜像不含 devDependencies

## 故障排查

### 应用启动失败

```bash
docker compose logs app
```

常见原因：

- `DATABASE_URL` 格式错误 → 检查 `.env.docker` 中的 `MYSQL_USER` / `MYSQL_PASSWORD`
- MySQL 未就绪 → entrypoint 会自动重试 120 秒，超时则检查 mysql 容器日志
- 迁移失败 → `docker compose exec app npx prisma migrate status`

### 端口被占用

修改 `.env.docker` 中的 `APP_PORT` / `MYSQL_PORT`。

### 想完全重来

```bash
docker compose down -v
docker compose --env-file .env.docker up -d --build
```

⚠️ `down -v` 会清空数据库，谨慎使用。
