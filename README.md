# ZWDS API - Zi Wei Dou Shu Chart Generation API

<div align="center">

**Northern School Zi Wei Dou Shu Chart System** | Provides HTTP API and CLI Tool

[![Version](https://img.shields.io/badge/version-0.1.0-blue.svg)](https://github.com/cka4913/zwds)
[![License](https://img.shields.io/badge/license-MIT-green.svg)](./LICENSE)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.x-blue.svg)](https://www.typescriptlang.org/)

[English](#english) | [繁體中文](#繁體中文)

</div>

---

<a name="english"></a>

## 📖 About

ZWDS API is an open-source Zi Wei Dou Shu (Purple Star Astrology) chart generation system based on Northern School (北派) traditional algorithms. This project provides:

- 🌐 **HTTP API Server** (Fastify / Cloudflare Workers)
- 💻 **Command Line Tool (CLI)**
- 📊 **Complete Chart Data** (JSON + Text format)
- 🔍 **Four Transformations System** (四化飞星)
- ⏰ **Decade & Annual Fortune Calculation**

> **⚠️ Note**: This system outputs chart data in **Traditional Chinese** only. While the API accepts English parameters, all astrological terms, palace names, star names, and text output are in Chinese following traditional Zi Wei Dou Shu conventions.

### Features

✅ Complete 14 main stars placement (Ziwei & Tianfu systems)
✅ Six auspicious stars + six inauspicious stars + assist stars
✅ Year stem transformations + palace stem flying transformations
✅ Decade (10-year) and annual fortune calculation
✅ Body palace display
✅ Lunar calendar conversion (based on `lunar-javascript`)
✅ Multiple output formats (JSON / Text)

---

## 🚀 Quick Start

### Requirements

- **Node.js** >= 18.x
- **pnpm** >= 8.x

### Installation

```bash
# Clone repository
git clone https://github.com/cka4913/zwds.git
cd zwds

# Install dependencies
pnpm install

# Build project
pnpm build
```

---

## 💻 Usage

### Option 1: Command Line Tool (CLI)

The simplest way to generate chart text output:

```bash
# Generate female chart
pnpm dev:cli -- --sex female --solar 2000-01-01T12:00:00

# Generate male chart
pnpm dev:cli -- --sex male --solar 2000-01-01T12:00:00

# Specify timezone
pnpm dev:cli -- --sex female --solar 2000-01-01T12:00:00 --tz Asia/Hong_Kong
```

**Output Example** (in Traditional Chinese):

```
性別：女
陽曆生日：2000 年 1 月 1 日 12 時
農曆生日：1999 年 11 月 25 日 午 時
命局：水二局，陽女

【命宮：宮位在甲子】
大限年份：2004-2013
流年年份：1912,1924,1936,1948,1960,1972,1984,1996,2008,2020,2032,2044
主星有：天同旺．太陰廟
輔星有：左輔平．天魁平
...
```

---

### Option 2: HTTP API Server

#### Start API Server

```bash
# Start development server (default port 3000)
pnpm dev:api

# Or specify port
PORT=8080 pnpm dev:api
```

When you see this output, the server is ready:

```
ZWDS API listening on :3000
```

#### API Endpoints

##### 1. Health Check

```bash
GET /api/health
```

**Response**:

```json
{
  "ok": true
}
```

##### 2. Generate Chart

```bash
POST /api/zwds/chart
Content-Type: application/json

{
  "sex": "female",          // "male" or "female"
  "solar": "2000-01-01T12:00:00",  // ISO 8601 format
  "tz": "Asia/Hong_Kong",   // Optional, defaults to Asia/Hong_Kong
  "output": {               // Optional
    "text": true,           // Return text format
    "json": true            // Return JSON format
  }
}
```

**Full Example**:

```bash
curl -X POST http://localhost:3000/api/zwds/chart \
  -H "Content-Type: application/json" \
  -d '{
    "sex": "female",
    "solar": "2000-01-01T12:00:00"
  }'
```

**Response Structure**:

```json
{
  "meta": {
    "sex": "female",
    "solar": "2000-01-01T12:00:00",
    "lunar": "1999-11-25T12:00:00",
    "tz": "Asia/Hong_Kong",
    "bodyPalaceBranch": "子"
  },
  "chart": {
    "palaces": {
      "命宮": {
        "layer": "本命",
        "name": "命宮",
        "branch": "子",
        "stem": "甲",
        "mainStars": [
          { "name": "天同", "status": "旺" },
          { "name": "太陰", "status": "廟" }
        ],
        "assistStars": [
          { "name": "左輔", "status": "平" },
          { "name": "天魁", "status": "平" }
        ],
        "transforms": [...],
        "decadeYears": [2004, 2013],
        "flowYears": [1912, 1924, ...]
      },
      "兄弟宮": {...},
      ...
    }
  },
  "text": "性別：女\n陽曆生日：2000 年 1 月 1 日 12 時\n..."
}
```

> **Note**: All field names in the JSON response (like `命宮`, `兄弟宮`, star names, etc.) are in Traditional Chinese as per Zi Wei Dou Shu conventions.

##### 3. Get Text Format Only

```bash
curl -X POST http://localhost:3000/api/zwds/chart \
  -H "Content-Type: application/json" \
  -d '{
    "sex": "male",
    "solar": "2000-01-01T12:00:00",
    "output": {
      "text": true,
      "json": false
    }
  }' | jq -r '.text'
```

---

## 📦 Project Structure

```
zwds/
├── packages/
│   ├── core/           # Core algorithm library
│   │   ├── src/
│   │   │   ├── calendar.ts      # Lunar conversion
│   │   │   ├── palaces.ts       # Palace arrangement
│   │   │   ├── stars.ts         # Main star placement
│   │   │   ├── assist-stars.ts  # Assist star placement
│   │   │   ├── transforms.ts    # Four transformations
│   │   │   ├── fortune.ts       # Decade & annual fortune
│   │   │   └── data/            # Data tables (JSON)
│   │   └── dist/
│   ├── api/            # Fastify HTTP API
│   ├── cli/            # Command line tool
│   └── workers/        # Cloudflare Workers API
├── tests/              # Test files
├── README.md
├── LICENSE
└── package.json
```

---

## 🛠️ Development Guide

### Local Development

```bash
# Install dependencies
pnpm install

# Development mode (with hot reload)
pnpm dev:api    # Start API server
pnpm dev:cli    # Run CLI

# Build
pnpm build      # Build all packages
pnpm typecheck  # Type checking
pnpm lint       # Code linting

# Testing
pnpm test       # Run tests
pnpm test --coverage  # Generate coverage report
```

### Build Individual Package

```bash
pnpm --filter @zwds/core build
pnpm --filter @zwds/api build
pnpm --filter @zwds/cli build
```

---

## 🌐 Deploy to Cloudflare Workers

This project supports deployment to Cloudflare Workers edge network:

```bash
# Login to Cloudflare
cd packages/workers
pnpm wrangler login

# Deploy
pnpm deploy
```

---

## 📚 API Reference

### ChartMeta (Chart Metadata)

| Field | Type | Description | Required |
|-------|------|-------------|----------|
| `sex` | `"male" \| "female"` | Gender | ✅ |
| `solar` | `string` | Solar calendar birthday (ISO 8601) | ✅ |
| `tz` | `string` | Timezone (IANA format) | ❌ Default: `Asia/Hong_Kong` |

### PalaceSlot (Palace Data)

Each palace contains the following fields:

- **name**: Palace name (命宮, 兄弟宮, etc.) - in Chinese
- **branch**: Earth Branch (子丑寅卯...) - in Chinese
- **stem**: Heavenly Stem (甲乙丙丁...) - in Chinese
- **mainStars**: List of 14 main stars
- **assistStars**: List of assist stars
- **transforms**: List of four transformations
- **decadeYears**: Decade year range `[start, end]`
- **flowYears**: Annual year list

---

## 🧪 Testing

```bash
# Run all tests
pnpm test

# Run specific test
pnpm test tests/calendar.spec.ts
pnpm test tests/stars.spec.ts

# Generate coverage report
pnpm test --coverage
```

Test coverage includes:
- ✅ Lunar calendar conversion algorithm
- ✅ Palace arrangement (male/female forward/reverse)
- ✅ 14 main star placement
- ✅ Assist star placement
- ✅ Four transformations
- ✅ Decade and annual fortune calculation

---

## 📝 Version History

### v0.1.0 (2025-01-28)

**Initial Release**

- ✅ Complete Zi Wei Dou Shu chart generation
- ✅ HTTP API server (Fastify)
- ✅ CLI command line tool
- ✅ Cloudflare Workers support
- ✅ 14 main stars + assist star system
- ✅ Year stem transformations + palace stem flying transformations
- ✅ Decade and annual fortune calculation
- ✅ Body palace display

---

## 🤝 Contributing

Issues and Pull Requests are welcome!

1. Fork this repository
2. Create feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit your changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to branch (`git push origin feature/AmazingFeature`)
5. Submit Pull Request

---

## 📄 License

This project is licensed under **MIT License**.

```
MIT License

Copyright (c) 2025 ZWDS Contributors

Permission is hereby granted, free of charge, to any person obtaining a copy
of this software and associated documentation files (the "Software"), to deal
in the Software without restriction, including without limitation the rights
to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
copies of the Software, and to permit persons to whom the Software is
furnished to do so, subject to the following conditions:

The above copyright notice and this permission notice shall be included in all
copies or substantial portions of the Software.

THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE
SOFTWARE.
```

---

## 🙏 Acknowledgments

- **lunar-javascript**: Lunar calendar conversion library
- **Traditional Zi Wei Dou Shu algorithms**: Based on Northern School traditional formulas
- Reference project: [iztro](https://github.com/SylarLong/iztro)

---

## 📧 Contact

- **GitHub Issues**: [https://github.com/cka4913/zwds/issues](https://github.com/cka4913/zwds/issues)
- **Project Homepage**: [https://github.com/cka4913/zwds](https://github.com/cka4913/zwds)

---

<div align="center">

**⭐ If this project helps you, please give it a Star!**

Made with ❤️ by ZWDS Contributors

</div>

---
---

<a name="繁體中文"></a>

# ZWDS API - 紫微斗数排盘 API

<div align="center">

**北派紫微斗数排盘系统** | 提供 HTTP API 和 CLI 工具

[![Version](https://img.shields.io/badge/version-0.1.0-blue.svg)](https://github.com/cka4913/zwds)
[![License](https://img.shields.io/badge/license-MIT-green.svg)](./LICENSE)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.x-blue.svg)](https://www.typescriptlang.org/)

[English](#english) | [繁體中文](#繁體中文)

</div>

---

## 📖 项目简介

ZWDS API 是一个开源的紫微斗数（Zi Wei Dou Shu）排盘系统，基于北派（Northern School）传统算法实现。本项目提供：

- 🌐 **HTTP API 服务器**（Fastify / Cloudflare Workers）
- 💻 **命令行工具（CLI）**
- 📊 **完整命盘数据**（JSON + 文本格式）
- 🔍 **四化飞星系统**
- ⏰ **大限流年计算**

### 特色功能

✅ 完整的 14 主星排布（紫微、天府两大星系）
✅ 六吉星 + 六煞星 + 辅星系统
✅ 生年四化 + 宫干飞化
✅ 大限（10年）和流年计算
✅ 身宫显示
✅ 农历转换（基于 `lunar-javascript`）
✅ 支持多种输出格式（JSON / 文本）

---

## 🚀 快速开始

### 环境要求

- **Node.js** >= 18.x
- **pnpm** >= 8.x

### 安装依赖

```bash
# 克隆仓库
git clone https://github.com/cka4913/zwds.git
cd zwds

# 安装依赖
pnpm install

# 构建项目
pnpm build
```

---

## 💻 使用方法

### 方式一：命令行工具（CLI）

最简单的方式，直接生成命盘文本输出：

```bash
# 生成女命命盘
pnpm dev:cli -- --sex female --solar 2000-01-01T12:00:00

# 生成男命命盘
pnpm dev:cli -- --sex male --solar 2000-01-01T12:00:00

# 指定时区
pnpm dev:cli -- --sex female --solar 2000-01-01T12:00:00 --tz Asia/Hong_Kong
```

**输出示例**：

```
性別：女
陽曆生日：2000 年 1 月 1 日 12 時
農曆生日：1999 年 11 月 25 日 午 時
命局：水二局，陽女

【命宮：宮位在甲子】
大限年份：2004-2013
流年年份：1912,1924,1936,1948,1960,1972,1984,1996,2008,2020,2032,2044
主星有：天同旺．太陰廟
輔星有：左輔平．天魁平
...
```

---

### 方式二：HTTP API 服务器

#### 启动 API 服务器

```bash
# 启动开发服务器（默认端口 3000）
pnpm dev:api

# 或指定端口
PORT=8080 pnpm dev:api
```

看到以下输出表示启动成功：

```
ZWDS API listening on :3000
```

#### API 端点

##### 1. 健康检查

```bash
GET /api/health
```

**响应**：

```json
{
  "ok": true
}
```

##### 2. 生成命盘

```bash
POST /api/zwds/chart
Content-Type: application/json

{
  "sex": "female",          // "male" 或 "female"
  "solar": "2000-01-01T12:00:00",  // ISO 8601 格式
  "tz": "Asia/Hong_Kong",   // 可选，默认 Asia/Hong_Kong
  "output": {               // 可选
    "text": true,           // 是否返回文本格式
    "json": true            // 是否返回 JSON 格式
  }
}
```

**完整示例**：

```bash
curl -X POST http://localhost:3000/api/zwds/chart \
  -H "Content-Type: application/json" \
  -d '{
    "sex": "female",
    "solar": "2000-01-01T12:00:00"
  }'
```

**响应结构**：

```json
{
  "meta": {
    "sex": "female",
    "solar": "2000-01-01T12:00:00",
    "lunar": "1999-11-25T12:00:00",
    "tz": "Asia/Hong_Kong",
    "bodyPalaceBranch": "子"
  },
  "chart": {
    "palaces": {
      "命宮": {
        "layer": "本命",
        "name": "命宮",
        "branch": "子",
        "stem": "甲",
        "mainStars": [
          { "name": "天同", "status": "旺" },
          { "name": "太陰", "status": "廟" }
        ],
        "assistStars": [
          { "name": "左輔", "status": "平" },
          { "name": "天魁", "status": "平" }
        ],
        "transforms": [...],
        "decadeYears": [2004, 2013],
        "flowYears": [1912, 1924, ...]
      },
      "兄弟宮": {...},
      ...
    }
  },
  "text": "性別：女\n陽曆生日：2000 年 1 月 1 日 12 時\n..."
}
```

##### 3. 只获取文本格式

```bash
curl -X POST http://localhost:3000/api/zwds/chart \
  -H "Content-Type: application/json" \
  -d '{
    "sex": "male",
    "solar": "2000-01-01T12:00:00",
    "output": {
      "text": true,
      "json": false
    }
  }' | jq -r '.text'
```

---

## 📦 项目结构

```
zwds/
├── packages/
│   ├── core/           # 核心算法库
│   │   ├── src/
│   │   │   ├── calendar.ts      # 农历转换
│   │   │   ├── palaces.ts       # 宫位排布
│   │   │   ├── stars.ts         # 主星安星
│   │   │   ├── assist-stars.ts  # 辅星安星
│   │   │   ├── transforms.ts    # 四化计算
│   │   │   ├── fortune.ts       # 大限流年
│   │   │   └── data/            # 数据表（JSON）
│   │   └── dist/
│   ├── api/            # Fastify HTTP API
│   ├── cli/            # 命令行工具
│   └── workers/        # Cloudflare Workers API
├── tests/              # 测试文件
├── README.md
├── LICENSE
└── package.json
```

---

## 🛠️ 开发指南

### 本地开发

```bash
# 安装依赖
pnpm install

# 开发模式（带热重载）
pnpm dev:api    # 启动 API 服务器
pnpm dev:cli    # 运行 CLI

# 构建
pnpm build      # 构建所有包
pnpm typecheck  # 类型检查
pnpm lint       # 代码检查

# 测试
pnpm test       # 运行测试
pnpm test --coverage  # 生成覆盖率报告
```

### 构建单个包

```bash
pnpm --filter @zwds/core build
pnpm --filter @zwds/api build
pnpm --filter @zwds/cli build
```

---

## 🌐 部署到 Cloudflare Workers

本项目支持部署到 Cloudflare Workers 边缘网络：

```bash
# 登录 Cloudflare
cd packages/workers
pnpm wrangler login

# 部署
pnpm deploy
```

---

## 📚 API 参考

### ChartMeta（命盘元数据）

| 字段 | 类型 | 说明 | 必填 |
|------|------|------|------|
| `sex` | `"male" \| "female"` | 性别 | ✅ |
| `solar` | `string` | 阳历生日（ISO 8601） | ✅ |
| `tz` | `string` | 时区（IANA 格式） | ❌ 默认 `Asia/Hong_Kong` |

### PalaceSlot（宫位数据）

每个宫位包含以下字段：

- **name**: 宫位名称（命宮、兄弟宮等）
- **branch**: 地支（子丑寅卯...）
- **stem**: 天干（甲乙丙丁...）
- **mainStars**: 14 主星列表
- **assistStars**: 辅星列表
- **transforms**: 四化飞星列表
- **decadeYears**: 大限年份区间 `[起, 止]`
- **flowYears**: 流年年份列表

---

## 🧪 测试

```bash
# 运行所有测试
pnpm test

# 运行特定测试
pnpm test tests/calendar.spec.ts
pnpm test tests/stars.spec.ts

# 生成覆盖率报告
pnpm test --coverage
```

测试覆盖：
- ✅ 农历转换算法
- ✅ 宫位排布（男女顺逆）
- ✅ 14 主星安星
- ✅ 辅星安星
- ✅ 四化飞星
- ✅ 大限流年计算

---

## 📝 版本历史

### v0.1.0 (2025-01-28)

**初始版本**

- ✅ 完整的紫微斗数排盘功能
- ✅ HTTP API 服务器（Fastify）
- ✅ CLI 命令行工具
- ✅ Cloudflare Workers 支持
- ✅ 14 主星 + 辅星系统
- ✅ 生年四化 + 宫干飞化
- ✅ 大限流年计算
- ✅ 身宫显示

---

## 🤝 贡献指南

欢迎提交 Issue 和 Pull Request！

1. Fork 本仓库
2. 创建特性分支 (`git checkout -b feature/AmazingFeature`)
3. 提交更改 (`git commit -m 'Add some AmazingFeature'`)
4. 推送到分支 (`git push origin feature/AmazingFeature`)
5. 提交 Pull Request

---

## 📄 授权协议

本项目采用 **MIT License** 授权。

```
MIT License

Copyright (c) 2025 ZWDS Contributors

Permission is hereby granted, free of charge, to any person obtaining a copy
of this software and associated documentation files (the "Software"), to deal
in the Software without restriction, including without limitation the rights
to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
copies of the Software, and to permit persons to whom the Software is
furnished to do so, subject to the following conditions:

The above copyright notice and this permission notice shall be included in all
copies or substantial portions of the Software.

THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE
SOFTWARE.
```

---

## 🙏 致谢

- **lunar-javascript**: 农历转换库
- **紫微斗数传统算法**: 基于北派传统口诀实现
- 参考项目：[iztro](https://github.com/SylarLong/iztro)

---

## 📧 联系方式

- **GitHub Issues**: [https://github.com/cka4913/zwds/issues](https://github.com/cka4913/zwds/issues)
- **项目主页**: [https://github.com/cka4913/zwds](https://github.com/cka4913/zwds)

---

<div align="center">

**⭐ 如果这个项目对您有帮助，请给个 Star！**

Made with ❤️ by ZWDS Contributors

</div>
