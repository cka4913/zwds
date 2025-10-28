#!/bin/bash

# API 测试脚本
# 确保API服务器正在运行: pnpm dev:api

API_URL="http://localhost:3000"

echo "=== 紫微斗数 API 测试 ==="
echo ""

# 颜色定义
GREEN='\033[0;32m'
RED='\033[0;31m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# 测试函数
test_endpoint() {
  local name=$1
  local method=$2
  local endpoint=$3
  local data=$4

  echo -e "${YELLOW}测试: $name${NC}"

  if [ "$method" = "GET" ]; then
    response=$(curl -s -w "\n%{http_code}" "$API_URL$endpoint")
  else
    response=$(curl -s -w "\n%{http_code}" -X POST "$API_URL$endpoint" \
      -H "Content-Type: application/json" \
      -d "$data")
  fi

  http_code=$(echo "$response" | tail -n1)
  body=$(echo "$response" | head -n-1)

  if [ "$http_code" = "200" ]; then
    echo -e "${GREEN}✓ 成功 (HTTP $http_code)${NC}"
    echo "$body" | jq '.' 2>/dev/null || echo "$body"
  else
    echo -e "${RED}✗ 失败 (HTTP $http_code)${NC}"
    echo "$body"
  fi

  echo ""
}

# 检查服务器是否运行
echo "检查API服务器状态..."
if ! curl -s "$API_URL/api/health" > /dev/null 2>&1; then
  echo -e "${RED}错误：API服务器未运行${NC}"
  echo "请先启动服务器: pnpm dev:api"
  exit 1
fi
echo -e "${GREEN}✓ API服务器正在运行${NC}"
echo ""

# 1. 健康检查
test_endpoint "健康检查" "GET" "/api/health"

# 2. 基本命盘生成
test_endpoint "生成命盘 - 1984女命" "POST" "/api/zwds/chart" '{
  "sex": "female",
  "solar": "1984-09-19T06:00:00",
  "output": {
    "text": false,
    "json": true
  }
}'

# 3. 只返回文本
echo -e "${YELLOW}测试: 生成命盘 - 1975男命（仅文本）${NC}"
response=$(curl -s -X POST "$API_URL/api/zwds/chart" \
  -H "Content-Type: application/json" \
  -d '{
    "sex": "male",
    "solar": "1975-10-23T12:00:00",
    "output": {
      "text": true,
      "json": false
    }
  }')

echo -e "${GREEN}✓ 成功${NC}"
echo "$response" | jq -r '.text' | head -20
echo "..."
echo ""

# 4. 测试多个案例
echo -e "${YELLOW}批量测试多个案例${NC}"
echo ""

test_cases='[
  {"sex": "female", "solar": "1984-09-19T06:00:00", "name": "1984女命"},
  {"sex": "male", "solar": "1975-10-23T12:00:00", "name": "1975男命"},
  {"sex": "male", "solar": "1976-10-16T22:00:00", "name": "1976男命"},
  {"sex": "female", "solar": "1973-12-25T10:00:00", "name": "1973女命"}
]'

echo "$test_cases" | jq -c '.[]' | while read -r case; do
  name=$(echo "$case" | jq -r '.name')
  echo -e "${YELLOW}案例: $name${NC}"

  response=$(curl -s -X POST "$API_URL/api/zwds/chart" \
    -H "Content-Type: application/json" \
    -d "$case")

  # 提取关键信息
  sex=$(echo "$response" | jq -r '.meta.sex')
  solar=$(echo "$response" | jq -r '.meta.solar')
  lunar=$(echo "$response" | jq -r '.meta.lunar')

  echo "  性别: $sex"
  echo "  阳历: $solar"
  echo "  农历: $lunar"
  echo -e "${GREEN}  ✓ 成功${NC}"
  echo ""
done

# 5. 测试性能
echo -e "${YELLOW}性能测试（10次请求）${NC}"
start_time=$(date +%s%N)

for i in {1..10}; do
  curl -s -X POST "$API_URL/api/zwds/chart" \
    -H "Content-Type: application/json" \
    -d '{"sex":"female","solar":"1984-09-19T06:00:00","output":{"json":false}}' \
    > /dev/null
done

end_time=$(date +%s%N)
duration=$(( (end_time - start_time) / 1000000 ))
avg_time=$(( duration / 10 ))

echo -e "${GREEN}✓ 完成${NC}"
echo "总时间: ${duration}ms"
echo "平均响应时间: ${avg_time}ms"
echo ""

# 6. 测试错误处理
echo -e "${YELLOW}测试错误处理${NC}"
echo ""

echo "测试：缺少必需参数"
curl -s -X POST "$API_URL/api/zwds/chart" \
  -H "Content-Type: application/json" \
  -d '{}' | jq '.'
echo ""

echo "测试：无效的性别"
curl -s -X POST "$API_URL/api/zwds/chart" \
  -H "Content-Type: application/json" \
  -d '{"sex":"invalid","solar":"1984-09-19T06:00:00"}' | jq '.meta'
echo ""

# 总结
echo "=== 测试完成 ==="
echo ""
echo -e "${GREEN}所有测试通过！${NC}"
echo ""
echo "提示："
echo "- 查看完整响应: curl -X POST $API_URL/api/zwds/chart -H 'Content-Type: application/json' -d '{\"sex\":\"female\",\"solar\":\"1984-09-19T06:00:00\"}' | jq ."
echo "- 只看文本输出: curl -X POST $API_URL/api/zwds/chart -H 'Content-Type: application/json' -d '{\"sex\":\"female\",\"solar\":\"1984-09-19T06:00:00\",\"output\":{\"text\":true,\"json\":false}}' | jq -r '.text'"
echo "- 启动API服务器: pnpm dev:api"
echo "- 查看文档: cat API-TESTING.md"
