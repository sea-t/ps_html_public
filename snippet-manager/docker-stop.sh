#!/bin/bash

# Docker 停止脚本

echo "🛑 停止代码片段管理器..."

# 检查是否有运行的容器
if docker-compose ps | grep -q "Up"; then
    docker-compose down
    echo "✅ 生产环境已停止"
fi

if docker-compose -f docker-compose.dev.yml ps 2>/dev/null | grep -q "Up"; then
    docker-compose -f docker-compose.dev.yml down
    echo "✅ 开发环境已停止"
fi

echo ""
echo "所有服务已停止"
echo ""
echo "💾 数据已保存在 Docker volumes 中"
echo "🗑️  如需删除所有数据，运行: docker-compose down -v"
echo ""
