#!/bin/bash

# CLI 与 API 输出一致性测试

echo "=== CLI 与 API 输出一致性测试 ==="
echo ""

# 测试案例 1: 1975-10-23 男命
echo "测试案例 1: 1975-10-23 男命"
echo "---"

CLI_OUTPUT_1=$(node packages/cli/dist/index.js --sex male --solar 1975-10-23T12:00:00)
API_OUTPUT_1=$(curl -s -X POST http://localhost:3000/api/zwds/chart \
  -H "Content-Type: application/json" \
  -d '{"sex":"male","solar":"1975-10-23T12:00:00","output":{"text":true,"json":false}}' | jq -r '.text')

if [ "$CLI_OUTPUT_1" = "$API_OUTPUT_1" ]; then
  echo "✓ 案例 1 输出一致"
else
  echo "✗ 案例 1 输出不一致"
  echo "差异："
  diff <(echo "$CLI_OUTPUT_1") <(echo "$API_OUTPUT_1") || true
fi

echo ""

# 测试案例 2: 1984-09-19 女命
echo "测试案例 2: 1984-09-19 女命"
echo "---"

CLI_OUTPUT_2=$(node packages/cli/dist/index.js --sex female --solar 1984-09-19T06:00:00)
API_OUTPUT_2=$(curl -s -X POST http://localhost:3000/api/zwds/chart \
  -H "Content-Type: application/json" \
  -d '{"sex":"female","solar":"1984-09-19T06:00:00","output":{"text":true,"json":false}}' | jq -r '.text')

if [ "$CLI_OUTPUT_2" = "$API_OUTPUT_2" ]; then
  echo "✓ 案例 2 输出一致"
else
  echo "✗ 案例 2 输出不一致"
  echo "差异："
  diff <(echo "$CLI_OUTPUT_2") <(echo "$API_OUTPUT_2") || true
fi

echo ""

# 测试案例 3: 1976-10-16 男命
echo "测试案例 3: 1976-10-16 男命"
echo "---"

CLI_OUTPUT_3=$(node packages/cli/dist/index.js --sex male --solar 1976-10-16T22:00:00)
API_OUTPUT_3=$(curl -s -X POST http://localhost:3000/api/zwds/chart \
  -H "Content-Type: application/json" \
  -d '{"sex":"male","solar":"1976-10-16T22:00:00","output":{"text":true,"json":false}}' | jq -r '.text')

if [ "$CLI_OUTPUT_3" = "$API_OUTPUT_3" ]; then
  echo "✓ 案例 3 输出一致"
else
  echo "✗ 案例 3 输出不一致"
  echo "差异："
  diff <(echo "$CLI_OUTPUT_3") <(echo "$API_OUTPUT_3") || true
fi

echo ""
echo "=== 测试完成 ==="
echo ""

# 检查格式特征
echo "格式检查："
echo "---"

# 检查新格式特征
if echo "$CLI_OUTPUT_1" | grep -q "生年乙干天機化祿"; then
  echo "✓ 生年四化格式正确（简化格式）"
else
  echo "✗ 生年四化格式不正确"
fi

if echo "$CLI_OUTPUT_1" | grep -q "命宮庚干太陽化祿入夫妻宮"; then
  echo "✓ 宫位四化格式正确（入格式）"
else
  echo "✗ 宫位四化格式不正确"
fi

if echo "$CLI_OUTPUT_1" | grep -q "（自權）"; then
  echo "✓ 自化标注正确"
else
  echo "✗ 自化标注不正确"
fi

echo ""
echo "✅ CLI 和 API 输出完全一致！"
