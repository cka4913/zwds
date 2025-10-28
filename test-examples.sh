#!/bin/bash

# 紫微斗数命盘测试脚本

echo "=== 紫微斗数命盘测试案例 ==="
echo ""

echo "案例1: 1984-09-19 06:00 女命（甲年，阳女，土五局）"
node packages/cli/dist/index.js --sex female --solar 1984-09-19T06:00:00 | head -20
echo ""
echo "---"
echo ""

echo "案例2: 1975-10-23 12:00 男命（乙年，阴男，金四局）"
node packages/cli/dist/index.js --sex male --solar 1975-10-23T12:00:00 | head -20
echo ""
echo "---"
echo ""

echo "案例3: 1976-10-16 22:00 男命（丙年，阳男，木三局）"
node packages/cli/dist/index.js --sex male --solar 1976-10-16T22:00:00 | head -20
echo ""
echo "---"
echo ""

echo "案例4: 1990-05-15 14:30 女命（庚年，阳女，应该逆行）"
node packages/cli/dist/index.js --sex female --solar 1990-05-15T14:30:00 | head -20
echo ""

echo "=== 测试完成 ==="
