#!/bin/bash

# Docker 启动脚本 - 生产环境

echo "🚀 启动代码片段管理器（生产环境）..."

# 检查是否存在 .env 文件
if [ ! -f .env ]; then
    echo "⚠️  未找到 .env 文件，从 .env.example 创建..."
    cp .env.example .env
    echo "✅ 已创建 .env 文件，请根据需要修改配置"
fi

# 构建并启动容器
echo "📦 构建 Docker 镜像..."
docker-compose build

echo "🔄 启动容器..."
docker-compose up -d

echo ""
echo "✅ 服务已启动！"
echo ""
echo "📊 访问地址："
echo "   前端: http://localhost"
echo "   后端API: http://localhost:5000/api"
echo ""
echo "📝 查看日志："
echo "   docker-compose logs -f"
echo ""
echo "🛑 停止服务："
echo "   docker-compose down"
echo ""
