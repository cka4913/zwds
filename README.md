# ZWDS API Monorepo (北派紫微斗數)

- `packages/core`: 型別、起盤策略（stub）、渲染器、搜索（stub）
- `packages/api`: Fastify HTTP API（/api/zwds/chart, /api/zwds/search）
- `packages/cli`: 簡易 CLI
- `tests`: Vitest 測試（含 1984/09/19 06:00 女 金樣快照）

## Quick start
```bash
pnpm i
pnpm dev:api
# or
pnpm dev:cli -- --solar 1984-09-19T06:00:00 --sex female --tz Asia/Hong_Kong
```