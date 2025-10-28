# API 快速开始指南

## 🚀 5分钟快速上手

### 步骤1：启动API服务器

打开终端，进入项目目录：

```bash
cd /Users/cka/Developer/zwds

# 启动API服务器
pnpm dev:api
```

你应该看到：
```
ZWDS API listening on :3000
```

**保持这个终端窗口打开！**

---

### 步骤2：选择测试方式

你有三种测试方式可选：

#### 方式A：使用自动化测试脚本（推荐新手）

打开**新的终端窗口**，运行：

```bash
cd /Users/cka/Developer/zwds
./test-api.sh
```

这会自动运行所有测试案例并显示结果。

#### 方式B：使用浏览器（最直观）

1. 用浏览器打开文件：
   ```bash
   open test-api.html
   # 或直接双击 test-api.html 文件
   ```

2. 在网页中：
   - 检查API状态（应该显示"✓ 运行中"）
   - 点击快速测试按钮（如"1984女命"）
   - 或手动输入出生信息
   - 点击"生成命盘"

#### 方式C：使用curl命令（适合开发者）

打开**新的终端窗口**，运行：

```bash
# 测试1：健康检查
curl http://localhost:3000/api/health

# 测试2：生成命盘
curl -X POST http://localhost:3000/api/zwds/chart \
  -H "Content-Type: application/json" \
  -d '{
    "sex": "female",
    "solar": "1984-09-19T06:00:00"
  }'

# 测试3：只返回文本（更易读）
curl -X POST http://localhost:3000/api/zwds/chart \
  -H "Content-Type: application/json" \
  -d '{
    "sex": "female",
    "solar": "1984-09-19T06:00:00",
    "output": {"text": true, "json": false}
  }' | jq -r '.text'
```

---

## 📝 基本用法示例

### 示例1：生成女命命盘

**请求**：
```bash
curl -X POST http://localhost:3000/api/zwds/chart \
  -H "Content-Type: application/json" \
  -d '{
    "sex": "female",
    "solar": "1984-09-19T06:00:00"
  }'
```

**响应**（部分）：
```json
{
  "meta": {
    "sex": "female",
    "solar": "1984-09-19T06:00:00",
    "lunar": "1984-08-24T06:00:00",
    "tz": "Asia/Hong_Kong"
  },
  "chart": {
    "palaces": {
      "命宮": {
        "name": "命宮",
        "branch": "午",
        "stem": "庚",
        "mainStars": [...],
        "decadeYears": [1988, 1997],
        "flowYears": [...]
      }
    }
  },
  "text": "性別：女\n陽曆生日：1984 年 9 月 19 日 6 時\n..."
}
```

### 示例2：只获取文本输出

**请求**：
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
  }' | jq -r '.text'
```

**响应**：
```
性別：男
陽曆生日：1975 年 10 月 23 日 12 時
農曆生日：1975 年 9 月 19 日 午 時
命局：金四局，陰男

【命宮：宮位在庚辰】
大限年份：1978-1987
流年年份：1904,1916,1928,1940,1952,1964,1976,1988,2000,2012,2024,2036
主星有：天機利．天梁廟
輔星有：文昌旺．擎羊廟
四化：
．生年四化乙干天機化祿
．生年四化乙干天梁化權
...
```

---

## 🛠️ 常见问题解决

### Q: 看到"curl: (7) Failed to connect"错误？

**原因**：API服务器没有运行

**解决**：
```bash
# 打开新终端
cd /Users/cka/Developer/zwds
pnpm dev:api
```

---

### Q: 浏览器显示"✗ 未运行"？

**原因**：API服务器未启动或端口被占用

**解决**：
1. 检查终端是否显示 "ZWDS API listening on :3000"
2. 如果端口被占用，使用其他端口：
   ```bash
   PORT=8080 pnpm dev:api
   ```
   然后修改浏览器中的API地址为 `http://localhost:8080`

---

### Q: 如何安装jq（用于美化JSON输出）？

**macOS**：
```bash
brew install jq
```

**不想安装jq？** 使用Python：
```bash
curl ... | python -m json.tool
```

---

## 📚 进阶用法

### 批量测试多个命盘

创建文件 `batch-test.sh`：
```bash
#!/bin/bash

cases=(
  '{"sex":"female","solar":"1984-09-19T06:00:00"}'
  '{"sex":"male","solar":"1975-10-23T12:00:00"}'
  '{"sex":"male","solar":"1976-10-16T22:00:00"}'
)

for case in "${cases[@]}"; do
  echo "测试: $case"
  curl -s -X POST http://localhost:3000/api/zwds/chart \
    -H "Content-Type: application/json" \
    -d "$case" | jq '.meta'
  echo "---"
done
```

运行：
```bash
chmod +x batch-test.sh
./batch-test.sh
```

---

### 使用Postman测试

1. 打开Postman
2. 创建新请求
3. 设置：
   - **方法**：POST
   - **URL**：`http://localhost:3000/api/zwds/chart`
   - **Headers**：`Content-Type: application/json`
   - **Body**：选择 `raw` → `JSON`
   ```json
   {
     "sex": "female",
     "solar": "1984-09-19T06:00:00"
   }
   ```
4. 点击 **Send**

---

## 🎯 测试检查清单

完成以下测试确保API正常工作：

- [ ] ✓ 健康检查返回 `{"ok": true}`
- [ ] ✓ 生成1984女命命盘成功
- [ ] ✓ 生成1975男命命盘成功
- [ ] ✓ 只返回文本格式成功
- [ ] ✓ 同时返回文本和JSON成功
- [ ] ✓ 浏览器测试页面可以正常使用

---

## 📖 更多文档

- 完整API文档：`API-TESTING.md`
- 自动化测试：`./test-api.sh`
- 浏览器测试：`test-api.html`

---

## 💡 小技巧

**1. 快速查看命盘文本**：
```bash
alias zwds='curl -s -X POST http://localhost:3000/api/zwds/chart -H "Content-Type: application/json" -d'
zwds '{"sex":"female","solar":"1984-09-19T06:00:00","output":{"json":false}}' | jq -r '.text'
```

**2. 保存响应到文件**：
```bash
curl -X POST http://localhost:3000/api/zwds/chart \
  -H "Content-Type: application/json" \
  -d '{"sex":"female","solar":"1984-09-19T06:00:00"}' \
  > chart-1984f.json
```

**3. 美化JSON显示**：
```bash
curl ... | jq '.' | less
```

---

## 🎉 完成！

现在你已经学会如何使用API了！试试生成你自己的命盘吧。

有问题？查看 `API-TESTING.md` 获取更详细的文档。
