# API 测试指南

## 启动API服务器

```bash
# 方法1：使用pnpm（推荐）
pnpm dev:api

# 方法2：直接运行编译后的文件
node packages/api/dist/server.js

# 方法3：指定端口
PORT=8080 pnpm dev:api
```

默认端口：`3000`
服务器会监听：`http://localhost:3000`

## API 端点

### 1. 健康检查

**端点**: `GET /api/health`

**用途**: 检查API服务器是否正常运行

**请求示例**:
```bash
curl http://localhost:3000/api/health
```

**响应**:
```json
{"ok": true}
```

---

### 2. 生成命盘

**端点**: `POST /api/zwds/chart`

**用途**: 根据出生信息生成紫微斗数命盘

**请求参数**:
```json
{
  "sex": "male" | "female",    // 性别（必需）
  "solar": "YYYY-MM-DDTHH:mm:ss",  // 阳历生日（必需）
  "tz": "Asia/Hong_Kong",      // 时区（可选，默认Asia/Hong_Kong）
  "output": {                  // 输出格式（可选）
    "text": true,              // 是否返回文本格式
    "json": true               // 是否返回JSON格式
  }
}
```

**请求示例1 - 基本用法**:
```bash
curl -X POST http://localhost:3000/api/zwds/chart \
  -H "Content-Type: application/json" \
  -d '{
    "sex": "female",
    "solar": "1984-09-19T06:00:00"
  }'
```

**请求示例2 - 只返回文本**:
```bash
curl -X POST http://localhost:3000/api/zwds/chart \
  -H "Content-Type: application/json" \
  -d '{
    "sex": "male",
    "solar": "1975-10-23T12:00:00",
    "output": {
      "text": true,
      "json": false
    }
  }'
```

**请求示例3 - 使用jq美化输出**:
```bash
curl -X POST http://localhost:3000/api/zwds/chart \
  -H "Content-Type: application/json" \
  -d '{
    "sex": "female",
    "solar": "1973-12-25T10:00:00"
  }' | jq .
```

**响应格式**:
```json
{
  "meta": {
    "sex": "female",
    "solar": "1984-09-19T06:00:00",
    "lunar": "1984-08-24T06:00:00",
    "tz": "Asia/Hong_Kong"
  },
  "chart": {
    "meta": {...},
    "palaces": {
      "命宮": {
        "layer": "本命",
        "name": "命宮",
        "branch": "午",
        "stem": "庚",
        "mainStars": [...],
        "assistStars": [...],
        "transforms": [...],
        "decadeYears": [1988, 1997],
        "flowYears": [...]
      },
      ...
    }
  },
  "text": "性別：女\n陽曆生日：1984 年 9 月 19 日 6 時\n..."
}
```

---

### 3. 搜索（尚未实现）

**端点**: `POST /api/zwds/search`

**状态**: 🚧 开发中

---

## 使用不同工具测试

### 使用 curl

**基本请求**:
```bash
curl -X POST http://localhost:3000/api/zwds/chart \
  -H "Content-Type: application/json" \
  -d '{"sex":"female","solar":"1984-09-19T06:00:00"}'
```

**只获取文本输出**:
```bash
curl -X POST http://localhost:3000/api/zwds/chart \
  -H "Content-Type: application/json" \
  -d '{"sex":"male","solar":"1976-10-16T22:00:00","output":{"text":true,"json":false}}' \
  | jq -r '.text'
```

### 使用 HTTPie (更友好的HTTP客户端)

**安装**:
```bash
brew install httpie  # macOS
```

**请求**:
```bash
http POST localhost:3000/api/zwds/chart \
  sex=female \
  solar=1984-09-19T06:00:00
```

### 使用 Postman

1. 打开 Postman
2. 创建新请求：`POST http://localhost:3000/api/zwds/chart`
3. 选择 Body → raw → JSON
4. 输入请求数据：
   ```json
   {
     "sex": "female",
     "solar": "1984-09-19T06:00:00"
   }
   ```
5. 点击 Send

### 使用 JavaScript/Node.js

```javascript
const response = await fetch('http://localhost:3000/api/zwds/chart', {
  method: 'POST',
  headers: {
    'Content-Type': 'application/json',
  },
  body: JSON.stringify({
    sex: 'female',
    solar: '1984-09-19T06:00:00'
  })
});

const data = await response.json();
console.log(data.text);
```

### 使用 Python

```python
import requests

response = requests.post(
    'http://localhost:3000/api/zwds/chart',
    json={
        'sex': 'female',
        'solar': '1984-09-19T06:00:00'
    }
)

data = response.json()
print(data['text'])
```

---

## 测试脚本

我们提供了一个测试脚本 `test-api.sh`，可以快速测试所有功能：

```bash
chmod +x test-api.sh
./test-api.sh
```

---

## 常见问题

### Q: 端口被占用怎么办？
A: 指定其他端口：
```bash
PORT=8080 pnpm dev:api
# 然后使用 http://localhost:8080 访问
```

### Q: 如何查看详细的请求日志？
A: Fastify会在控制台显示所有请求日志

### Q: 响应太大怎么办？
A: 使用 `output.json: false` 只返回文本：
```bash
curl -X POST http://localhost:3000/api/zwds/chart \
  -H "Content-Type: application/json" \
  -d '{"sex":"female","solar":"1984-09-19T06:00:00","output":{"json":false}}'
```

### Q: 如何在生产环境使用？
A:
```bash
# 1. 构建
pnpm build

# 2. 运行
NODE_ENV=production PORT=3000 node packages/api/dist/server.js
```

---

## 高级用法

### 批量测试多个命盘

创建测试数据文件 `test-data.json`:
```json
[
  {"sex": "female", "solar": "1984-09-19T06:00:00"},
  {"sex": "male", "solar": "1975-10-23T12:00:00"},
  {"sex": "male", "solar": "1976-10-16T22:00:00"}
]
```

使用脚本批量测试：
```bash
cat test-data.json | jq -c '.[]' | while read line; do
  echo "Testing: $line"
  curl -X POST http://localhost:3000/api/zwds/chart \
    -H "Content-Type: application/json" \
    -d "$line" | jq '.meta'
  echo "---"
done
```

### 性能测试

使用 `ab` (Apache Bench):
```bash
# 安装 ab
brew install httpd  # macOS

# 运行性能测试（1000个请求，10个并发）
ab -n 1000 -c 10 -p request.json -T application/json \
  http://localhost:3000/api/zwds/chart
```

`request.json`:
```json
{"sex":"female","solar":"1984-09-19T06:00:00","output":{"json":false}}
```

---

## 下一步

- [ ] 实现搜索API (`/api/zwds/search`)
- [ ] 添加API文档 (Swagger/OpenAPI)
- [ ] 添加速率限制
- [ ] 添加认证/授权
- [ ] 部署到云服务
