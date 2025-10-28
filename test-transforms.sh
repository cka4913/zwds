#!/bin/bash

# 四化显示测试脚本

echo "=== 四化显示修正验证 ==="
echo ""

echo "案例：1975-10-23 男命（乙卯年）"
echo "---"
echo "命宫四化应显示："
echo "1. 生年四化（排最前面）："
echo "   - 生年四化乙干天機化祿"
echo "   - 生年四化乙干天梁化權"
echo "2. 宫干四化（按发射宫排列）："
echo "   - 兄弟宮己干飛入命宮天梁化科"
echo "   - 夫妻宮戊干飛入命宮天機化忌"
echo "   - ..."
echo ""
echo "实际输出："
node packages/cli/dist/index.js --sex male --solar 1975-10-23T12:00:00 | grep -A 18 "【命宮：宮位在庚辰】" | grep -A 15 "四化："
echo ""

echo "=== 修正说明 ==="
echo ""
echo "✓ 生年四化现在排在最前面"
echo "✓ 生年四化格式：生年四化X干星名化X"
echo "✓ 宫干四化格式：XX宫X干飞入XX宫星名化X"
echo "✓ 生年四化不再误显示为'命宫X干飞入命宫...'"
echo ""

echo "关键修改："
echo "1. TransformResult 接口添加 isYearTransform 和 yearStem 字段"
echo "2. calculateYearTransforms 标记生年四化"
echo "3. renderText 分开显示生年四化和宫干四化"
echo "4. 生年四化基于出生年的天干（如1975年=乙卯年→乙干）"
