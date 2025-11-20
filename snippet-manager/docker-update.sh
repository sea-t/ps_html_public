#!/bin/bash

# 🔄 更新脚本 - 拉取最新镜像并重启服务

set -e

echo "════════════════════════════════════════════════════════════"
echo "  🔄 更新代码片段管理器"
echo "════════════════════════════════════════════════════════════"
echo ""

echo "📥 拉取最新 Docker 镜像..."
docker-compose -f docker-compose.prod.yml pull

echo ""
echo "🔄 重启服务..."
docker-compose -f docker-compose.prod.yml up -d

echo ""
echo "⏳ 等待服务启动..."
sleep 5

echo ""
echo "✅ 更新完成！"
echo ""
echo "📊 访问地址: http://localhost"
echo ""
