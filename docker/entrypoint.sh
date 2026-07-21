#!/bin/sh
# ============================================================================
# PromptHub 容器启动脚本
#   1. 等待 MySQL 端口可连接
#   2. 执行 prisma migrate deploy（应用所有迁移）
#   3. 仅在数据库为空时执行 seed（避免重复数据）
#   4. 启动 Next.js (server.js)
# ============================================================================
set -e

# 将 node_modules/.bin 加入 PATH，使 prisma db seed 内部调用的 tsx 等命令可被找到
export PATH="$PWD/node_modules/.bin:$PATH"

# Prisma CLI 入口（避免依赖 node_modules/.bin 软链接）
PRISMA="node ./node_modules/prisma/build/index.js"

echo "[PromptHub] 启动入口脚本..."
echo "[PromptHub] DATABASE_URL = ${DATABASE_URL}"

# ---------- 1. 等待 MySQL 端口可连接 ----------
MAX_WAIT=120
WAITED=0
echo "[PromptHub] 等待 MySQL 就绪..."
until node -e "
  const url = new URL(process.env.DATABASE_URL);
  const net = require('net');
  const sock = net.createConnection({ host: url.hostname, port: Number(url.port || 3306) }, () => {
    sock.end();
    process.exit(0);
  });
  sock.on('error', () => process.exit(1));
  setTimeout(() => { sock.destroy(); process.exit(1); }, 2000);
" 2>/dev/null; do
  WAITED=$((WAITED + 3))
  if [ "$WAITED" -ge "$MAX_WAIT" ]; then
    echo "[PromptHub] 等待 MySQL 超时（${MAX_WAIT}s），退出。"
    exit 1
  fi
  echo "[PromptHub] MySQL 尚未就绪，${WAITED}s 后重试..."
  sleep 3
done
echo "[PromptHub] MySQL 端口已就绪（耗时约 ${WAITED}s）。"

# ---------- 2. 应用数据库迁移 ----------
echo "[PromptHub] 执行 prisma migrate deploy..."
$PRISMA migrate deploy

# ---------- 3. 仅在数据库为空时执行 seed ----------
# seed 中 prompts/projectTemplate/workspace 使用 create（非幂等），
# 因此通过检查 User 表是否为空来判断是否为首次启动。
SHOULD_SEED="${RUN_SEED:-true}"
if [ "$SHOULD_SEED" = "true" ]; then
  USER_COUNT=$(node -e "
    const { PrismaClient } = require('@prisma/client');
    const p = new PrismaClient();
    p.user.count().then(c => { console.log(c); return p.\$disconnect(); }).catch(e => { console.error(e); process.exit(1); });
  " 2>/dev/null || echo "error")

  if [ "$USER_COUNT" = "0" ]; then
    echo "[PromptHub] 数据库为空，执行 prisma db seed..."
    $PRISMA db seed || {
      echo "[PromptHub] seed 执行失败，但继续启动应用（迁移已完成）。"
    }
  elif [ "$USER_COUNT" = "error" ] || [ -z "$USER_COUNT" ]; then
    echo "[PromptHub] 无法确认数据库状态，跳过 seed（迁移已完成）。"
  else
    echo "[PromptHub] 数据库已有 ${USER_COUNT} 个用户，跳过 seed。"
  fi
else
  echo "[PromptHub] RUN_SEED=false，跳过 seed。"
fi

# ---------- 4. 启动应用 ----------
echo "[PromptHub] 启动 Next.js 生产服务器..."
exec "$@"
