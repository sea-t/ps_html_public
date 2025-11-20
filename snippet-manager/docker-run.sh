#!/bin/bash

# 🚀 一键启动脚本 - 使用预构建的 Docker 镜像
# 直接从 GitHub Container Registry 拉取镜像，无需本地构建

set -e

echo "════════════════════════════════════════════════════════════"
echo "  📦 代码片段 & 提示词管理器 - 一键启动"
echo "════════════════════════════════════════════════════════════"
echo ""

# 检查 Docker 是否安装
if ! command -v docker &> /dev/null; then
    echo "❌ 错误: Docker 未安装"
    echo "请先安装 Docker: https://docs.docker.com/get-docker/"
    exit 1
fi

# 检查 Docker Compose 是否安装
if ! command -v docker-compose &> /dev/null && ! docker compose version &> /dev/null; then
    echo "❌ 错误: Docker Compose 未安装"
    echo "请先安装 Docker Compose"
    exit 1
fi

# 检查是否存在 .env 文件
if [ ! -f .env ]; then
    echo "⚙️  创建配置文件..."
    if [ -f .env.example ]; then
        cp .env.example .env
        echo "✅ 已创建 .env 配置文件"
    else
        cat > .env << EOF
SECRET_KEY=$(openssl rand -hex 32)
DATABASE_URL=sqlite:///instance/snippets.db
FLASK_ENV=production
FLASK_APP=run.py
EOF
        echo "✅ 已创建 .env 配置文件（自动生成密钥）"
    fi
    echo ""
fi

echo "📥 拉取最新 Docker 镜像..."
docker-compose -f docker-compose.prod.yml pull

echo ""
echo "🚀 启动服务..."
docker-compose -f docker-compose.prod.yml up -d

echo ""
echo "⏳ 等待服务启动..."
sleep 5

# 检查服务状态
if docker-compose -f docker-compose.prod.yml ps | grep -q "Up"; then
    echo ""
    echo "════════════════════════════════════════════════════════════"
    echo "  ✅ 服务启动成功！"
    echo "════════════════════════════════════════════════════════════"
    echo ""
    echo "📊 访问地址："
    echo "   🌐 前端应用: http://localhost"
    echo "   🔌 后端API:  http://localhost:5000/api"
    echo ""
    echo "📝 常用命令："
    echo "   查看日志:    docker-compose -f docker-compose.prod.yml logs -f"
    echo "   停止服务:    docker-compose -f docker-compose.prod.yml down"
    echo "   重启服务:    docker-compose -f docker-compose.prod.yml restart"
    echo "   查看状态:    docker-compose -f docker-compose.prod.yml ps"
    echo ""
    echo "💡 首次使用建议："
    echo "   添加示例数据: ./docker-seed.sh"
    echo ""
    echo "════════════════════════════════════════════════════════════"
else
    echo ""
    echo "❌ 服务启动失败，请查看日志："
    echo "   docker-compose -f docker-compose.prod.yml logs"
    exit 1
fi
