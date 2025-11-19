#!/bin/bash

# Docker 启动脚本 - 开发环境

echo "🚀 启动代码片段管理器（开发环境）..."

# 构建并启动容器
echo "📦 构建 Docker 镜像..."
docker-compose -f docker-compose.dev.yml build

echo "🔄 启动容器..."
docker-compose -f docker-compose.dev.yml up -d

echo ""
echo "✅ 开发环境已启动！"
echo ""
echo "📊 访问地址："
echo "   前端: http://localhost:3000"
echo "   后端API: http://localhost:5000/api"
echo ""
echo "📝 查看日志："
echo "   docker-compose -f docker-compose.dev.yml logs -f"
echo ""
echo "🛑 停止服务："
echo "   docker-compose -f docker-compose.dev.yml down"
echo ""
echo "💡 提示: 代码修改会自动重载"
echo ""
