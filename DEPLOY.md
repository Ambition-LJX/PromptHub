# PromptHub 部署指南

## 环境要求

- Docker 20.10+
- Docker Compose v2+

## 文件说明

| 文件 | 用途 |
|------|------|
| `.env.example` | 环境变量模板（可提交 git） |
| `.env.docker.dev` | 开发环境变量 |
| `.env.docker.prod` | 生产环境变量 |
| `docker-compose.dev.yml` | 开发环境编排 |
| `docker-compose.prod.yml` | 生产环境编排 |

> MySQL 仅在容器内部网络访问（`expose`），不映射宿主机端口，避免与其他项目端口冲突。
> 应用统一对外暴露 `8081` 端口，访问地址：`http://IP:8081`

---

## 开发环境

### 1. 配置环境变量

编辑 `.env.docker.dev`，修改 `MYSQL_*` 密码与 `JWT_SECRET`。

### 2. 启动

```bash
docker compose -f docker-compose.dev.yml --env-file .env.docker.dev up -d --build
```

### 3. 访问

`http://localhost:8081`（或服务器 IP:8081）

### 4. 常用命令

```bash
# 查看状态
docker compose -f docker-compose.dev.yml ps

# 查看应用日志
docker compose -f docker-compose.dev.yml logs -f app

# 停止
docker compose -f docker-compose.dev.yml down

# 停止并清空数据（⚠️ 清空数据库）
docker compose -f docker-compose.dev.yml down -v

# 重新构建（代码更新后）
docker compose -f docker-compose.dev.yml --env-file .env.docker.dev up -d --build
```

---

## 生产环境

### 1. 配置环境变量

编辑 `.env.docker.prod`，**务必修改**：

- `MYSQL_ROOT_PASSWORD` / `MYSQL_PASSWORD` — 强密码
- `JWT_SECRET` — 用 `openssl rand -base64 48` 生成
- `OAUTH_CALLBACK_BASE_URL` — 改为 `http://你的服务器IP:8081`

### 2. 启动

```bash
docker compose -f docker-compose.prod.yml --env-file .env.docker.prod up -d --build
```

### 3. 访问

`http://服务器IP:8081`

### 4. 常用命令

```bash
# 查看状态
docker compose -f docker-compose.prod.yml ps

# 查看应用日志
docker compose -f docker-compose.prod.yml logs -f app

# 停止
docker compose -f docker-compose.prod.yml down

# 重新构建（代码更新后）
git pull
docker compose -f docker-compose.prod.yml --env-file .env.docker.prod up -d --build
```

---

## 默认账号

首次启动自动注入（`RUN_SEED=true` 时）：

- 邮箱：`admin@prompthub.local`
- 密码：`password123`

> 数据初始化完成后，可将 `RUN_SEED` 改为 `false` 加快后续启动。

## 隔离说明

每个环境使用独立的容器名 / 网络 / 数据卷，互不冲突：

| 环境 | 容器名 | 网络 | 数据卷 |
|------|--------|------|--------|
| 开发 | `prompthub-dev-*` | `prompthub-dev-net` | `prompthub-dev-mysql-data` |
| 生产 | `prompthub-prod-*` | `prompthub-prod-net` | `prompthub-prod-mysql-data` |

> 若开发与生产部署在同一台服务器，需在两个 env 文件中设置不同的 `APP_PORT`（如 dev=8081，prod=8082）。
