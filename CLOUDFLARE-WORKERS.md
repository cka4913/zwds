# Cloudflare Workers 部署指南

## 概述

本项目支持部署到 Cloudflare Workers。我们使用 Hono 框架构建了一个轻量级、兼容 Workers 的 API。

## 项目结构

```
packages/
  workers/          # Cloudflare Workers 包
    src/
      index.ts      # Workers 入口文件（使用 Hono）
    wrangler.toml   # Wrangler 配置
    package.json
  api/              # Node.js API（使用 Fastify，用于本地开发）
  core/             # 核心逻辑
  cli/              # 命令行工具
```

## 本地开发

### 1. 安装依赖

```bash
pnpm install
```

### 2. 本地运行 Workers

```bash
pnpm dev:workers
```

Workers 将在 `http://localhost:8787` 运行

### 3. 测试 API

```bash
# 健康检查
curl http://localhost:8787/api/health

# 生成命盘
curl -X POST http://localhost:8787/api/zwds/chart \
  -H "Content-Type: application/json" \
  -d '{"sex":"female","solar":"1984-09-19T06:00:00"}'
```

## 部署到 Cloudflare Workers

### 方式一：通过 Wrangler CLI

1. 登录 Cloudflare：

```bash
cd packages/workers
pnpm wrangler login
```

2. 部署：

```bash
# 从根目录
pnpm deploy:workers

# 或者从 workers 目录
cd packages/workers
pnpm deploy
```

### 方式二：通过 Cloudflare Dashboard

1. 登录 [Cloudflare Dashboard](https://dash.cloudflare.com)
2. 进入 **Workers & Pages** > **Create Application**
3. 选择 **Create Worker**
4. 连接你的 GitHub 仓库
5. 配置构建设置：
   - **Build command**: `pnpm install`
   - **Build output directory**: （留空）
   - **Root directory**: `/`

Cloudflare 会自动检测 `wrangler.toml` 并部署

### 方式三：GitHub Actions（推荐用于生产环境）

在 `.github/workflows/deploy.yml` 中配置自动部署（可选）

## 配置

### wrangler.toml

主要配置文件位于根目录 `wrangler.toml`：

```toml
name = "zwds-api"
main = "packages/workers/src/index.ts"
compatibility_date = "2024-01-01"

# Node.js compatibility
node_compat = true
```

配置说明：
- `main` - 入口文件路径（相对于项目根目录）
- `compatibility_date` - Workers 兼容性日期
- `node_compat` - 启用 Node.js 兼容层

### 环境变量

如需添加环境变量，在 `wrangler.toml` 中配置：

```toml
[vars]
YOUR_VAR = "value"
```

或使用 secrets（敏感信息）：

```bash
pnpm wrangler secret put SECRET_NAME
```

## API 端点

部署后的 API 端点：

- `GET /api/health` - 健康检查
- `POST /api/zwds/chart` - 生成紫微斗数命盘
- `POST /api/zwds/search` - 搜索功能（待实现）

## 注意事项

1. **Wrangler 直接打包 TypeScript**
   - 不需要预编译，Wrangler 使用 esbuild 直接打包
   - `.npmrc` 配置了依赖提升以确保所有包可用

2. **Node.js 兼容性**
   - 启用了 `node_compat = true` 以支持部分 Node.js API
   - 核心包（@zwds/core）已兼容 Workers 环境

3. **与 Fastify API 的差异**
   - `packages/api` 使用 Fastify（Node.js 环境）
   - `packages/workers` 使用 Hono（Edge 环境）
   - 两者提供相同的 API 接口

## 常见问题

### Q: 为什么有两个 API 实现？

A:
- `packages/api` (Fastify) - 用于本地开发和 Node.js 部署
- `packages/workers` (Hono) - 用于 Cloudflare Workers 部署

两者 API 接口完全一致，只是底层框架不同。

### Q: 如何切换部署目标？

A:
- 本地/Node.js: `pnpm dev:api`
- Cloudflare Workers: `pnpm dev:workers` 或 `pnpm deploy:workers`

### Q: TypeScript 编译错误怎么办？

A: Wrangler 使用 esbuild 直接打包，不需要预编译。如果遇到问题：
1. 确保 `.npmrc` 存在
2. 运行 `pnpm install` 重新安装依赖
3. 检查 `wrangler.toml` 配置

## 性能优势

Cloudflare Workers 提供：
- 🚀 全球边缘部署（175+ 数据中心）
- ⚡ 超低延迟（< 50ms）
- 💰 免费额度：每天 100,000 请求
- 🔄 自动扩展

## 相关链接

- [Cloudflare Workers 文档](https://developers.cloudflare.com/workers/)
- [Hono 文档](https://hono.dev/)
- [Wrangler CLI 文档](https://developers.cloudflare.com/workers/wrangler/)
