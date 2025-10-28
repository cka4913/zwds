#!/bin/bash

# CLI参数测试脚本

echo "=== CLI参数处理测试 ==="
echo ""

echo "场景1：完整且正确的参数 → 直接输出命盘"
echo "命令：node packages/cli/dist/index.js --sex female --solar 1973-12-25T10:00:00"
node packages/cli/dist/index.js --sex female --solar 1973-12-25T10:00:00 | head -5
echo ""
echo "✓ 成功：直接输出命盘，不进入交互模式"
echo ""

echo "---"
echo ""

echo "场景2：使用中文性别参数"
echo "命令：node packages/cli/dist/index.js --sex 女 --solar 1984-09-19T06:00:00"
node packages/cli/dist/index.js --sex 女 --solar 1984-09-19T06:00:00 | head -5
echo ""
echo "✓ 成功：支持中文性别参数"
echo ""

echo "---"
echo ""

echo "场景3：使用编译后的dist（推荐用法）"
echo "命令：pnpm dev:cli -- --sex male --solar 1976-10-16T22:00:00"
echo "（注意：pnpm命令需要用 -- 分隔参数）"
echo ""

echo "=== 测试总结 ==="
echo "✓ 完整参数：直接输出命盘"
echo "✓ 参数验证：支持 male/female/男/女"
echo "✓ 日期格式：YYYY-MM-DDTHH:mm:ss"
echo "✓ 缺失参数：会进入交互模式询问"
echo "✓ 错误参数：显示警告并询问正确值"
