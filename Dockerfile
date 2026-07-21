# 已注释 syntax 指令：使用默认 frontend，避免从镜像源拉取 dockerfile-frontend 时被限流 429
# 如需恢复 BuildKit 1.7 特性，请取消下一行注释（需确保能正常拉取该镜像）
# syntax=docker/dockerfile:1.7

# ============================================================================
# PromptHub Dockerfile (多阶段构建)
#   阶段 1: deps      安装依赖（含 devDependencies，供构建使用）
#   阶段 2: builder   生成 Prisma Client + 构建 Next.js standalone 产物
#   阶段 3: runner    最小化运行镜像
#
# 说明：由于运行期需要 prisma CLI + tsx（执行 seed.ts），这些工具依赖
# esbuild 等原生二进制，无法只复制单个包目录。因此 runner 阶段保留
# builder 的完整 node_modules，确保 prisma migrate / seed 正常工作。
# ============================================================================

# ---------- 阶段 1: deps ----------
FROM node:22-bookworm-slim AS deps

RUN apt-get update \
    && apt-get install -y --no-install-recommends openssl ca-certificates \
    && rm -rf /var/lib/apt/lists/*

WORKDIR /app

# 仅复制依赖描述文件，最大化利用 docker 层缓存
COPY package.json package-lock.json* ./
COPY prisma ./prisma
COPY prisma.config.ts ./

RUN npm ci

# ---------- 阶段 2: builder ----------
FROM node:22-bookworm-slim AS builder

RUN apt-get update \
    && apt-get install -y --no-install-recommends openssl ca-certificates \
    && rm -rf /var/lib/apt/lists/*

WORKDIR /app

COPY --from=deps /app/node_modules ./node_modules
COPY . .

# 构建期不需要真实数据库连接；prisma generate 不需要 DATABASE_URL
ENV DATABASE_URL="mysql://placeholder:placeholder@localhost:3306/prompt_hub"
ENV JWT_SECRET="build-placeholder-secret"
ENV JWT_EXPIRES_IN="7d"
ENV NEXT_TELEMETRY_DISABLED=1

# 生成 Prisma Client（构建期需要类型）
RUN npx prisma generate

# 构建 Next.js（产出 .next/standalone 与 .next/static）
RUN npm run build

# ---------- 阶段 3: runner ----------
FROM node:22-bookworm-slim AS runner

RUN apt-get update \
    && apt-get install -y --no-install-recommends openssl ca-certificates dumb-init \
    && rm -rf /var/lib/apt/lists/* \
    && groupadd --system --gid 1001 nodejs \
    && useradd --system --uid 1001 --gid nodejs nextjs

WORKDIR /app

ENV NODE_ENV=production
ENV NEXT_TELEMETRY_DISABLED=1
ENV PORT=3000
ENV HOSTNAME=0.0.0.0

# 复制 standalone 产物（含 server.js）
COPY --from=builder --chown=nextjs:nodejs /app/.next/standalone ./
# 复制静态资源（standalone 不包含这些）
COPY --from=builder --chown=nextjs:nodejs /app/.next/static ./.next/static
# 复制 public 目录
COPY --from=builder --chown=nextjs:nodejs /app/public ./public

# 复制完整 node_modules（覆盖 standalone 的最小 node_modules）
# 原因：运行期需要 prisma CLI + tsx 执行 seed，它们依赖 esbuild 等原生包
COPY --from=builder --chown=nextjs:nodejs /app/node_modules ./node_modules

# 复制 Prisma 相关文件
COPY --from=builder --chown=nextjs:nodejs /app/prisma ./prisma
COPY --from=builder --chown=nextjs:nodejs /app/prisma.config.ts ./prisma.config.ts
COPY --from=builder --chown=nextjs:nodejs /app/package.json ./package.json

# 复制启动脚本
COPY --chown=nextjs:nodejs docker/entrypoint.sh /usr/local/bin/entrypoint.sh
RUN chmod +x /usr/local/bin/entrypoint.sh

USER nextjs

EXPOSE 3000

# dumb-init 作为 PID 1，正确处理信号
ENTRYPOINT ["dumb-init", "--", "/usr/local/bin/entrypoint.sh"]
CMD ["node", "server.js"]
