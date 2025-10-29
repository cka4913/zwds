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

### Why Northern School?

Zi Wei Dou Shu is divided into two major schools: **Northern School (北派)** with 32 main stars and **Southern School (南派)** with 108 main stars. The Northern School emphasizes palace positions and Four Transformations (四化) dynamics, including concepts like "Self Palace" (我宮), "Other Palace" (他宮), Lu-Ji tracking (祿忌追蹤), self-transformation stars (自化星), and flying transformation layers (飛化層次), highlighting the interconnection, interaction, and complex multi-layered nature of the chart. The Southern School focuses primarily on star characteristics, star combinations, and single-layer interpretation, without self-transformation stars, resulting in a relatively flat and straightforward structure.

Most existing tools and AI interpretation programs are based on Southern School principles, which tend to understand Zi Wei charts only through star characteristics and fail to adequately represent the unique multi-layered structure and Four Transformations dynamics of the Northern School. **Therefore, this tool is built on the Northern School Zi Wei Dou Shu system**, enabling AI and programs to read and interpret charts from a Northern School perspective, performing calculations and analysis that deeply embody Northern School characteristics such as palace interactions and Lu-Ji tracking.

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

## 🌐 Live Demo

**This API is compatible with major AI tools (ChatGPT, Claude, Gemini)!** Simply copy the curl or Python snippet below to perform Zi Wei Dou Shu chart calculations.

### Try it Now

The API is deployed on Cloudflare Workers and available at:

```
https://zwds-api.kenckau.workers.dev/api/zwds/chart
```

#### Using curl

```bash
curl -X POST https://zwds-api.kenckau.workers.dev/api/zwds/chart \
  -H "Content-Type: application/json" \
  -d '{"sex":"female","solar":"2000-01-01T12:00:00","output":{"json":false,"text":true}}'
```

#### Using Python

```python
import requests
import json

url = "https://zwds-api.kenckau.workers.dev/api/zwds/chart"
payload = {
    "sex": "female",
    "solar": "2000-01-01T12:00:00",
    "output": {
        "json": False,
        "text": True
    }
}

response = requests.post(url, json=payload)
result = response.json()

# Print the text output
print(result.get("text", ""))

# Or access the JSON chart data
# print(json.dumps(result.get("chart"), indent=2, ensure_ascii=False))
```

#### Using JavaScript/Node.js

```javascript
const url = "https://zwds-api.kenckau.workers.dev/api/zwds/chart";
const payload = {
  sex: "female",
  solar: "2000-01-01T12:00:00",
  output: {
    json: false,
    text: true
  }
};

fetch(url, {
  method: "POST",
  headers: { "Content-Type": "application/json" },
  body: JSON.stringify(payload)
})
  .then(res => res.json())
  .then(data => {
    console.log(data.text);
  });
```

> **💡 Tip for AI Tools**: You can directly paste these code snippets into ChatGPT, Claude, or Gemini with your birth information to get instant Zi Wei Dou Shu chart analysis!

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

## 📖 項目簡介

ZWDS API 是一個開源的紫微斗數（Zi Wei Dou Shu）排盤系統，基於北派（Northern School）傳統算法實現。本項目提供：

- 🌐 **HTTP API 伺服器**（Fastify / Cloudflare Workers）
- 💻 **命令行工具（CLI）**
- 📊 **完整命盤資料**（JSON + 文本格式）
- 🔍 **四化飛星系統**
- ⏰ **大限流年計算**

### 為什麼選擇北派？

紫微斗數分為**北派（共32顆主星）**與**南派（共108顆主星）**兩大流派。北派斗數著重於宮位與四化變化，例如「我宮」、「他宮」、祿忌追蹤、自化星、飛化層次等，強調盤面的貫穿、互動與復雜層次。南派則以星曜情性、星曜組合與單一層面為主，無自化星，結構相對平面與直觀。

現成工具與 AI 解讀程式大都基於南派法則，容易僅以星情方式理解紫微盤、未能充分呈現北派特有的盤面層次與四化變化。**因此本工具以北派紫微斗數盤為基礎**，方便 AI 與程式能讀取並用北派角度進行演繹、推算與分析，更深入體現命盤宮位互動及祿忌追蹤等北派特色。

### 特色功能

✅ 完整的 14 主星排布（紫微、天府兩大星系）
✅ 六吉星 + 六煞星 + 輔星系統
✅ 生年四化 + 宮干飛化
✅ 大限（10年）和流年計算
✅ 身宮顯示
✅ 農曆轉換（基於 `lunar-javascript`）
✅ 支持多種輸出格式（JSON / 文本）

---

## 🚀 快速開始

### 環境要求

- **Node.js** >= 18.x
- **pnpm** >= 8.x

### 安裝依賴

```bash
# 克隆倉庫
git clone https://github.com/cka4913/zwds.git
cd zwds

# 安裝依賴
pnpm install

# 構建項目
pnpm build
```

---

## 💻 使用方法

### 方式一：命令行工具（CLI）

最簡單的方式，直接生成命盤文本輸出：

```bash
# 生成女命命盤
pnpm dev:cli -- --sex female --solar 2000-01-01T12:00:00

# 生成男命命盤
pnpm dev:cli -- --sex male --solar 2000-01-01T12:00:00

# 指定時區
pnpm dev:cli -- --sex female --solar 2000-01-01T12:00:00 --tz Asia/Hong_Kong
```

**輸出示例**：

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

### 方式二：HTTP API 伺服器

#### 啟動 API 伺服器

```bash
# 啟動開發伺服器（預設埠號 3000）
pnpm dev:api

# 或指定埠號
PORT=8080 pnpm dev:api
```

看到以下輸出表示啟動成功：

```
ZWDS API listening on :3000
```

#### API 端點

##### 1. 健康檢查

```bash
GET /api/health
```

**響應**：

```json
{
  "ok": true
}
```

##### 2. 生成命盤

```bash
POST /api/zwds/chart
Content-Type: application/json

{
  "sex": "female",          // "male" 或 "female"
  "solar": "2000-01-01T12:00:00",  // ISO 8601 格式
  "tz": "Asia/Hong_Kong",   // 可選，預設 Asia/Hong_Kong
  "output": {               // 可選
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

**響應結構**：

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

##### 3. 只獲取文本格式

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

## 🌐 在線演示

**本 API 已支援各大 AI 工具（ChatGPT、Claude、Gemini）！** 只需複製下方 curl 或 Python 片段即可運算紫微斗數命盤。

### 立即試用

本 API 已部署在 Cloudflare Workers，可直接訪問：

```
https://zwds-api.kenckau.workers.dev/api/zwds/chart
```

#### 使用 curl

```bash
curl -X POST https://zwds-api.kenckau.workers.dev/api/zwds/chart \
  -H "Content-Type: application/json" \
  -d '{"sex":"female","solar":"2000-01-01T12:00:00","output":{"json":false,"text":true}}'
```

#### 使用 Python

```python
import requests
import json

url = "https://zwds-api.kenckau.workers.dev/api/zwds/chart"
payload = {
    "sex": "female",
    "solar": "2000-01-01T12:00:00",
    "output": {
        "json": False,
        "text": True
    }
}

response = requests.post(url, json=payload)
result = response.json()

# 印出文本輸出
print(result.get("text", ""))

# 或者訪問 JSON 命盤資料
# print(json.dumps(result.get("chart"), indent=2, ensure_ascii=False))
```

#### 使用 JavaScript/Node.js

```javascript
const url = "https://zwds-api.kenckau.workers.dev/api/zwds/chart";
const payload = {
  sex: "female",
  solar: "2000-01-01T12:00:00",
  output: {
    json: false,
    text: true
  }
};

fetch(url, {
  method: "POST",
  headers: { "Content-Type": "application/json" },
  body: JSON.stringify(payload)
})
  .then(res => res.json())
  .then(data => {
    console.log(data.text);
  });
```

> **💡 AI 工具使用技巧**：您可以直接將這些程式碼片段貼到 ChatGPT、Claude 或 Gemini 中，並替換成您的出生資訊，即可立即獲得紫微斗數命盤分析！

---

## 📦 項目結構

```
zwds/
├── packages/
│   ├── core/           # 核心算法庫
│   │   ├── src/
│   │   │   ├── calendar.ts      # 農曆轉換
│   │   │   ├── palaces.ts       # 宮位排布
│   │   │   ├── stars.ts         # 主星安星
│   │   │   ├── assist-stars.ts  # 輔星安星
│   │   │   ├── transforms.ts    # 四化計算
│   │   │   ├── fortune.ts       # 大限流年
│   │   │   └── data/            # 資料表（JSON）
│   │   └── dist/
│   ├── api/            # Fastify HTTP API
│   ├── cli/            # 命令行工具
│   └── workers/        # Cloudflare Workers API
├── tests/              # 測試檔案
├── README.md
├── LICENSE
└── package.json
```

---

## 🛠️ 開發指南

### 本地開發

```bash
# 安裝依賴
pnpm install

# 開發模式（帶熱重載）
pnpm dev:api    # 啟動 API 伺服器
pnpm dev:cli    # 運行 CLI

# 構建
pnpm build      # 構建所有包
pnpm typecheck  # 類型檢查
pnpm lint       # 代碼檢查

# 測試
pnpm test       # 運行測試
pnpm test --coverage  # 生成覆蓋率報告
```

### 構建單個包

```bash
pnpm --filter @zwds/core build
pnpm --filter @zwds/api build
pnpm --filter @zwds/cli build
```

---

## 🌐 部署到 Cloudflare Workers

本項目支持部署到 Cloudflare Workers 邊緣網路：

```bash
# 登錄 Cloudflare
cd packages/workers
pnpm wrangler login

# 部署
pnpm deploy
```

---

## 📚 API 參考

### ChartMeta（命盤元資料）

| 字段 | 類型 | 說明 | 必填 |
|------|------|------|------|
| `sex` | `"male" \| "female"` | 性別 | ✅ |
| `solar` | `string` | 陽曆生日（ISO 8601） | ✅ |
| `tz` | `string` | 時區（IANA 格式） | ❌ 預設 `Asia/Hong_Kong` |

### PalaceSlot（宮位資料）

每個宮位包含以下字段：

- **name**: 宮位名稱（命宮、兄弟宮等）
- **branch**: 地支（子丑寅卯...）
- **stem**: 天干（甲乙丙丁...）
- **mainStars**: 14 主星列表
- **assistStars**: 輔星列表
- **transforms**: 四化飛星列表
- **decadeYears**: 大限年份區間 `[起, 止]`
- **flowYears**: 流年年份列表

---

## 🧪 測試

```bash
# 運行所有測試
pnpm test

# 運行特定測試
pnpm test tests/calendar.spec.ts
pnpm test tests/stars.spec.ts

# 生成覆蓋率報告
pnpm test --coverage
```

測試覆蓋：
- ✅ 農曆轉換算法
- ✅ 宮位排布（男女順逆）
- ✅ 14 主星安星
- ✅ 輔星安星
- ✅ 四化飛星
- ✅ 大限流年計算

---

## 📝 版本歷史

### v0.1.0 (2025-01-28)

**初始版本**

- ✅ 完整的紫微斗數排盤功能
- ✅ HTTP API 伺服器（Fastify）
- ✅ CLI 命令行工具
- ✅ Cloudflare Workers 支持
- ✅ 14 主星 + 輔星系統
- ✅ 生年四化 + 宮干飛化
- ✅ 大限流年計算
- ✅ 身宮顯示

---

## 🤝 貢獻指南

歡迎提交 Issue 和 Pull Request！

1. Fork 本倉庫
2. 創建特性分支 (`git checkout -b feature/AmazingFeature`)
3. 提交更改 (`git commit -m 'Add some AmazingFeature'`)
4. 推送到分支 (`git push origin feature/AmazingFeature`)
5. 提交 Pull Request

---

## 📄 授權協議

本項目採用 **MIT License** 授權。

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

## 🙏 致謝

- **lunar-javascript**: 農曆轉換庫
- **紫微斗數傳統算法**: 基於北派傳統口訣實現
- 參考項目：[iztro](https://github.com/SylarLong/iztro)

---

## 📧 聯繫方式

- **GitHub Issues**: [https://github.com/cka4913/zwds/issues](https://github.com/cka4913/zwds/issues)
- **項目主頁**: [https://github.com/cka4913/zwds](https://github.com/cka4913/zwds)

---

<div align="center">

**⭐ 如果這個項目對您有幫助，請給個 Star！**

Made with ❤️ by ZWDS Contributors

</div>
